import { Router } from 'express';
import {
  getAttendance,
  getMatchedOpportunities,
  getMessages,
  getPublishedEventSummaries,
  getProgress,
  getStudentReports,
  institutionInfo,
  markAllMessagesRead,
  registerOpportunity,
  skipOpportunity,
  submitFeedback,
  updateStudentProfile
} from '../controllers/studentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect, authorize('student'));

router.get('/institution', institutionInfo);
router.get('/opportunities', getMatchedOpportunities);
router.post('/opportunities/:eventId/register', registerOpportunity);
router.post('/opportunities/:eventId/skip', skipOpportunity);
router.get('/progress', getProgress);
router.get('/attendance', getAttendance);
router.get('/reports', getStudentReports);
router.get('/reports/event-summaries', getPublishedEventSummaries);
router.post('/reports/:eventId/feedback', submitFeedback);
router.get('/messages', getMessages);
router.patch('/messages/read-all', markAllMessagesRead);
router.patch('/profile', updateStudentProfile);

export default router;
