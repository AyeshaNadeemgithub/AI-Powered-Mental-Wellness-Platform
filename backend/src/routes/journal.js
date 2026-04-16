const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')
const { awardActivityPoints } = require('../utils/gamification')

router.use(protect)

// POST /api/journal — create entry
router.post('/', async (req, res) => {
  try {
    const { title, content, moodLabel, tags } = req.body
    if (!content) return res.status(400).json({ error: 'Journal content cannot be empty.' })

    const entry = await prisma.journalEntry.create({
      data: {
        userId:    req.user.id,
        title:     title || null,
        content,
        moodLabel: moodLabel || null,
        tags:      tags || [],
        isPrivate: true,
      }
    })

    // AWARD POINTS AND CHECK BADGES
    await awardActivityPoints(req.user.id, 'JOURNAL_ENTRY')

    res.status(201).json({ message: 'Journal entry saved!', entry })
  } catch (err) {
    console.error('[POST /journal]', err)
    res.status(500).json({ error: 'Could not save journal entry.' })
  }
})

// GET /api/journal — all entries for logged-in user only
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ entries })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch journal entries.' })
  }
})

// PUT /api/journal/:id — update entry
router.put('/:id', async (req, res) => {
  try {
    const { title, content, moodLabel, tags } = req.body
    // Make sure the entry belongs to this user
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!existing) return res.status(404).json({ error: 'Entry not found.' })

    const entry = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data:  { title, content, moodLabel, tags: tags || existing.tags }
    })
    res.json({ message: 'Entry updated!', entry })
  } catch (err) {
    res.status(500).json({ error: 'Could not update journal entry.' })
  }
})

// DELETE /api/journal/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    })
    if (!existing) return res.status(404).json({ error: 'Entry not found.' })

    await prisma.journalEntry.delete({ where: { id: req.params.id } })
    res.json({ message: 'Entry deleted.' })
  } catch (err) {
    res.status(500).json({ error: 'Could not delete journal entry.' })
  }
})

module.exports = router
