import { createContext, useContext, useState, type ReactNode } from 'react';

// 1. Define the shape of the data we are collecting
export interface OnboardingData {
  gender: 'male' | 'female' | 'other';
  age: string;
  height: string;
  weight: string;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  pace: 'normal' | 'aggressive'; // For how fast they want to reach the goal
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  // 2. Set default values
  const [data, setData] = useState<OnboardingData>({
    gender: 'male',
    age: '',
    height: '',
    weight: '',
    goal: 'lose_weight',
    activityLevel: 'moderate',
    pace: 'normal'
  });

  // 3. Helper function to update state from any step
  const updateData = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};
