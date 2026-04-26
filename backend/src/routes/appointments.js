const express = require('express')
const router  = express.Router()
const prisma  = require('../lib/prisma')
const { protect } = require('../middleware/auth')

router.use(protect)

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/psychologists
// Returns all approved psychologists for the patient "Find Therapist" view
// ─────────────────────────────────────────────────────────────────────────────
router.get('/psychologists', async (req, res) => {
  try {
    const psychologists = await prisma.psychologist.findMany({
      where: { isApproved: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
          }
        },
        _count: {
          select: { appointments: true }
        }
      },
      orderBy: { avgRating: 'desc' }
    })

    // Map to a frontend-friendly shape
    const result = psychologists.map((p, index) => {
      const accentColors = [
        '#7C3AED', '#0EA5E9', '#B45309', '#10B981', '#6D28D9', '#EF4444',
        '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'
      ]
      const accentColor = accentColors[index % accentColors.length]
      const accentBgMap = {
        '#7C3AED': '#F5F3FF', '#0EA5E9': '#F0F9FF', '#B45309': '#FFFBEB',
        '#10B981': '#F0FDF4', '#6D28D9': '#EDE9FE', '#EF4444': '#FEF2F2',
        '#F59E0B': '#FFFBEB', '#8B5CF6': '#F5F3FF', '#EC4899': '#FDF2F8',
        '#14B8A6': '#F0FDFA'
      }

      return {
        id: p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        title: p.specialization,
        specialties: p.specialization.split(',').map(s => s.trim()),
        rating: p.avgRating,
        reviews: p.totalReviews,
        experience: `${Math.floor(Math.random() * 10) + 3} yrs`,
        avatar: p.user.firstName.charAt(0).toUpperCase(),
        avatarGradient: `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)`,
        available: true,
        nextSlot: 'Available',
        price: `PKR ${(Number(p.hourlyRate) || 5000)} / session`,
        badge: p.avgRating >= 4.5 ? 'Top Rated' : 'Available',
        badgeVariant: p.avgRating >= 4.5 ? 'gold' : 'green',
        about: p.bio || `Licensed ${p.specialization} specialist providing compassionate, evidence-based care.`,
        accentColor,
        accentBg: accentBgMap[accentColor] || '#F5F3FF',
        sessionDurationMins: p.sessionDurationMins,
        userId: p.user.id,
        psychologistId: p.id,
      }
    })

    res.json(result)
  } catch (err) {
    console.error('[GET /appointments/psychologists]', err)
    res.status(500).json({ error: 'Could not fetch psychologists.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments
// Book an appointment: { psychologistId, date, time, sessionType }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { psychologistId, date, time, sessionType } = req.body
    const patientId = req.user.id

    if (!psychologistId || !date || !time) {
      return res.status(400).json({ error: 'psychologistId, date and time are required.' })
    }

    // Verify the psychologist exists
    const psychologist = await prisma.psychologist.findUnique({
      where: { id: psychologistId },
      include: { user: { select: { firstName: true, lastName: true } } }
    })
    if (!psychologist) {
      return res.status(404).json({ error: 'Psychologist not found.' })
    }

    // Parse the scheduled date/time
    // date can be "Today", "Tomorrow", or a date string
    let scheduledDate = new Date()
    if (date === 'Today') {
      // keep today
    } else if (date === 'Tomorrow') {
      scheduledDate.setDate(scheduledDate.getDate() + 1)
    } else {
      // Try to parse the date string (e.g. "Mon Mar 10")
      const parsed = new Date(date + ' ' + new Date().getFullYear())
      if (!isNaN(parsed.getTime())) {
        scheduledDate = parsed
      }
    }

    // Parse time (e.g. "9:00 AM" -> hours/minutes)
    const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (timeMatch) {
      let hours = parseInt(timeMatch[1])
      const minutes = parseInt(timeMatch[2])
      const period = timeMatch[3].toUpperCase()
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      scheduledDate.setHours(hours, minutes, 0, 0)
    }

    // Map session type string to enum
    const sessionTypeMap = {
      'Video Call': 'VIDEO',
      'In-Person': 'CHAT',
      'Phone Call': 'AUDIO',
    }
    const sessionEnum = sessionTypeMap[sessionType] || 'VIDEO'

    // Create an availability slot for this booking
    const slot = await prisma.availabilitySlot.create({
      data: {
        psychologistId,
        startTime: time,
        endTime: time,
        isRecurring: false,
        specificDate: scheduledDate,
        isAvailable: false,
      }
    })

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        psychologistId,
        slotId: slot.id,
        scheduledAt: scheduledDate,
        durationMins: psychologist.sessionDurationMins || 50,
        status: 'CONFIRMED',
        sessionType: sessionEnum,
        feeAmount: psychologist.hourlyRate || 0,
      },
      include: {
        psychologist: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } }
        },
        patient: {
          select: { firstName: true, lastName: true }
        },
        slot: true,
      }
    })

    // Create a notification for the psychologist
    await prisma.notification.create({
      data: {
        userId: psychologist.userId,
        type: 'APPOINTMENT_REMINDER',
        title: 'New Appointment Booked! 📅',
        message: `${appointment.patient.firstName} ${appointment.patient.lastName} booked a ${sessionType || 'Video Call'} session on ${scheduledDate.toLocaleDateString()}.`,
        payload: { appointmentId: appointment.id }
      }
    }).catch(() => {})

    // Award points to patient
    await prisma.reward.create({
      data: {
        userId: patientId,
        actionType: 'APPOINTMENT_BOOKED',
        pointsEarned: 30,
        description: `Booked session with Dr. ${psychologist.user.lastName}`
      }
    }).catch(() => {})

    res.status(201).json({
      message: `Session booked with Dr. ${psychologist.user.firstName} ${psychologist.user.lastName}!`,
      appointment
    })
  } catch (err) {
    console.error('[POST /appointments]', err)
    res.status(500).json({ error: 'Could not book appointment.', details: err.message })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments
// Returns the logged-in user's appointments
// For patients: their booked sessions
// For psychologists: sessions booked with them
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id
    const role   = req.user.role

    let where = {}
    if (role === 'PSYCHOLOGIST') {
      // Find the psychologist record for this user
      const psychologist = await prisma.psychologist.findUnique({ where: { userId } })
      if (!psychologist) return res.json([])
      where = { psychologistId: psychologist.id }
    } else {
      where = { patientId: userId }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        psychologist: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } }
        },
        patient: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true }
        },
        slot: true,
      }
    })

    res.json(appointments)
  } catch (err) {
    console.error('[GET /appointments]', err)
    res.status(500).json({ error: 'Could not fetch appointments.' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/appointments/:id/cancel
// Cancel an appointment
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params

    const appointment = await prisma.appointment.findUnique({ where: { id } })
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' })
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: req.body.reason || 'Cancelled by user',
      }
    })

    // Free up the slot
    await prisma.availabilitySlot.update({
      where: { id: appointment.slotId },
      data: { isAvailable: true }
    }).catch(() => {})

    res.json({ message: 'Appointment cancelled.', appointment: updated })
  } catch (err) {
    console.error('[PUT /appointments/:id/cancel]', err)
    res.status(500).json({ error: 'Could not cancel appointment.' })
  }
})

module.exports = router
