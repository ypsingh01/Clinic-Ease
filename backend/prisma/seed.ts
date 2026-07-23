import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { seedDatabase } from '../src/services/seedCatalog.js'

seedDatabase()
  .then((r) => {
    console.log('Seeded ClinicEase DB', r)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
