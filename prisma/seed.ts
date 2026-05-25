import 'dotenv/config';
import mongoose from 'mongoose';
import { Campaign, Prize } from '../src/lib/mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://localhost:27017/leadmagnet";

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  console.log('Clearing database...');
  await Campaign.deleteMany({});
  await Prize.deleteMany({});

  console.log('Creating default campaign...');
  const campaign = await Campaign.create({
    name: 'Default Campaign',
    slug: 'default-campaign',
    primaryColor: '#c5a059',
    secondaryColor: '#f1f1f1',
    isActive: true,
  });

  console.log('Seeding prizes...');
  const prizes = [
    { name: '10% Discount', weight: 40, stock: 100, code: 'SAVE10', isNoPrize: false, campaignId: campaign.id || campaign._id.toString() },
    { name: 'Free Ebook', weight: 30, stock: 50, code: 'FREEBOOK', isNoPrize: false, campaignId: campaign.id || campaign._id.toString() },
    { name: 'Try Again!', weight: 20, stock: 0, code: null, isNoPrize: true, campaignId: campaign.id || campaign._id.toString() },
    { name: '20% Discount', weight: 5, stock: 10, code: 'MEGA20', isNoPrize: false, campaignId: campaign.id || campaign._id.toString() },
    { name: 'No Prize', weight: 15, stock: 0, code: null, isNoPrize: true, campaignId: campaign.id || campaign._id.toString() },
    { name: 'Free Consultation', weight: 2, stock: 5, code: 'CONSULT', isNoPrize: false, campaignId: campaign.id || campaign._id.toString() },
  ];

  for (const prize of prizes) {
    await Prize.create(prize);
  }

  console.log('Seed complete!');
  await mongoose.connection.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
