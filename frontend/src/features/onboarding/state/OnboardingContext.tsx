import { createContext, useContext, useState, type ReactNode } from "react";
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
  weeklyRate: "0.8",       // NEW: default recommended pace
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [planRevealed, setPlanRevealed] = useState(false);

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const resetOnboarding = () => {
    setData(initialData);
    setPlanPreview(null);
    setPlanRevealed(false);
  };

return (
  <OnboardingContext.Provider
    value={ {
      data,
      planPreview,
      planRevealed,
      updateData,
      setPlanPreview,
      setPlanRevealed,
      resetOnboarding,
    } }
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