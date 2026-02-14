import { api } from "../../../lib/axios";
import type { OnboardingData, PlanPreview } from "../types";

export const onboardingApi = {
  async calculatePlan(data: OnboardingData): Promise<PlanPreview> {
    const payload = {
      gender: data.gender,
      age: Number(data.age),
      height: Number(data.height),
      weight: Number(data.weight),
      goal: data.goal,
      activityLevel: data.activityLevel,
      targetWeight: data.targetWeight ? Number(data.targetWeight) : undefined,
      timeframeWeeks: data.timeframeWeeks
        ? Number(data.timeframeWeeks)
        : undefined,
    };

    const { data: res } = await api.post("/api/users/calculate-plan", payload);
    return res.data;
  },
};