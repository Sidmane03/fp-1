import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================
// HELPER: Fitness Plan Calculator (pure function, no DB)
// ============================================================

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const CALS_PER_KG = 7700; // ~calories in 1 kg of body weight

const calculatePlanLogic = ({ gender, weight, height, age, activityLevel, goal, targetWeight, timeframeWeeks }) => {
  if (!gender || !weight || !height || !age || !activityLevel || !goal) {
    const error = new Error(
      'Missing required fields: gender, weight, height, age, activityLevel, goal'
    );
    error.statusCode = 400; // Add this
    throw error;
  }

  // A. BMR — Mifflin-St Jeor
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'male' ? 5 : -161;

  // B. TDEE
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2);

  // C. Target Calories — based on goal + timeframe
  let targetCalories = tdee;
  let dailyAdjustment = 0;

  if (goal !== 'maintain' && targetWeight && timeframeWeeks) {
    // Dynamic: user provided a target weight and timeframe
    const weightDiff = Math.abs(targetWeight - weight);
    const weeklyChange = weightDiff / timeframeWeeks;

    // Safety cap: max 1 kg/week loss, max 1 kg/week gain
    const safeWeeklyChange = Math.min(weeklyChange, 1);

    dailyAdjustment = (safeWeeklyChange * CALS_PER_KG) / 7;

    if (goal === 'lose_weight') {
      targetCalories = tdee - dailyAdjustment;
    } else if (goal === 'gain_muscle') {
      targetCalories = tdee + dailyAdjustment;
    }
  } else if (goal === 'lose_weight') {
    // Fallback: no timeframe provided, use standard deficit
    targetCalories = tdee - 500;
  } else if (goal === 'gain_muscle') {
    targetCalories = tdee + 300;
  }

  // Safety floor
  const minCalories = gender === 'male' ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCalories);

  // D. Macros — 30% protein, 40% carbs, 30% fats
  const macros = {
    protein: Math.round((targetCalories * 0.3) / 4),
    carbs: Math.round((targetCalories * 0.4) / 4),
    fats: Math.round((targetCalories * 0.3) / 9),
  };

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros,
  };
};

// ============================================================
// HELPER: BMI Calculator
// ============================================================

const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

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