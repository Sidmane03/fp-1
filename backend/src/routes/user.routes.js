import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  generateGuestPlan,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/calculate-plan', generateGuestPlan);

// --- Protected Routes ---
router.get('/profile', protect, getUserProfile);

export default router;