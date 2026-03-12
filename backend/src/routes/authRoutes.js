import { Router } from 'express';
import { login, me, signupStudent } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signupStudent);
router.post('/login', login);
router.get('/me', protect, me);

export default router;
