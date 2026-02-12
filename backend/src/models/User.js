import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  // --- Auth Fields ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- Fitness Profile ---
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] 
  },
  goal: { 
    type: String, 
    enum: ['lose_weight', 'maintain', 'gain_muscle'] 
  }
}, {
  timestamps: true
});

// --- Encrypt Password before Saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// --- Method to Check Password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.model('User', userSchema);