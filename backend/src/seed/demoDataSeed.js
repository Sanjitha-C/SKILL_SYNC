import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Attendance from '../models/Attendance.js';
import Event from '../models/Event.js';
import EventSummary from '../models/EventSummary.js';
import Feedback from '../models/Feedback.js';
import Message from '../models/Message.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const ensureEvent = async (adminId, eventData) => {
  const existing = await Event.findOne({ title: eventData.title, publishedBy: adminId });
  if (existing) return { event: existing, created: false };

  const event = await Event.create({ ...eventData, publishedBy: adminId });
  return { event, created: true };
};

const ensureRecord = async (Model, filter, values) => {
  const existing = await Model.findOne(filter);
  if (existing) return false;

  await Model.create(values);
  return true;
};

const seedDemoData = async () => {
  await connectDB();

  try {
    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: -1 });
    const student = await User.findOne({ role: 'student' }).sort({ createdAt: -1 });

    if (!admin || !student) {
      throw new Error('Create an admin and a student account before seeding demo data.');
    }

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - 30);
    const upcomingDate = new Date(now);
    upcomingDate.setDate(upcomingDate.getDate() + 14);
    const openDate = new Date(now);
    openDate.setDate(openDate.getDate() + 35);

    const eventDefinitions = [
      {
        title: '[Skill Sync Demo] AI Innovation Workshop',
        description: 'A hands-on workshop exploring responsible AI and student research projects.',
        category: 'AI',
        interests: ['AI', 'Research'],
        domains: ['Machine Learning', 'Data Science'],
        registrationFee: 0,
        slots: 40,
        registrationLink: '',
        date: pastDate,
        venue: 'Innovation Lab'
      },
      {
        title: '[Skill Sync Demo] Cloud Skills Bootcamp',
        description: 'A practical introduction to cloud platforms, deployment, and teamwork.',
        category: 'Coding',
        interests: ['Coding', 'Entrepreneurship'],
        domains: ['Cloud Computing', 'Web Development'],
        registrationFee: 150,
        slots: 30,
        registrationLink: '',
        date: upcomingDate,
        venue: 'Seminar Hall A'
      },
      {
        title: '[Skill Sync Demo] Robotics Design Challenge',
        description: 'Build and present a small robotics prototype with an interdisciplinary team.',
        category: 'Robotics',
        interests: ['Robotics', 'Design'],
        domains: ['IoT', 'Mobile Development'],
        registrationFee: 0,
        slots: 25,
        registrationLink: '',
        date: openDate,
        venue: 'Engineering Workshop'
      }
    ];

    const seededEvents = [];
    let createdEvents = 0;
    for (const definition of eventDefinitions) {
      const result = await ensureEvent(admin._id, definition);
      seededEvents.push(result.event);
      if (result.created) createdEvents += 1;
    }

    const [pastEvent, registeredEvent] = seededEvents;
    let createdRegistrations = 0;
    if (await ensureRecord(
      Registration,
      { student: student._id, event: pastEvent._id },
      { student: student._id, event: pastEvent._id, status: 'registered' }
    )) createdRegistrations += 1;

    if (await ensureRecord(
      Registration,
      { student: student._id, event: registeredEvent._id },
      { student: student._id, event: registeredEvent._id, status: 'registered' }
    )) createdRegistrations += 1;

    const createdAttendance = await ensureRecord(
      Attendance,
      { student: student._id, event: pastEvent._id },
      { student: student._id, event: pastEvent._id, present: true, markedBy: admin._id }
    );

    const createdFeedback = await ensureRecord(
      Feedback,
      { student: student._id, event: pastEvent._id },
      {
        student: student._id,
        event: pastEvent._id,
        rating: 5,
        comment: 'The practical activities were engaging and useful.'
      }
    );

    const summaryTitle = '[Skill Sync Demo] AI Workshop Outcome';
    const createdSummary = await ensureRecord(
      EventSummary,
      { event: pastEvent._id, title: summaryTitle },
      {
        event: pastEvent._id,
        title: summaryTitle,
        summary: 'Students explored responsible AI concepts and presented early research ideas in small teams.',
        publishedBy: admin._id
      }
    );

    const messageTitle = '[Skill Sync Demo] Welcome to Skill Sync';
    const createdMessage = await ensureRecord(
      Message,
      { title: messageTitle, createdBy: admin._id },
      {
        title: messageTitle,
        body: 'Explore the opportunities section to find workshops and activities that match your interests.',
        targetRole: 'student',
        targetMenu: 'messages',
        createdBy: admin._id
      }
    );

    console.log(JSON.stringify({
      seededStudentRecords: true,
      createdEvents,
      createdRegistrations,
      createdAttendance: Number(createdAttendance),
      createdFeedback: Number(createdFeedback),
      createdEventSummary: Number(createdSummary),
      createdMessage: Number(createdMessage)
    }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoData().catch((error) => {
  console.error('Demo data seed failed:', error.message);
  process.exitCode = 1;
});
