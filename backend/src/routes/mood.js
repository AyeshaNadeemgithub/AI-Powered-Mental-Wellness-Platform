const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')
const { awardActivityPoints } = require('../utils/gamification')

// All mood routes require login
router.use(protect)

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mood
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

    // Save keyword tags
    if (tags && tags.length > 0) {
      for (const tagItem of tags) {
        const tagName  = typeof tagItem === 'string' ? tagItem : tagItem.label
        const tagEmoji = typeof tagItem === 'object'  ? tagItem.emoji : null

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

    // AWARD POINTS AND CHECK BADGES
    await awardActivityPoints(req.user.id, 'MOOD_LOG')

    res.status(201).json({
      message: 'Mood logged!',
      moodLog,
    })

  } catch (err) {
    console.error('[POST /mood]', err)
    res.status(500).json({ error: 'Could not save mood log.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mood
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

    res.json({ logs })
  } catch (err) {
    console.error('[GET /mood]', err)
    res.status(500).json({ error: 'Could not fetch mood history.' })
  }
})

module.exports = router
