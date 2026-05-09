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
    const conversations = await prisma.conversation.findMany({
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
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })
    res.json({ conversations })
  } catch (err) {
    console.error('[GET /messages/conversations]', err)
    res.status(500).json({ error: 'Could not fetch conversations.' })
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

module.exports = router
