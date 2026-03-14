const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

router.use(protect)

// GET /api/dashboard
// Returns everything the Dashboard.jsx needs in a single call:
// streak, total points, recent mood logs, upcoming appointments, badges, notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    // Streak
    const streak = await calculateStreak(userId)

    // Total points
    const pointsResult = await prisma.reward.aggregate({
      where: { userId },
      _sum:  { pointsEarned: true }
    })
    const totalPoints = pointsResult._sum.pointsEarned || 0

    // Last 7 mood logs (for the chart in Dashboard)
    const recentMoods = await prisma.moodLog.findMany({
      where:   { userId },
      orderBy: { loggedAt: 'desc' },
      take:    7,
      include: { moodTags: { include: { tag: true } } }
    })

    // Upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId:   userId,
        status:      { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' },
      take:    3,
      include: {
        psychologist: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } }
        },
        slot: true
      }
    })

    // Badges earned
    const userBadges = await prisma.userBadge.findMany({
      where:   { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    })

    // Unread notifications
    const notifications = await prisma.notification.findMany({
      where:   { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take:    5
    })

    res.json({
      streak,
      totalPoints,
      recentMoods,
      upcomingAppointments,
      userBadges,
      notifications,
      unreadCount: notifications.length
    })

  } catch (err) {
    console.error('[GET /dashboard]', err)
    res.status(500).json({ error: 'Could not load dashboard data.' })
  }
})

async function calculateStreak(userId) {
  const logs = await prisma.reward.findMany({
    where:   { userId, actionType: 'MOOD_LOG' },
    orderBy: { earnedAt: 'desc' },
    select:  { earnedAt: true }
  })
  if (logs.length === 0) return 0
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  for (const log of logs) {
    const logDate = new Date(log.earnedAt)
    logDate.setHours(0, 0, 0, 0)
    const diff = Math.round((currentDate - logDate) / (1000 * 60 * 60 * 24))
    if (diff === 0 || diff === 1) { streak++; currentDate = logDate }
    else break
  }
  return streak
}

module.exports = router
