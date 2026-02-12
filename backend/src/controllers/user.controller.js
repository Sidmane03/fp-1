import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, gender, age, height, weight, activityLevel, goal } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name, email, password, gender, age, height, weight, activityLevel, goal
  });

  if (user) {
    // We generate the token here using our new utility
    const token = generateToken(res, user._id);
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token 
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// --- Helper Function: Calculate BMI (Source: WHO Formula [2]) ---
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100; // Convert cm to meters
  return (weightKg / (heightM * heightM)).toFixed(1); // Formula: kg / m^2
};

// ... keep registerUser and authUser functions ...

// @desc    Get user profile & Health Stats
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is already provided by the 'protect' middleware
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // Return biometric data for the Dashboard
      gender: user.gender,
      age: user.age,
      height: user.height,
      weight: user.weight,
      goal: user.goal,
      activityLevel: user.activityLevel,
      // Dynamic Calculation: Add BMI to the response immediately
      bmi: calculateBMI(user.weight, user.height) 
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Update the export to include the new function
export { registerUser, authUser, getUserProfile };