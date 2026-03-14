const { PrismaClient } = require('@prisma/client')

// Reuse the same client instance — don't create a new one per request
const prisma = new PrismaClient()

module.exports = prisma
