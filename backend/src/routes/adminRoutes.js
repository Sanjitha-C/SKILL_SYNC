import { Router } from 'express';
import {
  createEventSummary,
  createEvent,
  getEventFeedbacks,
  createMessage,
  getAllEvents,
  getEventsWithStudentCounts,
  getPublishedEventSummaries,
  getReportsSummary,
  getStudentsByEvent,
  markAttendance
} from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, authorize('admin'));

router.post('/events', upload.single('poster'), createEvent);
router.get('/events', getAllEvents);

router.get('/students/events-summary', getEventsWithStudentCounts);
router.get('/students/event/:eventId', getStudentsByEvent);
router.patch('/students/event/:eventId/attendance', markAttendance);

router.get('/reports/summary', getReportsSummary);
router.get('/reports/event-summaries', getPublishedEventSummaries);
router.get('/reports/feedbacks', getEventFeedbacks);
router.post('/reports/event-summaries', upload.array('images', 5), createEventSummary);
router.post('/messages', createMessage);

export default router;
