import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding prizes...');

  const prizes = [
    { name: '10% Discount', weight: 40, stock: 100, code: 'SAVE10', isNoPrize: false },
    { name: 'Free Ebook', weight: 30, stock: 50, code: 'FREEBOOK', isNoPrize: false },
    { name: 'Try Again!', weight: 20, stock: 0, code: null, isNoPrize: true },
    { name: '20% Discount', weight: 5, stock: 10, code: 'MEGA20', isNoPrize: false },
    { name: 'No Prize', weight: 15, stock: 0, code: null, isNoPrize: true },
    { name: 'Free Consultation', weight: 2, stock: 5, code: 'CONSULT', isNoPrize: false },
  ];

  for (const prize of prizes) {
    await prisma.prize.create({ data: prize });
  }

  console.log('Seed complete!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
