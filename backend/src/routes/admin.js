const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect, adminOnly } = require('../middleware/auth')

// Only admins can access these stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count()
    const activePatients = await prisma.user.count({ where: { role: 'PATIENT' } })
    const totalPsychologists = await prisma.psychologist.count()
    const approvedPsychologists = await prisma.psychologist.count({ where: { isApproved: true } })
    const moodLogs = await prisma.moodLog.count()
    
    // Get mood logs from today
    const today = new Date()
    today.setHours(0,0,0,0)
    const moodLogsToday = await prisma.moodLog.count({
      where: { loggedAt: { gte: today } }
    })

    res.json({
      totalUsers,
      activePatients,
      totalPsychologists,
      approvedPsychologists,
      moodLogs,
      moodLogsToday,
      uptime: '99.9%', // mock for now
      reportedIssues: 0, // mock for now
    })
  } catch (err) {
    console.error('[GET /admin/stats]', err)
    res.status(500).json({ error: 'Could not fetch admin stats.' })
  }
})

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        psychologist: {
          select: { specialization: true, isApproved: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (err) {
    console.error('[GET /admin/users]', err)
    res.status(500).json({ error: 'Could not fetch users.' })
  }
})

module.exports = router
