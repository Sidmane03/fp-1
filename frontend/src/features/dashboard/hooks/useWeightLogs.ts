import { useState, useMemo, useCallback } from "react";
import type { UserProfile, WeightLog } from "../types/dashboard.types";

function getWeekKey(): string {
  const d = new Date();
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function getWeightLog(weekKey: string): WeightLog | null {
  try {
    const raw = localStorage.getItem(`weight_log_${weekKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setWeightLog(weekKey: string, log: WeightLog): void {
  localStorage.setItem(`weight_log_${weekKey}`, JSON.stringify(log));
}

export function useWeightLogs(profile: UserProfile | null, onAfterLog?: () => void) {
  const [weekWeight, setWeekWeight] = useState<WeightLog | null>(() => getWeightLog(getWeekKey()));

  const registrationDay = useMemo(() => {
    if (!profile?.createdAt) return new Date().getDay();
    return new Date(profile.createdAt).getDay();
  }, [profile]);

  const isCheckInDay = new Date().getDay() === registrationDay;

  const daysUntilCheckIn = useMemo(() => {
    const today = new Date().getDay();
    if (today === registrationDay) return 0;
    return (registrationDay - today + 7) % 7;
  }, [registrationDay]);

  const currentWeight = weekWeight?.weight ?? profile?.weight ?? 0;
  const targetWeight = profile?.targetWeight ?? profile?.weight ?? 0;
  const startWeight = profile?.weight ?? 0;
  const weightRange = Math.abs(targetWeight - startWeight);
  const weightProgress = weightRange > 0 ? Math.min(1, Math.abs(currentWeight - startWeight) / weightRange) : 0;

  const logWeight = useCallback((weight: number) => {
    const weekKey = getWeekKey();
    const log: WeightLog = { weight, loggedAt: new Date().toISOString() };
    setWeightLog(weekKey, log);
    setWeekWeight(log);
    // Trigger FL training after successful weight log
    onAfterLog?.();
  }, [onAfterLog]);

  return {
    weekWeight,
    currentWeight,
    weightProgress,
    isCheckInDay,
    daysUntilCheckIn,
    logWeight,
  };
}
