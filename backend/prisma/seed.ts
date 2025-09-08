import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('Seeding minimal schema...');
  const alice = await prisma.user.create({ data: { email: 'alice@campus.local', name: 'Alice' } });
  const bob = await prisma.user.create({ data: { email: 'bob@campus.local', name: 'Bob' } });

  const tent = await prisma.gearItem.create({
    data: {
      ownerId: alice.id,
      title: '2-Person Tent',
      description: 'Lightweight backpacking tent',
      dailyRate: 200,
      depositAmount: 1000,
      condition: 'GOOD',
      photos: { create: [{ url: 'https://example.com/tent1.jpg' }] }
    }
  });

  await prisma.gearRental.create({
    data: {
      gearItemId: tent.id,
      renterId: bob.id,
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 2 * 86400000),
      status: 'APPROVED',
      depositHeld: 1000
    }
  });

  console.log('Seed complete (minimal)');
}

run().catch(e => {
  console.error('Seed failed', e);
}).finally(async () => {
  await prisma.$disconnect();
});
