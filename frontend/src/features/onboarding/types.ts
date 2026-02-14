export interface OnboardingData {
  gender: "male" | "female" | "other";
  age: string;
  height: string;
  weight: string;
  goal: "lose_weight" | "maintain" | "gain_muscle";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  targetWeight: string;
  timeframeWeeks: string;
}

export interface PlanPreview {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}
export interface OnboardingData {
  gender: "male" | "female" | "other";
  age: string;
  height: string;
  weight: string;
  goal: "lose_weight" | "maintain" | "gain_muscle";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  targetWeight: string;
  timeframeWeeks: string;
  weeklyRate: string;       // NEW: kg per week from slider
}