const express = require('express')
const router  = express.Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/patient-signup
// Called from PatientSignup.jsx
// Fields: fullName, email, phone, password, primaryConcern, dob
// ─────────────────────────────────────────────────────────────────────────────
router.post('/patient-signup', async (req, res) => {
  try {
    const { fullName, email, phone, password, primaryConcern, dob } = req.body

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    // Split fullName into first + last
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0]
    const lastName  = nameParts.slice(1).join(' ') || '-'

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone:        phone || null,
        passwordHash,
        role:         'PATIENT',
      }
    })

    // Award welcome points
    await prisma.reward.create({
      data: {
        userId:      user.id,
        actionType:  'SIGNUP',
        pointsEarned: 50,
        description: 'Welcome to CalmMind! 🎉'
      }
    })

    // Send welcome notification
    await prisma.notification.create({
      data: {
        userId:  user.id,
        type:    'WELCOME',
        title:   'Welcome to CalmMind! 🌿',
        message: `Hi ${firstName}! Your wellness journey starts now. Try logging your first mood today.`,
      }
    })

    const token = generateToken(user)

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id:        user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
      }
    })

  } catch (err) {
    console.error('[patient-signup]', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/therapist-signup
// Called from TherapistSignup.jsx
// Fields: fullName, email, phone, licenseNumber, specialization, yearsExp, password
// Account is created but isApproved=false — admin must approve before login works
// ─────────────────────────────────────────────────────────────────────────────
router.post('/therapist-signup', async (req, res) => {
  try {
    const { fullName, email, phone, licenseNumber, specialization, yearsExp, password } = req.body

    if (!fullName || !email || !password || !licenseNumber || !specialization) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    // Check duplicate license
    const existingLicense = await prisma.psychologist.findUnique({ where: { licenseNumber } })
    if (existingLicense) {
      return res.status(400).json({ error: 'This license number is already registered.' })
    }

    const nameParts  = fullName.trim().split(' ')
    const firstName  = nameParts[0]
    const lastName   = nameParts.slice(1).join(' ') || '-'
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user + psychologist profile in one transaction
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone:        phone || null,
        passwordHash,
        role:         'PSYCHOLOGIST',
        isVerified:   false,  // must be approved by admin
        // Create the psychologist profile at the same time
        psychologist: {
          create: {
            licenseNumber,
            specialization,
            languages:  ['English'],
            isApproved: false,  // admin approves after license verification
          }
        }
      }
    })

    res.status(201).json({
      message: 'Application submitted! Your license will be verified within 24–48 hours.',
      pendingApproval: true,
      user: {
        id:        user.id,
        firstName: user.firstName,
        email:     user.email,
        role:      user.role,
      }
    })

  } catch (err) {
    console.error('[therapist-signup]', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/admin-signup
// Called from AdminSignup.jsx
// Requires a secret ADMIN_ACCESS_CODE set in .env
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin-signup', async (req, res) => {
  try {
    const { fullName, email, phone, department, adminCode, password } = req.body

    if (!fullName || !email || !password || !adminCode || !department) {
      return res.status(400).json({ error: 'All fields are required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Admin password must be at least 8 characters.' })
    }

    // Verify the secret admin access code
    if (adminCode !== process.env.ADMIN_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid admin access code.' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' })
    }

    const nameParts    = fullName.trim().split(' ')
    const firstName    = nameParts[0]
    const lastName     = nameParts.slice(1).join(' ') || '-'
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone:      phone || null,
        passwordHash,
        role:       'ADMIN',
        isVerified: true,
      }
    })

    const token = generateToken(user)

    res.status(201).json({
      message: `Admin account created! Welcome, ${firstName}.`,
      token,
      user: {
        id:        user.id,
        firstName: user.firstName,
        email:     user.email,
        role:      user.role,
      }
    })

  } catch (err) {
    console.error('[admin-signup]', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Called from Login.jsx — handles all 3 roles (patient, psychologist, admin)
// The role selection in Login.jsx maps to: patient→PATIENT, psychologist→PSYCHOLOGIST, admin→ADMIN
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // Check account is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Contact support.' })
    }

    // If a role was passed from the Login page, verify it matches
    if (role) {
      const expectedRole = role.toUpperCase()
      if (user.role !== expectedRole) {
        return res.status(401).json({
          error: `This account is registered as a ${user.role.toLowerCase()}, not a ${role}.`
        })
      }
    }

    // For psychologists: check approval status
    if (user.role === 'PSYCHOLOGIST') {
      const psychologist = await prisma.psychologist.findUnique({ where: { userId: user.id } })
      if (psychologist && !psychologist.isApproved) {
        return res.status(403).json({
          error: 'Your account is pending license verification. You will be notified within 24–48 hours.'
        })
      }
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data:  { lastActiveAt: new Date() }
    })

    const token = generateToken(user)

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id:        user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        avatarUrl: user.avatarUrl,
      }
    })

  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  — protected
// Returns current user's full profile + counts for dashboard
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        email:       true,
        role:        true,
        avatarUrl:   true,
        phone:       true,
        isVerified:  true,
        createdAt:   true,
        psychologist: true,
        _count: {
          select: {
            moodLogs:       true,
            journalEntries: true,
            appointments:   true,
            userBadges:     true,
          }
        }
      }
    })

    // Get total reward points
    const pointsResult = await prisma.reward.aggregate({
      where:  { userId: req.user.id },
      _sum:   { pointsEarned: true }
    })
    const totalPoints = pointsResult._sum.pointsEarned || 0

    // Get current streak
    const streak = await calculateStreak(req.user.id)

    res.json({ user, totalPoints, streak })

  } catch (err) {
    console.error('[me]', err)
    res.status(500).json({ error: 'Could not fetch user data.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Streak calculator — counts consecutive days with a MOOD_LOG reward
// ─────────────────────────────────────────────────────────────────────────────
async function calculateStreak(userId) {
  const logs = await prisma.reward.findMany({
    where:   { userId, actionType: 'MOOD_LOG' },
    orderBy: { earnedAt: 'desc' },
    select:  { earnedAt: true }
  })

  if (logs.length === 0) return 0

  let streak      = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const log of logs) {
    const logDate = new Date(log.earnedAt)
    logDate.setHours(0, 0, 0, 0)
    const diffDays = Math.round((currentDate - logDate) / (1000 * 60 * 60 * 24))
    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = logDate
    } else {
      break
    }
  }
  return streak
}

module.exports = router
