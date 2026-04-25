export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  targetWeight?: number;
  timeframeWeeks?: number;
  bmi: number | null;
  createdAt?: string;
  fitnessProfile: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
}

export interface IntakeLog {
  items: FoodItem[];
  calories: number;
  loggedAt: string;
}

export interface WeightLog {
  weight: number;
  loggedAt: string;
}

export type Tab = "home" | "progress" | "profile";
