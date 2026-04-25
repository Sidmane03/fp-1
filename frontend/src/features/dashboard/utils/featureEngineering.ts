export interface FeatureVector {
  adherenceRate: number;       // 0–1: avg daily intake / formulaTarget
  expectedWeightDelta: number; // kg: what formula predicted for the week
  actualWeightDelta: number;   // kg: what actually happened
  weekCount: number;           // normalized: distinct weeks / 52, clamped 0–1
}

export interface TrainingExample {
  features: FeatureVector;
  label: number; // target α
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeNum(n: number, fallback = 0): number {
  return isFinite(n) && !isNaN(n) ? n : fallback;
}

function makeDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMondayKey(d: Date): string {
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return makeDateKey(monday);
}

// ─── buildFeatureVector ──────────────────────────────────────────────────────

/**
 * Reads the last 7 intake logs and last 2 weight logs from localStorage
 * and builds a normalized FeatureVector for model training/inference.
 */
export function buildFeatureVector(formulaTarget: number): FeatureVector {
  const today = new Date();

  // ── 1. Adherence rate from last 7 intake logs ──
  let totalRatio = 0;
  let loggedDays = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `intake_log_${makeDateKey(d)}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const calories = typeof parsed.calories === "number" ? parsed.calories : 0;
        totalRatio += formulaTarget > 0 ? calories / formulaTarget : 1;
        loggedDays++;
      }
    } catch {
      // silently skip corrupt entries
    }
  }
  const adherenceRate = safeNum(loggedDays > 0 ? totalRatio / loggedDays : 1.0, 1.0);

  // ── 2. Expected weight delta (formula approximation) ──
  // Without stored TDEE/goal we approximate a weekly delta:
  // lose_weight → -0.5 kg/wk, gain_muscle → +0.3 kg/wk, maintain → 0
  // We read goal from the nearest intake log's context — we don't have goal
  // stored in featureEngineering, so default per-spec:
  //   deficit 500 kcal/day → 500×7/7700 ≈ 0.45 kg/wk → use −0.5
  //   surplus 300 kcal/day → 300×7/7700 ≈ 0.27 kg/wk → use +0.3
  // We can't read goal here, so we use −0.5 as the default (conservative)
  // Callers that know the goal should override via buildFeatureVectorWithGoal.
  const expectedWeightDelta = -0.5;

  // ── 3. Actual weight delta from last 2 weekly weight logs ──
  const seenKeys: string[] = [];
  for (let weeksBack = 0; weeksBack < 12 && seenKeys.length < 2; weeksBack++) {
    const d = new Date(today);
    d.setDate(today.getDate() - weeksBack * 7);
    const key = `weight_log_${getMondayKey(d)}`;
    if (!seenKeys.includes(key) && localStorage.getItem(key)) {
      seenKeys.push(key);
    }
  }

  let actualWeightDelta = 0;
  if (seenKeys.length >= 2) {
    try {
      const current = JSON.parse(localStorage.getItem(seenKeys[0])!);
      const previous = JSON.parse(localStorage.getItem(seenKeys[1])!);
      if (typeof current.weight === "number" && typeof previous.weight === "number") {
        actualWeightDelta = safeNum(current.weight - previous.weight, 0);
      }
    } catch {
      actualWeightDelta = 0;
    }
  }

  // ── 4. Week count (normalized) ──
  const allKeys = Object.keys(localStorage);
  const distinctWeekKeys = new Set(
    allKeys.filter((k) => k.startsWith("weight_log_"))
  );
  const weekCount = safeNum(Math.min(distinctWeekKeys.size / 52, 1), 0);

  return {
    adherenceRate: safeNum(Math.max(0, Math.min(1, adherenceRate)), 1.0),
    expectedWeightDelta: safeNum(expectedWeightDelta, -0.5),
    actualWeightDelta: safeNum(actualWeightDelta, 0),
    weekCount: safeNum(weekCount, 0),
  };
}

/**
 * Same as buildFeatureVector but uses the user's goal to set expectedWeightDelta.
 */
export function buildFeatureVectorWithGoal(
  formulaTarget: number,
  goal: string
): FeatureVector {
  const base = buildFeatureVector(formulaTarget);
  let expectedWeightDelta: number;
  if (goal === "lose_weight") {
    expectedWeightDelta = -(500 * 7) / 7700; // ≈ −0.45
  } else if (goal === "gain_muscle") {
    expectedWeightDelta = (300 * 7) / 7700; // ≈ +0.27
  } else {
    expectedWeightDelta = 0;
  }
  return { ...base, expectedWeightDelta: safeNum(expectedWeightDelta, 0) };
}

// ─── buildLabel ──────────────────────────────────────────────────────────────

const ALPHA_MIN = 0.7;
const ALPHA_MAX = 1.3;

/**
 * Computes the target α correction factor from observed vs expected results.
 */
export function buildLabel(features: FeatureVector): number {
  const { adherenceRate, expectedWeightDelta, actualWeightDelta } = features;

  if (expectedWeightDelta === 0) return 1.0;

  let alpha: number;
  if (adherenceRate > 0.85) {
    // User was following the plan — formula may need correction
    const gap = actualWeightDelta - expectedWeightDelta;
    alpha = 1.0 - (gap / expectedWeightDelta) * 0.5;
  } else {
    // User wasn't following the plan — don't blame the formula
    alpha = 1.0;
  }

  return safeNum(Math.max(ALPHA_MIN, Math.min(ALPHA_MAX, alpha)), 1.0);
}

// ─── hasEnoughData ───────────────────────────────────────────────────────────

/**
 * Returns true only if there are at least 2 distinct weight log weeks in localStorage.
 * This gates whether FL training should run.
 */
export function hasEnoughData(): boolean {
  const allKeys = Object.keys(localStorage);
  const weekKeys = allKeys.filter((k) => k.startsWith("weight_log_"));
  return weekKeys.length >= 2;
}

// ─── DEV ONLY ────────────────────────────────────────────────────────────────

/** DEV ONLY — seeds fake localStorage data to test the FL training loop */
export function seedDevData(formulaTarget: number): void {
  if (import.meta.env.PROD) return;

  const today = new Date();

  // Seed 7 days of intake logs
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `intake_log_${makeDateKey(d)}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(
        key,
        JSON.stringify({
          calories: Math.round(formulaTarget * (0.9 + Math.random() * 0.2)),
          loggedAt: d.toISOString(),
        })
      );
    }
  }

  // Seed 4 weeks of weight logs
  const weights = [82, 81.5, 81.1, 80.6];
  for (let i = 3; i >= 0; i--) {
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) - i * 7);
    const key = `weight_log_${makeDateKey(monday)}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(
        key,
        JSON.stringify({
          weight: weights[3 - i],
          loggedAt: monday.toISOString(),
        })
      );
    }
  }
}
