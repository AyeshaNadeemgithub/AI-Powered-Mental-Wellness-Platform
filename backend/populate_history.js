const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const updated = await prisma.appointment.updateMany({
    where: {
      scheduledAt: { lt: now },
      status: { in: ['PENDING', 'CONFIRMED'] }
    },
    data: {
      status: 'COMPLETED'
    }
  });
  console.log('Marked as COMPLETED:', updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
