const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

// All mood routes require login
router.use(protect)

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mood
// Called when user submits mood in MoodTracking.jsx
// Body: { moodScore, moodLabel, moodEmoji, tags, notes, sleepHours, energyLevel, sleepQuality }
// tags matches your KEYWORDS array e.g. ["Grateful", "Energetic"]
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      moodScore, moodLabel, moodEmoji,
      tags, notes, sleepHours,
      energyLevel, sleepQuality
    } = req.body

    if (!moodScore || moodScore < 1 || moodScore > 7) {
      return res.status(400).json({ error: 'Mood score must be between 1 and 7.' })
    }

    // Save mood log
    const moodLog = await prisma.moodLog.create({
      data: {
        userId:      req.user.id,
        moodScore,
        moodLabel:   moodLabel  || '',
        moodEmoji:   moodEmoji  || '',
        energyLevel: energyLevel || null,
        sleepQuality:sleepQuality || null,
        sleepHours:  sleepHours ? parseInt(sleepHours) : null,
        notes:       notes || null,
      }
    })

    // Save keyword tags (from your KEYWORDS array)
    if (tags && tags.length > 0) {
      for (const tagItem of tags) {
        const tagName  = typeof tagItem === 'string' ? tagItem : tagItem.label
        const tagEmoji = typeof tagItem === 'object'  ? tagItem.emoji : null

        // upsert = create if not exists, otherwise reuse
        const tag = await prisma.tag.upsert({
          where:  { name: tagName },
          update: {},
          create: { name: tagName, emoji: tagEmoji }
        })

        await prisma.moodTag.create({
          data: { moodLogId: moodLog.id, tagId: tag.id }
        })
      }
    }

    // Award 10 points for logging mood
    await prisma.reward.create({
      data: {
        userId:      req.user.id,
        actionType:  'MOOD_LOG',
        pointsEarned: 10,
        description: `Logged mood: ${moodLabel} ${moodEmoji}`
      }
    })

    // Calculate updated streak
    const streak      = await calculateStreak(req.user.id)
    const totalPoints = await getTotalPoints(req.user.id)

    // Check badge milestones
    const badges = await checkAndAwardBadges(req.user.id, streak, totalPoints)

    res.status(201).json({
      message:      'Mood logged!',
      moodLog,
      streak,
      totalPoints,
      newBadges:    badges,
      pointsEarned: 10
    })

  } catch (err) {
    console.error('[POST /mood]', err)
    res.status(500).json({ error: 'Could not save mood log.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mood
// Returns mood history for the MoodTracking chart + history list
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.moodLog.findMany({
      where:   { userId: req.user.id },
      orderBy: { loggedAt: 'desc' },
      take:    30,
      include: {
        moodTags: {
          include: { tag: true }
        }
      }
    })

    const streak      = await calculateStreak(req.user.id)
    const totalPoints = await getTotalPoints(req.user.id)

    res.json({ logs, streak, totalPoints })

  } catch (err) {
    console.error('[GET /mood]', err)
    res.status(500).json({ error: 'Could not fetch mood history.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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
    if (diffDays === 0 || diffDays === 1) { streak++; currentDate = logDate }
    else break
  }
  return streak
}

async function getTotalPoints(userId) {
  const result = await prisma.reward.aggregate({
    where: { userId },
    _sum:  { pointsEarned: true }
  })
  return result._sum.pointsEarned || 0
}

async function checkAndAwardBadges(userId, streak, totalPoints) {
  const newBadges = []

  const milestones = [
    { name: 'First Step',    emoji: '🌱', description: 'Logged your first mood!',        criteria: { minLogs: 1 } },
    { name: '7-Day Streak',  emoji: '🔥', description: '7 days of mood logging in a row!', criteria: { minStreak: 7 } },
    { name: '30-Day Streak', emoji: '🏆', description: '30 days of mood logging in a row!',criteria: { minStreak: 30 } },
    { name: 'Point Collector', emoji: '⭐', description: 'Earned 100 points!',            criteria: { minPoints: 100 } },
  ]

  for (const milestone of milestones) {
    // Check if already earned
    const badge = await prisma.badge.upsert({
      where:  { name: milestone.name },
      update: {},
      create: {
        name:        milestone.name,
        description: milestone.description,
        emoji:       milestone.emoji,
        unlockCriteria: milestone.criteria
      }
    })

    const alreadyEarned = await prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } }
    })
    if (alreadyEarned) continue

    // Check if criteria met
    let met = false
    if (milestone.criteria.minStreak && streak >= milestone.criteria.minStreak) met = true
    if (milestone.criteria.minPoints && totalPoints >= milestone.criteria.minPoints) met = true
    if (milestone.criteria.minLogs) {
      const logCount = await prisma.moodLog.count({ where: { userId } })
      if (logCount >= milestone.criteria.minLogs) met = true
    }

    if (met) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
      await prisma.notification.create({
        data: {
          userId,
          type:    'BADGE_EARNED',
          title:   `Badge Unlocked: ${milestone.name} ${milestone.emoji}`,
          message: milestone.description,
        }
      })
      newBadges.push(badge)
    }
  }

  return newBadges
}

module.exports = router
