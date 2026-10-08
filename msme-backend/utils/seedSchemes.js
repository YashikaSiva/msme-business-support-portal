// Run with: npm run seed
// Seeds the schemes collection with the same data the Angular frontend used to hardcode.
require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');

const schemes = [
  {
    schemeId: 'pmegp', name: 'PMEGP', authority: 'Central', category: 'Manufacturing',
    description: 'National scheme for setting up new micro-enterprises through subsidised loans.',
    subsidyText: 'Up to 35% subsidy · ₹10L (service) / ₹25L (manufacturing) max loan',
    minAge: 18, minInvestment: 0, maxInvestment: 2500000,
    businessTypes: ['Manufacturing', 'Service'],
  },
  {
    schemeId: 'mudra', name: 'PM MUDRA Yojana', authority: 'Central', category: 'Credit/Loan',
    description: 'Collateral-free loans under Shishu, Kishore, and Tarun categories.',
    subsidyText: 'Loans up to ₹10 lakh, no collateral',
    minAge: 18, minInvestment: 0, maxInvestment: 1000000,
    businessTypes: ['Manufacturing', 'Service', 'Trading'],
  },
  {
    schemeId: 'cgtmse', name: 'CGTMSE', authority: 'Central', category: 'Credit/Loan',
    description: 'Credit guarantee cover so lenders can offer collateral-free loans to MSMEs.',
    subsidyText: 'Guarantee cover up to ₹5 crore',
    minAge: 18, minInvestment: 0,
    businessTypes: ['Manufacturing', 'Service'],
  },
  {
    schemeId: 'needs', name: 'NEEDS (Tamil Nadu)', authority: 'Tamil Nadu', category: 'First-Generation Entrepreneurs',
    description: 'Capital subsidy and interest subvention for first-generation entrepreneurs aged 21-35 (up to 45 for special categories).',
    subsidyText: '25% capital subsidy, up to ₹75 lakh',
    minAge: 21, maxAge: 45, minInvestment: 500000, maxInvestment: 30000000,
    businessTypes: ['Manufacturing', 'Service'],
  },
  {
    schemeId: 'tncgs', name: 'TNCGS', authority: 'Tamil Nadu', category: 'Credit/Loan',
    description: 'Tamil Nadu Credit Guarantee Scheme, run with CGTMSE to widen institutional credit access.',
    subsidyText: 'Improved access to collateral-free institutional credit',
    minAge: 18, minInvestment: 0,
    businessTypes: ['Manufacturing', 'Service', 'Trading'],
  },
  {
    schemeId: 'standup', name: 'Stand-Up India', authority: 'Central', category: 'Women Entrepreneurs',
    description: 'Bank loans for women and SC/ST entrepreneurs setting up greenfield enterprises.',
    subsidyText: '₹10 lakh - ₹1 crore loans',
    minAge: 18, minInvestment: 1000000, maxInvestment: 10000000,
    businessTypes: ['Manufacturing', 'Service', 'Trading'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const s of schemes) {
      await Scheme.findOneAndUpdate({ schemeId: s.schemeId }, s, { upsert: true, new: true, runValidators: true });
    }

    console.log(`Seeded ${schemes.length} schemes successfully.`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
