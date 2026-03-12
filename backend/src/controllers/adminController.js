import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Attendance from '../models/Attendance.js';
import Message from '../models/Message.js';
import EventSummary from '../models/EventSummary.js';
import Feedback from '../models/Feedback.js';

export const createEvent = async (req, res) => {
  const { title, description, date, venue, registrationFee, slots, registrationLink = '' } = req.body;
  let parsedInterests = [];
  let parsedDomains = [];

  try {
    parsedInterests = Array.isArray(req.body.interests)
      ? req.body.interests
      : req.body.interests
        ? JSON.parse(req.body.interests)
        : [];

    parsedDomains = Array.isArray(req.body.domains)
      ? req.body.domains
      : req.body.domains
        ? JSON.parse(req.body.domains)
        : [];
  } catch {
    return res.status(400).json({ message: 'Invalid interests or domains format.' });
  }

  if (!title || !description || !date || !venue) {
    return res.status(400).json({ message: 'All event fields are required.' });
  }

  const parsedFee = Number(registrationFee);
  if (Number.isNaN(parsedFee) || parsedFee < 0) {
    return res.status(400).json({ message: 'Registration fee must be a valid non-negative number.' });
  }

  const parsedSlots = Number(slots);
  if (Number.isNaN(parsedSlots) || parsedSlots < 1 || !Number.isInteger(parsedSlots)) {
    return res.status(400).json({ message: 'Slots must be a valid whole number greater than 0.' });
  }

  if (!Array.isArray(parsedInterests) || parsedInterests.length === 0) {
    return res.status(400).json({ message: 'At least one interest is required.' });
  }

  if (!Array.isArray(parsedDomains) || parsedDomains.length === 0) {
    return res.status(400).json({ message: 'At least one domain is required.' });
  }

  const posterUrl = req.file ? `/uploads/${req.file.filename}` : '';
  const event = await Event.create({
    title,
    description,
    category: parsedInterests[0] || parsedDomains[0] || 'General',
    interests: parsedInterests,
    domains: parsedDomains,
    registrationFee: parsedFee,
    slots: parsedSlots,
    registrationLink,
    date,
    venue,
    posterUrl,
    publishedBy: req.user._id
  });

  await Message.create({
    title: `New Opportunity: ${event.title}`,
    body: `${event.title} has been published. Check the Opportunities section to explore and register.`,
    targetRole: 'student',
    targetMenu: 'opportunities',
    createdBy: req.user._id
  });

  return res.status(201).json(event);
};

export const getAllEvents = async (req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.json(events);
};

export const getStudentsByEvent = async (req, res) => {
  const { eventId } = req.params;
  const registrations = await Registration.find({ event: eventId, status: 'registered' })
    .populate('student', 'name email department year interests')
    .populate('event', 'title category interests domains registrationFee registrationLink date venue');

  const studentIds = registrations.map((item) => item.student?._id).filter(Boolean);
  const attendanceList = await Attendance.find({ event: eventId, student: { $in: studentIds } }).select('student present');
  const attendanceMap = new Map(attendanceList.map((item) => [String(item.student), item.present]));

  const response = registrations.map((item) => ({
    ...item.toObject(),
    attendanceStatus: attendanceMap.has(String(item.student?._id)) ? attendanceMap.get(String(item.student?._id)) : null
  }));

  res.json(response);
};

export const getEventsWithStudentCounts = async (req, res) => {
  const summary = await Registration.aggregate([
    { $match: { status: 'registered' } },
    { $group: { _id: '$event', registrations: { $sum: 1 } } },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $project: {
        _id: 0,
        eventId: '$event._id',
        title: '$event.title',
        category: '$event.category',
        interests: '$event.interests',
        domains: '$event.domains',
        registrationFee: '$event.registrationFee',
        slots: '$event.slots',
        registrationLink: '$event.registrationLink',
        date: '$event.date',
        venue: '$event.venue',
        registrations: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  res.json(summary);
};

export const markAttendance = async (req, res) => {
  const { eventId } = req.params;
  const { studentId, present } = req.body;

  if (!studentId || typeof present !== 'boolean') {
    return res.status(400).json({ message: 'studentId and present (boolean) are required.' });
  }

  const registration = await Registration.findOne({ event: eventId, student: studentId, status: 'registered' });
  if (!registration) return res.status(404).json({ message: 'Registration not found.' });

  const existingAttendance = await Attendance.findOne({ event: eventId, student: studentId });
  if (existingAttendance) {
    return res.status(409).json({ message: 'Attendance already finalized for this student.' });
  }

  const attendance = await Attendance.create({
    event: eventId,
    student: studentId,
    present,
    markedBy: req.user._id
  });

  res.json(attendance);
};

export const getReportsSummary = async (req, res) => {
  const events = await Event.find().sort({ date: -1 });
  const registrationCounts = await Registration.aggregate([
    { $match: { status: 'registered' } },
    { $group: { _id: '$event', count: { $sum: 1 } } }
  ]);

  const attendanceCounts = await Attendance.aggregate([
    { $match: { present: true } },
    { $group: { _id: '$event', count: { $sum: 1 } } }
  ]);

  const regMap = Object.fromEntries(registrationCounts.map((item) => [String(item._id), item.count]));
  const attendMap = Object.fromEntries(attendanceCounts.map((item) => [String(item._id), item.count]));

  const byEvent = events.map((event) => ({
    eventId: event._id,
    title: event.title,
    category: event.category,
    interests: event.interests || [],
    domains: event.domains || [],
    registrationFee: event.registrationFee || 0,
    slots: event.slots || 0,
    registrationLink: event.registrationLink || '',
    date: event.date,
    venue: event.venue,
    registrations: regMap[String(event._id)] || 0,
    attendance: attendMap[String(event._id)] || 0
  }));

  const totals = byEvent.reduce(
    (acc, event) => {
      acc.totalEvents += 1;
      acc.totalRegistrations += event.registrations;
      acc.totalAttendance += event.attendance;
      return acc;
    },
    { totalEvents: 0, totalRegistrations: 0, totalAttendance: 0 }
  );

  const eventSummaries = await EventSummary.find()
    .sort({ createdAt: -1 })
    .populate('event', 'title date venue')
    .populate('publishedBy', 'name role');

  res.json({ byEvent, totals, eventSummaries });
};

export const createEventSummary = async (req, res) => {
  const { eventId, title = '', summary } = req.body;

  if (!eventId || !summary) {
    return res.status(400).json({ message: 'eventId and summary are required.' });
  }

  const event = await Event.findById(eventId).select('title');
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const imageUrls = Array.isArray(req.files) ? req.files.map((file) => `/uploads/${file.filename}`) : [];

  const eventSummary = await EventSummary.create({
    event: eventId,
    title: title.trim() || `How ${event.title} went`,
    summary,
    imageUrls,
    publishedBy: req.user._id
  });

  const populatedSummary = await EventSummary.findById(eventSummary._id)
    .populate('event', 'title date venue')
    .populate('publishedBy', 'name role');

  res.status(201).json(populatedSummary);
};

export const getPublishedEventSummaries = async (req, res) => {
  const eventSummaries = await EventSummary.find()
    .sort({ createdAt: -1 })
    .populate('event', 'title date venue')
    .populate('publishedBy', 'name role');

  res.json(eventSummaries);
};

export const getEventFeedbacks = async (req, res) => {
  const feedbacks = await Feedback.find()
    .sort({ createdAt: -1 })
    .populate('student', 'name email department year')
    .populate('event', 'title date venue');

  res.json(feedbacks);
};

export const createMessage = async (req, res) => {
  const { title, body, targetRole = 'student', recipient } = req.body;
  if (!title || !body) return res.status(400).json({ message: 'title and body are required.' });

  const message = await Message.create({
    title,
    body,
    targetRole,
    targetMenu: 'messages',
    recipient: recipient || undefined,
    createdBy: req.user._id
  });

  res.status(201).json(message);
};
