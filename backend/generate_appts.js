const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const psychologists = await prisma.psychologist.findMany();
  const patients = await prisma.user.findMany({ where: { role: 'PATIENT' } });
  
  if (psychologists.length === 0 || patients.length === 0) {
    console.log("Not enough users to create appointments.");
    return;
  }
  
  const today = new Date();
  let count = 0;
  
  // For every psychologist, create 3-5 appointments this week
  for (const psych of psychologists) {
    const numAppts = Math.floor(Math.random() * 3) + 3; // 3 to 5 appointments
    
    for (let i = 0; i < numAppts; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      
      const newDate = new Date(today);
      // distribute across the week
      newDate.setDate(today.getDate() + (i % 7) - 2); 
      const hour = 9 + (i % 8);
      newDate.setHours(hour, 0, 0, 0);
      
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          psychologistId: psych.id,
          slotId: "mock-slot-id-" + Math.random().toString(36).substring(7),
          scheduledAt: newDate,
          durationMins: 50,
          status: 'CONFIRMED',
          sessionType: 'VIDEO',
          feeAmount: 100,
          paymentStatus: 'PAID'
        }
      });
      count++;
    }
  }
  
  console.log(`Created ${count} new real-time appointments distributed among all psychologists.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
