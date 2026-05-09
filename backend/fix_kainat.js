const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { firstName: { contains: 'kainat', mode: 'insensitive' } } });
  
  if (users.length === 0) {
    console.log("No user named kainat found.");
    return;
  }
  
  const kainat = users[0];
  console.log("Found Kainat:", kainat.email);
  
  // 1. Change role to PSYCHOLOGIST
  await prisma.user.update({
    where: { id: kainat.id },
    data: { role: 'PSYCHOLOGIST' }
  });
  
  // 2. Ensure Psychologist profile exists
  let psych = await prisma.psychologist.findUnique({ where: { userId: kainat.id } });
  if (!psych) {
    psych = await prisma.psychologist.create({
      data: {
        userId: kainat.id,
        licenseNumber: 'MOCK-LIC-' + Date.now(),
        specialization: 'Cognitive Behavioral Therapy',
        isApproved: true,
      }
    });
  }
  
  // 3. Reassign all 13 existing appointments to Kainat
  const updated = await prisma.appointment.updateMany({
    data: { psychologistId: psych.id }
  });
  
  // Also shift them to the current week again just in case
  const appointments = await prisma.appointment.findMany();
  const today = new Date();
  
  for (let i = 0; i < appointments.length; i++) {
    const appt = appointments[i];
    const newDate = new Date(today);
    // Set to current week
    newDate.setDate(today.getDate() + (i % 7) - today.getDay() + 1); // Monday onwards
    const hour = 9 + (i % 8);
    newDate.setHours(hour, 0, 0, 0);

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { scheduledAt: newDate }
    });
  }
  
  console.log(`Reassigned and updated dates for ${updated.count} appointments to Kainat.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
