const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect, requireRole } = require('../middleware/auth')

router.use(protect)
router.use(requireRole('PSYCHOLOGIST'))

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/psychologist-dashboard
// Returns full dashboard data for the logged-in psychologist
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    // Get the psychologist record
    const psychologist = await prisma.psychologist.findUnique({
      where: { userId },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true, email: true }
        }
      }
    })

    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist profile not found.' })
    }

    const psychologistId = psychologist.id
    const weekOffset = parseInt(req.query.weekOffset) || 0

    // ── Today's appointments ──────────────────────────────────────────────
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        slot: true,
      }
    })

    // ── This week's appointments (for calendar grid) ──────────────────────
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekOffset * 7))
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6) 
    weekEnd.setHours(23, 59, 59, 999)

    const weekAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId,
        scheduledAt: { gte: weekStart, lte: weekEnd },
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true }
        },
        slot: true,
      }
    })

    // ── All appointments (for patients list, reports, etc.) ───────────────
    const allAppointments = await prisma.appointment.findMany({
      where: { psychologistId },
      orderBy: { scheduledAt: 'desc' },
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true }
        },
        slot: true,
        notes: {
          include: {
            author: { select: { firstName: true, lastName: true } }
          }
        }
      }
    })

    // ── Unique patients ──────────────────────────────────────────────────
    const patientMap = new Map()
    allAppointments.forEach(a => {
      if (!patientMap.has(a.patient.id)) {
        patientMap.set(a.patient.id, {
          ...a.patient,
          appointmentCount: 0,
          lastAppointment: null,
          statuses: [],
        })
      }
      const p = patientMap.get(a.patient.id)
      p.appointmentCount++
      p.statuses.push(a.status)
      if (!p.lastAppointment || new Date(a.scheduledAt) > new Date(p.lastAppointment)) {
        p.lastAppointment = a.scheduledAt
      }
    })
    const patients = Array.from(patientMap.values())

    // ── Fetch Recent MoodLogs for Patients ───────────────────────────────
    const patientIds = patients.map(p => p.id)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const moodLogs = await prisma.moodLog.findMany({
      where: {
        userId: { in: patientIds },
        loggedAt: { gte: sevenDaysAgo }
      },
      orderBy: { loggedAt: 'asc' },
      include: {
        moodTags: {
          include: { tag: true }
        }
      }
    })

    patients.forEach(p => {
      p.moodLogs = moodLogs
        .filter(m => m.userId === p.id)
        .map(m => ({
          score: m.moodScore,
          label: m.moodLabel,
          loggedAt: m.loggedAt,
          tags: m.moodTags.map(mt => mt.tag.name)
        }))
    })

    // ── Stats ────────────────────────────────────────────────────────────
    const totalPatients     = patients.length
    const completedSessions = allAppointments.filter(a => a.status === 'COMPLETED').length
    const pendingSessions   = allAppointments.filter(a => a.status === 'PENDING').length
    const confirmedSessions = allAppointments.filter(a => a.status === 'CONFIRMED').length
    const cancelledSessions = allAppointments.filter(a => a.status === 'CANCELLED').length

    // ── Upcoming appointments ────────────────────────────────────────────
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
      include: {
        patient: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        slot: true,
      }
    })

    // ── All notes (for notes/feedback tab) ───────────────────────────────
    const appointmentNotes = await prisma.appointmentNote.findMany({
      where: {
        appointment: { psychologistId }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        appointment: {
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    })

    res.json({
      psychologist: {
        id: psychologist.id,
        userId: psychologist.userId,
        name: `Dr. ${psychologist.user.firstName} ${psychologist.user.lastName}`,
        firstName: psychologist.user.firstName,
        lastName: psychologist.user.lastName,
        email: psychologist.user.email,
        avatarUrl: psychologist.user.avatarUrl,
        specialization: psychologist.specialization,
        avgRating: psychologist.avgRating,
        totalReviews: psychologist.totalReviews,
      },
      todaysAppointments,
      weekAppointments,
      upcomingAppointments,
      allAppointments,
      patients,
      appointmentNotes,
      stats: {
        totalPatients,
        completedSessions,
        pendingSessions,
        confirmedSessions,
        cancelledSessions,
        totalSessions: allAppointments.length,
      }
    })
  } catch (err) {
    console.error('[GET /psychologist-dashboard]', err)
    res.status(500).json({ error: 'Could not load psychologist dashboard.', details: err.message })
  }
})

module.exports = router
