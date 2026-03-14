const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

router.use(protect)

// POST /api/chat/session — start a new chat session
router.post('/session', async (req, res) => {
  try {
    const session = await prisma.chatSession.create({
      data: {
        userId:      req.user.id,
        title:       'New Conversation',
        sessionType: 'ai_support',
        aiModelUsed: 'claude-sonnet-4-6',
      }
    })
    res.status(201).json({ session })
  } catch (err) {
    res.status(500).json({ error: 'Could not start chat session.' })
  }
})

// POST /api/chat/message — send a message and get AI reply
// Body: { sessionId, content }
router.post('/message', async (req, res) => {
  try {
    const { sessionId, content } = req.body
    if (!sessionId || !content) {
      return res.status(400).json({ error: 'sessionId and content are required.' })
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: req.user.id }
    })
    if (!session) return res.status(404).json({ error: 'Session not found.' })

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId, senderRole: 'user', content }
    })

    // ── AI REPLY ─────────────────────────────────────────────────────────────
    // For now, returns a placeholder. When you're ready, replace this block
    // with an actual OpenAI/Claude API call using process.env.OPENAI_API_KEY
    const aiReply = generatePlaceholderReply(content)

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderRole:  'assistant',
        content:     aiReply,
        contentType: 'text',
        aiMetadata:  { model: 'placeholder', timestamp: new Date() }
      }
    })

    // Award points for using chat
    await prisma.reward.create({
      data: {
        userId:      req.user.id,
        actionType:  'CHAT_SESSION',
        pointsEarned: 5,
        description: 'Used AI chat support'
      }
    })

    res.json({ message: assistantMessage })

  } catch (err) {
    console.error('[POST /chat/message]', err)
    res.status(500).json({ error: 'Could not send message.' })
  }
})

// GET /api/chat/sessions — all past sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where:   { userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      include: { _count: { select: { messages: true } } }
    })
    res.json({ sessions })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch sessions.' })
  }
})

// GET /api/chat/session/:id/messages
router.get('/session/:id/messages', async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!session) return res.status(404).json({ error: 'Session not found.' })

    const messages = await prisma.chatMessage.findMany({
      where:   { sessionId: req.params.id },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ messages })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch messages.' })
  }
})

// ─── Placeholder AI replies ───────────────────────────────────────────────────
// Replace this whole function with a real OpenAI/Claude API call later
function generatePlaceholderReply(userMessage) {
  const msg = userMessage.toLowerCase()
  if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('worried')) {
    return "I hear you — anxiety can feel overwhelming. Let's try a quick grounding exercise: name 5 things you can see right now. This helps bring your focus back to the present moment. 🌿"
  }
  if (msg.includes('sad') || msg.includes('depressed') || msg.includes('crying')) {
    return "It's okay to feel sad. Your feelings are valid. Would you like to talk about what's on your mind, or would a guided breathing exercise help right now? 💙"
  }
  if (msg.includes('stress') || msg.includes('overwhelmed')) {
    return "Feeling overwhelmed is tough. Let's break things down — what's the single most pressing thing on your mind right now? Sometimes naming it helps reduce its weight. 🌊"
  }
  if (msg.includes('happy') || msg.includes('good') || msg.includes('great')) {
    return "That's wonderful to hear! Holding onto positive moments matters. What's been making you feel this way? 😊"
  }
  return "Thank you for sharing that with me. I'm here to listen and support you. Could you tell me a bit more about what you're experiencing right now? 💜"
}

module.exports = router
