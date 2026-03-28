const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- Seed Master Admin User Only ---
  const saltRounds = 10;
  const password = await bcrypt.hash('varcas@155', saltRounds);

  const masterAdmin = await prisma.user.upsert({
    where: { email: 'admin@varcasenergy.com' },
    update: {
      password: password,
    },
    create: {
      email: 'admin@varcasenergy.com',
      name: 'Master Admin',
      password: password,
      role: 'Master',
      country: 'India'
    },
  });

  console.log('Master Admin seeded:', { id: masterAdmin.id, email: masterAdmin.email });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
