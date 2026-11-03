import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * ADD MORE ADMINS HERE
  { name: 'Admin Name', email: 'admin@mail.com', password: 'SecurePassword123' }
 */
const adminsToCreate = [
  {
    name: process.env.ADMIN_NAME || 'System Admin',
    email: process.env.ADMIN_EMAIL || 'admin@opportunitymatcher.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123'
  }
];

const seedAdmins = async () => {
  try {
    await connectDB();

    let createdCount = 0;
    let existingCount = 0;

    for (const adminData of adminsToCreate) {
      const existing = await User.findOne({ email: adminData.email });

      if (existing) {
        console.log('✓ Admin already exists:', adminData.email);
        existingCount += 1;
        continue;
      }

      const admin = await User.create({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: 'admin',
        department: 'Administration',
        year: 'N/A',
        interests: ['AI', 'Coding', 'Sports', 'Arts', 'Robotics']
      });

      console.log('✓ Admin created successfully:', admin.email);
      createdCount += 1;
    }

    console.log(`\n📊 Summary: ${createdCount} new admin(s) created, ${existingCount} already existed.`);
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmins();

process.on('exit', async () => {
  await mongoose.disconnect();
});
