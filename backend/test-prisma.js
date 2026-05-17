const prisma = require('./src/lib/prisma');

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    console.log('Prisma Client is working correctly.');
  } catch (error) {
    console.error('Prisma Client Error details:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
