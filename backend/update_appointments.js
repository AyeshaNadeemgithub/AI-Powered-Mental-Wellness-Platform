const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany();
  
  const today = new Date();
  
  for (let i = 0; i < appointments.length; i++) {
    const appt = appointments[i];
    
    // Distribute appointments across the current week, starting from yesterday
    const newDate = new Date(today);
    // Shift the date slightly for each appointment to spread them out
    newDate.setDate(today.getDate() + (i % 7) - 2); 
    
    // Set hours from 9 AM to 5 PM
    const hour = 9 + (i % 8);
    newDate.setHours(hour, 0, 0, 0);

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { scheduledAt: newDate }
    });
  }
  
  console.log(`Updated ${appointments.length} appointments to the current week.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
