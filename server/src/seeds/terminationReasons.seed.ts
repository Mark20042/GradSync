/**
 * Seed script: Populate default TerminationReason documents.
 * Run once: npx ts-node src/seeds/terminationReasons.seed.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import TerminationReason from '../models/TerminationReason.model.js';

const defaultReasons = [
  { label: 'Contract ended', description: 'The employment contract naturally reached its end date.', order: 1 },
  { label: 'Performance issues', description: 'Employee did not meet the expected performance standards.', order: 2 },
  { label: 'Misconduct', description: 'Employee violated company policies or code of conduct.', order: 3 },
  { label: 'Resigned', description: 'Employee voluntarily resigned from the position.', order: 4 },
  { label: 'Redundancy', description: 'The position was made redundant due to restructuring.', order: 5 },
  { label: 'Probationary period failed', description: 'Employee did not pass the probationary evaluation.', order: 6 },
  { label: 'Other', description: 'Another reason not listed above.', order: 7 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB.');

  for (const reason of defaultReasons) {
    const exists = await TerminationReason.findOne({ label: reason.label });
    if (!exists) {
      await TerminationReason.create(reason);
      console.log(`✅ Created: "${reason.label}"`);
    } else {
      console.log(`⏭️  Skipped (exists): "${reason.label}"`);
    }
  }

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

seed().catch(console.error);
