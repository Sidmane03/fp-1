import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { OnboardingData, PlanPreview } from "../types";

interface OnboardingContextType {
  data: OnboardingData;
  planPreview: PlanPreview | null;
  planRevealed: boolean;
  updateData: (fields: Partial<OnboardingData>) => void;
  setPlanPreview: (plan: PlanPreview) => void;
  setPlanRevealed: (value: boolean) => void;
  resetOnboarding: () => void;
}

const initialData: OnboardingData = {
  gender: "male",
  age: "",
  height: "",
  weight: "",
  goal: "lose_weight",
  activityLevel: "moderate",
  targetWeight: "",
  timeframeWeeks: "",
  weeklyRate: "0.8",
};

const STORAGE_KEY = "fp_onboarding";

// Rehydrate from sessionStorage if available
const loadSavedData = (): OnboardingData => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialData, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return initialData;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(loadSavedData);
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [planRevealed, setPlanRevealed] = useState(false);

  // Persist onboarding data to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const resetOnboarding = () => {
    setData(initialData);
    setPlanPreview(null);
    setPlanRevealed(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider
      value={{
        data,
        planPreview,
        planRevealed,
        updateData,
        setPlanPreview,
        setPlanRevealed,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};