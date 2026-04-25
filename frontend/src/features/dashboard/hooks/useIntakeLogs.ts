import { useState, useCallback } from "react";
import type { IntakeLog, FoodItem } from "../types/dashboard.types";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getIntakeLog(dateKey: string): IntakeLog | null {
  try {
    const raw = localStorage.getItem(`intake_log_${dateKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Handle legacy data (only calories, no items)
    if (!parsed.items) {
      return {
        items: [{ id: "legacy", name: "Logged Calories", calories: parsed.calories }],
        calories: parsed.calories,
        loggedAt: parsed.loggedAt || new Date().toISOString()
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

function setIntakeLog(dateKey: string, log: IntakeLog): void {
  localStorage.setItem(`intake_log_${dateKey}`, JSON.stringify(log));
}

function getAdherenceCount(): number {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (localStorage.getItem(`intake_log_${key}`)) count++;
  }
  return count;
}

export function useIntakeLogs() {
  const [todayLog, setTodayLog] = useState<IntakeLog | null>(() => getIntakeLog(getTodayKey()));
  const [adherence, setAdherence] = useState(getAdherenceCount);

  const addFoodItem = useCallback((name: string, calories: number) => {
    const todayKey = getTodayKey();
    const currentLog = getIntakeLog(todayKey);
    
    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: name || "Unnamed Item",
      calories
    };

    const updatedItems = currentLog ? [...currentLog.items, newItem] : [newItem];
    const totalCalories = updatedItems.reduce((acc, item) => acc + item.calories, 0);

    const log: IntakeLog = {
      items: updatedItems,
      calories: totalCalories,
      loggedAt: new Date().toISOString()
    };

    setIntakeLog(todayKey, log);
    setTodayLog(log);
    setAdherence(getAdherenceCount());
  }, []);

  const editFoodItem = useCallback((id: string, name: string, calories: number) => {
    const todayKey = getTodayKey();
    const currentLog = getIntakeLog(todayKey);
    if (!currentLog) return;

    const updatedItems = currentLog.items.map(item => 
      item.id === id ? { ...item, name, calories } : item
    );
    const totalCalories = updatedItems.reduce((acc, item) => acc + item.calories, 0);

    const log: IntakeLog = {
      ...currentLog,
      items: updatedItems,
      calories: totalCalories
    };

    setIntakeLog(todayKey, log);
    setTodayLog(log);
  }, []);

  const removeFoodItem = useCallback((id: string) => {
    const todayKey = getTodayKey();
    const currentLog = getIntakeLog(todayKey);
    if (!currentLog) return;

    const updatedItems = currentLog.items.filter(item => item.id !== id);
    
    if (updatedItems.length === 0) {
      localStorage.removeItem(`intake_log_${todayKey}`);
      setTodayLog(null);
    } else {
      const totalCalories = updatedItems.reduce((acc, item) => acc + item.calories, 0);
      const log: IntakeLog = {
        ...currentLog,
        items: updatedItems,
        calories: totalCalories
      };
      setIntakeLog(todayKey, log);
      setTodayLog(log);
    }
    setAdherence(getAdherenceCount());
  }, []);

  return {
    todayLog,
    adherence,
    addFoodItem,
    editFoodItem,
    removeFoodItem,
  };
}
