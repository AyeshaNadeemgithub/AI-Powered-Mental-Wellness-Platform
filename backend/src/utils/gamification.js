const prisma = require('../lib/prisma');

/**
 * awardActivityPoints
 * @param {string} userId
 * @param {string} actionType - 'MOOD_LOG' | 'JOURNAL_ENTRY' | 'CHAT_SESSION'
 */
async function awardActivityPoints(userId, actionType) {
  const pointsMap = {
    'MOOD_LOG': 10,
    'JOURNAL_ENTRY': 15,
    'CHAT_SESSION': 5
  };

  const points = pointsMap[actionType] || 0;
  if (points === 0) return;

  // 1. Create reward record
  await prisma.reward.create({
    data: {
      userId,
      actionType,
      pointsEarned: points,
      description: `Earned ${points} points for: ${actionType.replace('_', ' ').toLowerCase()}`
    }
  });

  // 2. Check for point milestones
  const totalPoints = await getTotalPoints(userId);
  const milestones = [50, 100, 250, 500, 1000];
  
  // Find the highest milestone just reached
  // We check if (total - points) was below milestone AND total is now above
  for (const m of milestones) {
    if (totalPoints - points < m && totalPoints >= m) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'STREAK_MILESTONE',
          title: '⭐ Point Milestone!',
          message: `Incredible! You've reached ${m} total points. Keep up the great work!`,
        }
      });
    }
  }

  // 3. Trigger badge check
  await checkAndAwardBadges(userId);
}

/**
 * checkAndAwardBadges
 * Scans all badges and awards those the user qualifies for but hasn't earned.
 */
async function checkAndAwardBadges(userId) {
  const badges = await prisma.badge.findMany();
  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true }
  });
  const earnedIds = new Set(earnedBadges.map(b => b.badgeId));

  const stats = await getUserStats(userId);
  const newlyAwarded = [];

  for (const b of badges) {
    if (earnedIds.has(b.id)) continue;

    const criteria = b.unlockCriteria;
    if (!criteria) continue;

    let qualified = false;

    if (criteria.minStreak && stats.streak >= criteria.minStreak) qualified = true;
    if (criteria.minPoints && stats.totalPoints >= criteria.minPoints) qualified = true;
    
    if (criteria.type === 'MOOD' && criteria.minLogs && stats.moodLogs >= criteria.minLogs) qualified = true;
    if (criteria.type === 'JOURNAL' && criteria.minEntries && stats.journalEntries >= criteria.minEntries) qualified = true;

    if (qualified) {
      await prisma.userBadge.create({
        data: { userId, badgeId: b.id }
      });
      await prisma.notification.create({
        data: {
          userId,
          type: 'BADGE_EARNED',
          title: `🏆 New Badge: ${b.name} ${b.emoji}`,
          message: b.description,
        }
      });
      newlyAwarded.push(b);
    }
  }

  return newlyAwarded;
}

// Internal Helpers
async function getTotalPoints(userId) {
  const result = await prisma.reward.aggregate({
    where: { userId },
    _sum: { pointsEarned: true }
  });
  return result._sum.pointsEarned || 0;
}

async function getUserStats(userId) {
  const [moodLogs, journalEntries, totalPoints] = await Promise.all([
    prisma.moodLog.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    getTotalPoints(userId)
  ]);

  // Streak calculation (Mood logs)
  const rewards = await prisma.reward.findMany({
    where: { userId, actionType: 'MOOD_LOG' },
    orderBy: { earnedAt: 'desc' },
    select: { earnedAt: true }
  });

  let streak = 0;
  if (rewards.length > 0) {
    // Get unique dates in YYYY-MM-DD format to avoid time/timezone issues
    const uniqueDates = [...new Set(rewards.map(r => 
      new Date(r.earnedAt).toISOString().split('T')[0]
    ))].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If no log today AND no log yesterday, streak is broken
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return { moodLogs, journalEntries, totalPoints, streak: 0 };
    }

    let checkDate = new Date(uniqueDates[0]); // Start from the latest log date
    streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const nextDate = new Date(uniqueDates[i]);
      const diffDays = Math.round((checkDate - nextDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        checkDate = nextDate;
      } else if (diffDays === 0) {
        continue; // Multiple logs on the same day
      } else {
        break; // Gap found
      }
    }
  }

  return { moodLogs, journalEntries, totalPoints, streak };
}

module.exports = {
  awardActivityPoints,
  checkAndAwardBadges,
  getUserStats
};
