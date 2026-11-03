import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedAdmins = async () => {
  try {
    const name = process.env.ADMIN_NAME || 'System Admin';
    const email = process.env.ADMIN_EMAIL?.trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before seeding an admin.');
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
      return;
    }
    if (password.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      department: 'Administration',
      year: 'N/A',
      interests: ['AI', 'Coding', 'Sports', 'Arts', 'Robotics']
    });

    console.log('Admin created successfully:', admin.email);
  } catch (error) {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmins();
