const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Populate Badges
  const badges = [
    { name: 'Early Bird', emoji: '🌱', description: 'Log your first mood.', pointsRequired: 0, unlockCriteria: { minLogs: 1, type: 'MOOD' } },
    { name: 'Consistent', emoji: '🔥', description: '3-day mood streak.', pointsRequired: 0, unlockCriteria: { minStreak: 3 } },
    { name: 'Stoic', emoji: '🛡️', description: '7-day mood streak.', pointsRequired: 0, unlockCriteria: { minStreak: 7 } },
    { name: 'Zen Master', emoji: '🧘', description: '14-day mood streak.', pointsRequired: 0, unlockCriteria: { minStreak: 14 } },
    { name: 'Deep Thinker', emoji: '✍️', description: 'First journal entry.', pointsRequired: 0, unlockCriteria: { minEntries: 1, type: 'JOURNAL' } },
    { name: 'Point Collector', emoji: '⭐', description: 'Reach 100 total points.', pointsRequired: 100, unlockCriteria: { minPoints: 100 } },
  ]

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    })
  }
  console.log(`✅  Upserted ${badges.length} badges`)

  // 2. Populate Tags
  const tags = [
    { name: 'Grateful', emoji: '🙏', category: 'positive' },
    { name: 'Stressed', emoji: '😫', category: 'negative' },
    { name: 'Calm', emoji: '🌿', category: 'neutral' },
    { name: 'Energetic', emoji: '⚡', category: 'positive' },
    { name: 'Anxious', emoji: '😟', category: 'negative' },
    { name: 'Inspired', emoji: '💡', category: 'positive' },
    { name: 'Tired', emoji: '😴', category: 'negative' },
    { name: 'Productive', emoji: '✅', category: 'positive' },
    { name: 'Lonely', emoji: '👤', category: 'negative' },
    { name: 'Loved', emoji: '❤️', category: 'positive' },
  ]

  for (const t of tags) {
    await prisma.tag.upsert({
      where: { name: t.name },
      update: t,
      create: t,
    })
  }
  console.log(`✅  Upserted ${tags.length} tags`)

  console.log('🚀 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
