import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- Macros Sub-Schema ---
const macrosSchema = new mongoose.Schema(
  {
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  { _id: false }
);

// --- Fitness Profile Sub-Schema ---
const fitnessProfileSchema = new mongoose.Schema(
  {
    bmr: { type: Number, default: 0 },
    tdee: { type: Number, default: 0 },
    targetCalories: { type: Number, default: 0 },
    macros: { type: macrosSchema, default: () => ({}) },
  },
  { _id: false }
);

// --- Main User Schema ---
const userSchema = new mongoose.Schema(
  {
    // Auth
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    // Biometrics
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender',
      },
    },
    age: { type: Number, min: 13, max: 120 },
    height: { type: Number, min: 50, max: 300 }, // cm
    weight: { type: Number, min: 20, max: 500 }, // kg

    // Goals
    activityLevel: {
      type: String,
      enum: {
        values: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        message: '{VALUE} is not a valid activity level',
      },
    },
    goal: {
      type: String,
      enum: {
        values: ['lose_weight', 'maintain', 'gain_muscle'],
        message: '{VALUE} is not a valid goal',
      },
    },
    targetWeight: { type: Number }, // kg — desired weight
    timeframeWeeks: { type: Number, min: 1, max: 52 }, // how many weeks

    // Calculated Plan
    fitnessProfile: { type: fitnessProfileSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);



// --- Encrypt Password Before Save ---
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// --- Compare Password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;