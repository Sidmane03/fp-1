import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculatePlanLogic, calculateBMI } from '../services/fitness.service.js';

// ============================================================
// PUBLIC: Calculate Plan Preview (no auth, no save)
// ============================================================

// @desc    Calculate fitness plan without saving
// @route   POST /api/users/calculate-plan
// @access  Public
const generateGuestPlan = asyncHandler(async (req, res) => {
  const plan = calculatePlanLogic(req.body);
  res.json({ success: true, data: plan });
});

// ============================================================
// PUBLIC: Register User
// ============================================================

// @desc    Register user + calculate & save fitnessProfile
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    gender,
    age,
    height,
    weight,
    activityLevel,
    goal,
    targetWeight,
    timeframeWeeks,
  } = req.body;

  // --- Validate ALL required fields upfront ---
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (!gender || !age || !height || !weight || !activityLevel || !goal) {
    res.status(400);
    throw new Error(
      'Please complete onboarding first: gender, age, height, weight, activityLevel, and goal are required'
    );
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('User already exists');
  }

  // Calculate fitness profile
  const fitnessProfile = calculatePlanLogic({
    gender,
    weight,
    height,
    age,
    activityLevel,
    goal,
    targetWeight,
    timeframeWeeks,
  });

  // Create user with fitnessProfile in one operation
  const user = await User.create({
    name,
    email,
    password,
    gender,
    age,
    height,
    weight,
    activityLevel,
    goal,
    targetWeight,
    timeframeWeeks,
    fitnessProfile,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      fitnessProfile: user.fitnessProfile,
      token,
    },
  });
});

// ============================================================
// PUBLIC: Login
// ============================================================

// @desc    Authenticate user & return token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Explicitly select password since it's hidden by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });
});

// ============================================================
// PRIVATE: Get User Profile
// ============================================================

// @desc    Get logged-in user's profile + health stats
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      age: user.age,
      height: user.height,
      weight: user.weight,
      goal: user.goal,
      activityLevel: user.activityLevel,
      targetWeight: user.targetWeight,
      timeframeWeeks: user.timeframeWeeks,
      fitnessProfile: user.fitnessProfile,
      bmi: calculateBMI(user.weight, user.height),
    },
  });
});

export { registerUser, authUser, getUserProfile, generateGuestPlan };