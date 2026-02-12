import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/authMiddleware.js'; // Import the guard

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);

// This route is PROTECTED. The user must show a token to pass 'protect'.
router.get('/profile', protect, getUserProfile);

export default router;