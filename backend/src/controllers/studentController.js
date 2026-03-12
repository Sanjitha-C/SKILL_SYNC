import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Attendance from '../models/Attendance.js';
import Feedback from '../models/Feedback.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import EventSummary from '../models/EventSummary.js';

export const institutionInfo = async (req, res) => {
  res.json({
    name: 'Opportunity Matcher Institute',
    description:
      'Opportunity Matcher Institute helps students discover and engage with events, workshops, and co-curricular activities aligned with their interests.'
  });
};

export const getMatchedOpportunities = async (req, res) => {
  const interests = req.user.interests || [];
  const interestedDomains = req.user.interestedDomains || [];

  const existing = await Registration.find({ student: req.user._id }).select('event');
  const excludedEventIds = existing.map((item) => item.event);

  const query = {
    _id: { $nin: excludedEventIds }
  };

  if (interests.length > 0 || interestedDomains.length > 0) {
    const orConditions = [];
    if (interests.length > 0) {
      orConditions.push({ interests: { $in: interests } });
      orConditions.push({ category: { $in: interests } });
    }
    if (interestedDomains.length > 0) {
      orConditions.push({ domains: { $in: interestedDomains } });
      orConditions.push({ category: { $in: interestedDomains } });
    }
    query.$or = orConditions;
  }

  let events = await Event.find(query).sort({ date: 1 });

  if (events.length === 0) {
    events = await Event.find({ _id: { $nin: excludedEventIds } }).sort({ date: 1 });
  }

  const eventIds = events.map((event) => event._id);
  const slotsFilledSummary = await Registration.aggregate([
    { $match: { event: { $in: eventIds }, status: 'registered' } },
    { $group: { _id: '$event', count: { $sum: 1 } } }
  ]);

  const slotsFilledMap = Object.fromEntries(slotsFilledSummary.map((item) => [String(item._id), item.count]));
  const response = events.map((event) => {
    const eventData = event.toObject();
    return {
      ...eventData,
      slotsFilled: slotsFilledMap[String(event._id)] || 0
    };
  });

  res.json(response);
};

export const registerOpportunity = async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId).select('title slots publishedBy');
  if (!event) return res.status(404).json({ message: 'Event not found.' });

  const existing = await Registration.findOne({ student: req.user._id, event: eventId });
  if (existing) return res.status(409).json({ message: 'Already responded to this event.' });

  const registration = await Registration.create({
    student: req.user._id,
    event: eventId,
    status: 'registered'
  });

  if (event.slots > 0) {
    const slotsFilled = await Registration.countDocuments({ event: eventId, status: 'registered' });
    const remainingSlots = Math.max(event.slots - slotsFilled, 0);
    const nearFullByRatio = slotsFilled / event.slots >= 0.8;
    const nearFullByRemaining = remainingSlots > 0 && remainingSlots <= 3;

    if (nearFullByRatio || nearFullByRemaining) {
      const title = `Limited slots left: ${event.title}`;
      const existingNotice = await Message.findOne({
        title,
        targetRole: 'student',
        targetMenu: 'opportunities'
      });

      if (!existingNotice) {
        await Message.create({
          title,
          body: `Only ${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} are available for ${event.title}. Are you interested?`,
          targetRole: 'student',
          targetMenu: 'opportunities',
          createdBy: event.publishedBy || req.user._id
        });
      }
    }
  }

  res.status(201).json(registration);
};

export const skipOpportunity = async (req, res) => {
  const { eventId } = req.params;

  const existing = await Registration.findOne({ student: req.user._id, event: eventId });
  if (existing) return res.status(409).json({ message: 'Already responded to this event.' });

  const skipped = await Registration.create({
    student: req.user._id,
    event: eventId,
    status: 'skipped'
  });

  res.status(201).json(skipped);
};

export const getProgress = async (req, res) => {
  const attendedCount = await Attendance.countDocuments({ student: req.user._id, present: true });
  const registrationCount = await Registration.countDocuments({ student: req.user._id, status: 'registered' });
  const completion = registrationCount > 0 ? Math.round((attendedCount / registrationCount) * 100) : 0;

  let badge = 'Explorer';
  if (attendedCount >= 5) badge = 'Achiever';
  if (attendedCount >= 10) badge = 'Champion';

  res.json({ attendedCount, registrationCount, completion, badge });
};

export const getAttendance = async (req, res) => {
  const attendance = await Attendance.find({ student: req.user._id, present: true })
    .populate('event', 'title category interests domains registrationFee registrationLink date venue')
    .sort({ updatedAt: -1 });

  res.json(attendance);
};

export const getStudentReports = async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id, status: 'registered' })
    .populate('event', 'title category interests domains registrationFee registrationLink date venue')
    .sort({ createdAt: -1 });

  const feedbackList = await Feedback.find({ student: req.user._id }).select('event rating comment');
  const feedbackMap = Object.fromEntries(feedbackList.map((item) => [String(item.event), item]));

  const reports = registrations.map((item) => ({
    registrationId: item._id,
    event: item.event,
    feedback: feedbackMap[String(item.event?._id)] || null
  }));

  res.json(reports);
};

export const getPublishedEventSummaries = async (req, res) => {
  const eventSummaries = await EventSummary.find()
    .sort({ createdAt: -1 })
    .populate('event', 'title date venue')
    .populate('publishedBy', 'name role');

  res.json(eventSummaries);
};

export const submitFeedback = async (req, res) => {
  const { eventId } = req.params;
  const { rating = 5, comment = '' } = req.body;

  const registration = await Registration.findOne({
    student: req.user._id,
    event: eventId,
    status: 'registered'
  });

  if (!registration) {
    return res.status(403).json({ message: 'You can only feedback for registered events.' });
  }

  const feedback = await Feedback.findOneAndUpdate(
    { student: req.user._id, event: eventId },
    { rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json(feedback);
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({
    $or: [
      { targetRole: 'all' },
      { targetRole: req.user.role },
      { recipient: req.user._id }
    ]
  })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name role');

  res.json(messages);
};

export const markAllMessagesRead = async (req, res) => {
  await Message.updateMany(
    {
      $or: [{ targetRole: 'all' }, { targetRole: req.user.role }, { recipient: req.user._id }],
      readBy: { $ne: req.user._id }
    },
    {
      $addToSet: { readBy: req.user._id }
    }
  );

  res.json({ message: 'Notifications marked as read.' });
};

export const updateStudentProfile = async (req, res) => {
  const { interests, interestedDomains } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (Array.isArray(interests)) {
    user.interests = interests.map((item) => String(item).trim()).filter(Boolean);
  }

  if (Array.isArray(interestedDomains)) {
    user.interestedDomains = interestedDomains.map((item) => String(item).trim()).filter(Boolean);
  }

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      interests: user.interests || [],
      interestedDomains: user.interestedDomains || []
    }
  });
};
