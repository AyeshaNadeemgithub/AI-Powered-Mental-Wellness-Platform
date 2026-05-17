const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middleware/auth');

// Get current user's intake form
router.get('/', protect, async (req, res) => {
  try {
    const intake = await prisma.patientIntake.findUnique({
      where: { userId: req.user.id }
    });
    res.json(intake || {});
  } catch (err) {
    console.error('Error fetching intake:', err);
    res.status(500).json({ error: 'Failed to fetch intake form' });
  }
});

// Save or Update intake form
router.post('/', protect, async (req, res) => {
  try {
    const { 
      age, gender, education, occupation, financialCondition,
      parentsStatus, siblingsCount, familyType, livingArrangement, maritalStatus,
      pastTrauma, previousTherapy, previousTherapyDetails, medicalHistory,
      mentalHealthConditions, currentSymptoms, medications,
      therapyGoals, therapistExpectations, mainConcerns
    } = req.body;

    const intake = await prisma.patientIntake.upsert({
      where: { userId: req.user.id },
      update: {
        age: parseInt(age) || null,
        gender, education, occupation, financialCondition,
        parentsStatus, siblingsCount: parseInt(siblingsCount) || 0, familyType, livingArrangement, maritalStatus,
        pastTrauma, previousTherapy: !!previousTherapy, previousTherapyDetails, medicalHistory,
        mentalHealthConditions, currentSymptoms, medications,
        therapyGoals, therapistExpectations, mainConcerns
      },
      create: {
        userId: req.user.id,
        age: parseInt(age) || null,
        gender, education, occupation, financialCondition,
        parentsStatus, siblingsCount: parseInt(siblingsCount) || 0, familyType, livingArrangement, maritalStatus,
        pastTrauma, previousTherapy: !!previousTherapy, previousTherapyDetails, medicalHistory,
        mentalHealthConditions, currentSymptoms, medications,
        therapyGoals, therapistExpectations, mainConcerns
      }
    });

    res.json(intake);
  } catch (err) {
    console.error('Error saving intake:', err);
    res.status(500).json({ error: 'Failed to save intake form' });
  }
});

// Get specific patient's intake form (for psychologists)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    if (req.user.role !== 'PSYCHOLOGIST' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Check if there is an appointment between them
    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId: req.params.patientId,
        psychologist: {
          userId: req.user.id
        }
      }
    });

    if (!appointment && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to view this patient\'s history.' });
    }

    const intake = await prisma.patientIntake.findUnique({
      where: { userId: req.params.patientId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json(intake || { error: 'No intake form found for this patient' });
  } catch (err) {
    console.error('Error fetching patient intake:', err);
    res.status(500).json({ error: 'Failed to fetch patient history' });
  }
});

module.exports = router;
