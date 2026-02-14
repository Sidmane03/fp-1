import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// ============================================================
// CONFIG
// ============================================================

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const CALS_PER_KG = 7700;

const SAFETY = {
  maxWeeklyLoss: 1,        // kg per week
  maxWeeklyGain: 0.5,      // kg per week (safer bulk)
  maxGainSurplus: 500,     // max kcal surplus per day
  fallbackDeficit: 500,
  fallbackSurplus: 300,
  minCalories: {
    male: 1500,
    female: 1200,
  },
};

const MACRO_CONFIG = {
  protein: {
    lose_weight: 2.2,
    gain_muscle: 2.0,
    maintain: 1.8,
  },
  fats: {
    lose_weight: 0.8,
    gain_muscle: 1.0,
    maintain: 0.9,
  },
};


// ============================================================
// CONFIG: All tunable constants in one place
// ============================================================
// 🔧 TEAM: Edit these values to adjust the plan logic globally.
//    No need to touch the formulas below.
const calculatePlanLogic = ({
  gender,
  weight,
  height,
  age,
  activityLevel,
  goal,
  targetWeight,
  timeframeWeeks,
}) => {
  if (!gender || !weight || !height || !age || !activityLevel || !goal) {
    const error = new Error(
      'Missing required fields: gender, weight, height, age, activityLevel, goal'
    );
    error.statusCode = 400;
    throw error;
  }

  if (targetWeight) {
    if (goal === 'lose_weight' && targetWeight >= weight) {
      const error = new Error(
        'Target weight must be less than current weight for a weight loss goal'
      );
      error.statusCode = 400;
      throw error;
    }
    if (goal === 'gain_muscle' && targetWeight <= weight) {
      const error = new Error(
        'Target weight must be greater than current weight for a muscle gain goal'
      );
      error.statusCode = 400;
      throw error;
    }
  }

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'male' ? 5 : -161;

  // B. TDEE
  const tdee = bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2);

  let targetCalories = tdee;

  if (goal !== 'maintain' && targetWeight && timeframeWeeks) {
    const weightDiff = Math.abs(targetWeight - weight);
    const rawWeeklyChange = weightDiff / timeframeWeeks;

    if (goal === 'lose_weight') {
      const safeWeeklyLoss = Math.min(rawWeeklyChange, SAFETY.maxWeeklyLoss);
      const dailyDeficit = (safeWeeklyLoss * CALS_PER_KG) / 7;
      targetCalories = tdee - dailyDeficit;
    } else if (goal === 'gain_muscle') {
      const safeWeeklyGain = Math.min(rawWeeklyChange, SAFETY.maxWeeklyGain);
      let dailySurplus = (safeWeeklyGain * CALS_PER_KG) / 7;
      dailySurplus = Math.min(dailySurplus, SAFETY.maxGainSurplus);
      targetCalories = tdee + dailySurplus;
    }
  } else if (goal === 'lose_weight') {
    targetCalories = tdee - SAFETY.fallbackDeficit;
  } else if (goal === 'gain_muscle') {
    targetCalories = tdee + SAFETY.fallbackSurplus;
  }

  const minCal = gender === 'male'
    ? SAFETY.minCalories.male
    : SAFETY.minCalories.female;
  targetCalories = Math.max(targetCalories, minCal);

  const proteinGrams = Math.round(weight * MACRO_CONFIG.protein[goal]);
  const fatGrams = Math.round(weight * MACRO_CONFIG.fats[goal]);
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const remainingCalories = Math.max(targetCalories - proteinCalories - fatCalories, 0);
  const carbGrams = Math.round(remainingCalories / 4);

  const macros = { protein: proteinGrams, carbs: carbGrams, fats: fatGrams };

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