const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const { protect } = require('../middleware/auth')
const Groq = require('groq-sdk')

router.use(protect)

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/session  — create a new session for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.post('/session', async (req, res) => {
  try {
    const session = await prisma.chatSession.create({
      data: {
        userId: req.user.id,
        title: 'New Conversation',
        sessionType: 'ai_support',
        aiModelUsed: 'llama-3.3-70b-versatile',
      }
    })
    res.status(201).json({ session })
  } catch (err) {
    console.error('[POST /chat/session]', err)
    res.status(500).json({ error: 'Could not start chat session.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/sessions  — list all past sessions for the logged-in user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      include: { _count: { select: { messages: true } } }
    })
    res.json({ sessions })
  } catch (err) {
    console.error('[GET /chat/sessions]', err)
    res.status(500).json({ error: 'Could not fetch sessions.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/session/:id/messages  — load full history for one session
// ─────────────────────────────────────────────────────────────────────────────
router.get('/session/:id/messages', async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!session) return res.status(404).json({ error: 'Session not found.' })

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: req.params.id },
      orderBy: { createdAt: 'asc' }
    })
    res.json({ messages })
  } catch (err) {
    console.error('[GET /chat/session/:id/messages]', err)
    res.status(500).json({ error: 'Could not fetch messages.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/message  — send a user message, get a Groq AI reply
// Body: { sessionId, content }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/message', async (req, res) => {
  try {
    const { sessionId, content } = req.body

    if (!sessionId || !content) {
      return res.status(400).json({ error: 'sessionId and content are required.' })
    }

    // 1. Verify session belongs to this user
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: req.user.id }
    })
    if (!session) return res.status(404).json({ error: 'Session not found.' })

    // 2. Fetch existing message history before saving the new one
    const existingMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 30
    })

    const isFirstMessage = existingMessages.length === 0

    // 3. Save the user message to the database
    await prisma.chatMessage.create({
      data: { sessionId, senderRole: 'user', content }
    })

    // 4. Build messages array for Groq
    //    Groq uses OpenAI-compatible format: system + user/assistant turns
    const messages = [
      {
        role: 'system',
        content: `You are CalmMind AI, a compassionate and professional mental wellness companion embedded in the CalmMind app.

Your purpose:
- Provide empathetic emotional support and a safe space for patients to express themselves
- Guide users through breathing exercises, grounding techniques, and simple coping strategies
- Help users reflect on their mood, thoughts, and feelings
- Gently encourage users to seek professional help when appropriate

Rules you must always follow:
- NEVER diagnose any mental health condition
- NEVER recommend or suggest any medication
- NEVER claim to be a substitute for a licensed psychologist or therapist
- If a user mentions self-harm, suicide, or a mental health crisis: immediately respond with empathy AND urge them to contact a crisis helpline or mental health professional right away. Include this message: "Please reach out to a mental health professional or crisis line immediately. In Pakistan you can call Umang helpline at 0311-7786264."
- Keep responses warm, concise, and human — 2 to 5 sentences unless the situation clearly needs more
- Use supportive language. Never dismiss or minimise what the user is feeling
- You may use relevant emojis occasionally to keep the tone warm but not excessive`
      },
      // Add conversation history
      ...existingMessages.map(m => ({
        role: m.senderRole === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      // Add the new user message
      {
        role: 'user',
        content: content
      }
    ]

    // 5. Call Groq API
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    })

    let aiReply = completion.choices[0]?.message?.content || 'I am here for you. Could you tell me more about how you are feeling? 💜'

    // 6. Prepend disclaimer on the very first message of every new session
    if (isFirstMessage) {
      aiReply = `⚠️ Important: I am CalmMind AI — a mental wellness companion. I am NOT a replacement for a licensed psychologist or therapist. If you are experiencing a mental health crisis, please seek professional help immediately.\n\n${aiReply}`
    }

    // 7. Save the AI reply to the database
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        senderRole: 'assistant',
        content: aiReply,
        contentType: 'text',
        aiMetadata: { model: 'llama-3.3-70b-versatile', timestamp: new Date() }
      }
    })

    // 8. Award points (non-fatal)
    await prisma.reward.create({
      data: {
        userId: req.user.id,
        actionType: 'CHAT_SESSION',
        pointsEarned: 5,
        description: 'Used AI chat support'
      }
    }).catch(() => { })

    res.json({ message: assistantMessage })

  } catch (err) {
    console.error('[POST /chat/message] FULL ERROR:', err)
    
    // Check if it's a Groq API error
    if (err.message?.includes('API_KEY') || err.message?.includes('api key') || err.message?.includes('Invalid API Key') || err.status === 401) {
      return res.status(500).json({ error: 'AI service is not configured correctly. Please check your Groq API Key.' })
    }

    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('rate limit')) {
      return res.status(500).json({ error: 'AI is temporarily busy (Rate Limit). Please wait a moment.' })
    }

    res.status(500).json({ error: `AI Error: ${err.message || 'Unknown error'}` })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/chat/session/:id  — end a session
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/session/:id', async (req, res) => {
  try {
    const session = await prisma.chatSession.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!session) return res.status(404).json({ error: 'Session not found.' })

    await prisma.chatSession.update({
      where: { id: req.params.id },
      data: { isActive: false, endedAt: new Date() }
    })
    res.json({ message: 'Session ended.' })
  } catch (err) {
    console.error('[DELETE /chat/session/:id]', err)
    res.status(500).json({ error: 'Could not end session.' })
  }
})

module.exports = router