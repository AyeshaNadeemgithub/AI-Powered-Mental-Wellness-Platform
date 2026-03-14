const express = require('express')
const cors    = require('cors')
require('dotenv').config()

const app = express()

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin:      'http://localhost:3000',  // your React app
  credentials: true
}))
app.use(express.json())

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./src/routes/auth'))
app.use('/api/mood',      require('./src/routes/mood'))
app.use('/api/journal',   require('./src/routes/journal'))
app.use('/api/chat',      require('./src/routes/chat'))
app.use('/api/dashboard', require('./src/routes/dashboard'))

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🌿 CalmMind API is running!',
    version: '1.0.0',
    routes: [
      'POST /api/auth/patient-signup',
      'POST /api/auth/therapist-signup',
      'POST /api/auth/admin-signup',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'POST /api/mood',
      'GET  /api/mood',
      'POST /api/journal',
      'GET  /api/journal',
      'GET  /api/dashboard',
      'POST /api/chat/session',
      'POST /api/chat/message',
    ]
  })
})

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` })
})

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\n🌿 CalmMind backend running on http://localhost:${PORT}`)
  console.log(`📋 Visit http://localhost:${PORT} to see all routes\n`)
})
