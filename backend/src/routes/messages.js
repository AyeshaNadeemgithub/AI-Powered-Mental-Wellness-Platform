const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

router.use(protect)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/conversations — list all conversations for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.id
    const rawConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { patientId: userId },
          { psychologistId: userId }
        ]
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        psychologist: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    const conversations = rawConversations.map(c => ({
      ...c,
      unreadCount: c._count.messages
    }))

    res.json({ conversations })
  } catch (err) {
    console.error('[GET /messages/conversations]', err)
    res.status(500).json({ error: 'Could not fetch conversations.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/unread-count — total unread messages across all chats
// ─────────────────────────────────────────────────────────────────────────────
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [
            { patientId: userId },
            { psychologistId: userId }
          ]
        },
        senderId: { not: userId },
        isRead: false
      }
    })
    res.json({ count })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch unread count.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/messages — send a message
// Body: { receiverId, content }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { receiverId, content } = req.body
    const senderId = req.user.id

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'receiverId and content are required.' })
    }

    // Identify roles to find or create conversation
    // We assume sender and receiver have different roles (Patient <-> Psychologist)
    const sender = await prisma.user.findUnique({ where: { id: senderId } })
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } })

    if (!receiver) return res.status(404).json({ error: 'Receiver not found.' })

    const patientId = sender.role === 'PATIENT' ? senderId : receiverId
    const psychologistId = sender.role === 'PSYCHOLOGIST' ? senderId : receiverId

    // 1. Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: {
        patientId_psychologistId: { patientId, psychologistId }
      }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { patientId, psychologistId }
      })
    }

    // 2. Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: senderId,
        content: content
      }
    })

    // 3. Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content,
        lastMessageAt: new Date()
      }
    })

    // 4. Emit socket event
    const io = req.app.get('io');
    if (io) {
      const messageWithSender = await prisma.message.findUnique({
        where: { id: message.id },
        include: { sender: { select: { id: true, firstName: true, avatarUrl: true } } }
      });
      io.to(`conv_${conversation.id}`).emit('new_message', messageWithSender);

      // Global notification for toast
      const { getConnectedUsers } = require('../../socket');
      const connectedUsers = getConnectedUsers();
      const recipientId = conversation.patientId === senderId ? conversation.psychologistId : conversation.patientId;
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message_notification', {
          conversationId: conversation.id,
          content: content,
          senderName: sender.firstName
        });
      }
    }

    res.status(201).json({ message })
  } catch (err) {
    console.error('[POST /messages]', err)
    res.status(500).json({ error: 'Could not send message.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/messages/:conversationId — get message history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.id

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation || (conversation.patientId !== userId && conversation.psychologistId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized to view this conversation.' })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } }
    })

    res.json({ messages })
  } catch (err) {
    console.error('[GET /messages/:id]', err)
    res.status(500).json({ error: 'Could not fetch messages.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/messages/:conversationId — delete a conversation
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user.id

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation || (conversation.patientId !== userId && conversation.psychologistId !== userId)) {
      return res.status(403).json({ error: 'Unauthorized to delete this conversation.' })
    }

    // Delete messages first (Prisma might handle this with cascade, but let's be safe)
    await prisma.message.deleteMany({
      where: { conversationId }
    })

    // Delete conversation
    await prisma.conversation.delete({
      where: { id: conversationId }
    })

    res.json({ success: true, message: 'Conversation deleted.' })
  } catch (err) {
    console.error('[DELETE /messages/:id]', err)
    res.status(500).json({ error: 'Could not delete conversation.' })
  }
})

module.exports = router
