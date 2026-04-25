/**
 * flModel.ts — Pure TF.js functions. No React. No hooks.
 * All operations are wrapped in try/catch so the app never crashes due to ML errors.
 */
import * as tf from "@tensorflow/tfjs";
import type { FeatureVector } from "./featureEngineering";

// ─── Constants ───────────────────────────────────────────────────────────────

const MODEL_WEIGHTS_KEY = "fl_model_weights";
const FL_ALPHA_KEY = "fl_alpha";
const ALPHA_MIN = 0.7;
const ALPHA_MAX = 1.3;
const LEARNING_RATE = 0.01;

// ─── buildModel ──────────────────────────────────────────────────────────────

/**
 * Builds and compiles a small sequential model.
 * Input shape: [4] — [adherenceRate, expectedWeightDelta, actualWeightDelta, weekCount]
 */
export function buildModel(): tf.Sequential {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 8, activation: "relu", inputShape: [4] }));
  model.add(tf.layers.dense({ units: 4, activation: "relu" }));
  model.add(tf.layers.dense({ units: 1, activation: "linear" }));
  model.compile({
    optimizer: tf.train.adam(LEARNING_RATE),
    loss: "meanSquaredError",
  });
  return model;
}

// ─── saveModelWeights ────────────────────────────────────────────────────────

/**
 * Serializes model weights to JSON and saves to localStorage.
 * Silently fails if localStorage is full.
 */
export async function saveModelWeights(model: tf.Sequential): Promise<void> {
  try {
    const weights = model.getWeights();
    const serialized = weights.map((w) => ({
      shape: w.shape,
      data: Array.from(w.dataSync()),
    }));
    localStorage.setItem(MODEL_WEIGHTS_KEY, JSON.stringify(serialized));
    weights.forEach((w) => w.dispose());
  } catch {
    // silently fail — localStorage may be full
  }
}

// ─── loadModelWeights ────────────────────────────────────────────────────────

/**
 * Reads weights from localStorage and sets them on the model.
 * Returns true if weights were loaded, false otherwise.
 */
export async function loadModelWeights(model: tf.Sequential): Promise<boolean> {
  try {
    const raw = localStorage.getItem(MODEL_WEIGHTS_KEY);
    if (!raw) return false;
    const serialized: Array<{ shape: number[]; data: number[] }> = JSON.parse(raw);
    const tensors = serialized.map((w) =>
      tf.tensor(w.data, w.shape as [number, ...number[]])
    );
    model.setWeights(tensors);
    tensors.forEach((t) => t.dispose());
    return true;
  } catch {
    return false;
  }
}

// ─── trainModel ──────────────────────────────────────────────────────────────

/**
 * Runs one round of local training on a single feature/label pair.
 * Returns the final loss value, or -1 if training fails.
 */
export async function trainModel(
  model: tf.Sequential,
  features: FeatureVector,
  label: number
): Promise<number> {
  let xs: tf.Tensor | null = null;
  let ys: tf.Tensor | null = null;

  try {
    xs = tf.tensor2d(
      [[
        features.adherenceRate,
        features.expectedWeightDelta,
        features.actualWeightDelta,
        features.weekCount,
      ]],
      [1, 4]
    );
    ys = tf.tensor2d([[label]], [1, 1]);

    const history = await model.fit(xs, ys, {
      epochs: 10,
      verbose: 0,
    });

    const losses = history.history["loss"] as number[];
    return losses[losses.length - 1] ?? -1;
  } catch {
    return -1;
  } finally {
    xs?.dispose();
    ys?.dispose();
  }
}

// ─── predictAlpha ────────────────────────────────────────────────────────────

/**
 * Runs inference and returns the clamped α correction factor.
 * Returns 1.0 if prediction fails.
 */
export async function predictAlpha(
  model: tf.Sequential,
  features: FeatureVector
): Promise<number> {
  let input: tf.Tensor | null = null;
  let output: tf.Tensor | null = null;

  try {
    input = tf.tensor2d(
      [[
        features.adherenceRate,
        features.expectedWeightDelta,
        features.actualWeightDelta,
        features.weekCount,
      ]],
      [1, 4]
    );

    output = model.predict(input) as tf.Tensor;
    const raw = (await output.data())[0];
    const clamped = Math.max(ALPHA_MIN, Math.min(ALPHA_MAX, raw));
    return isFinite(clamped) ? clamped : 1.0;
  } catch {
    return 1.0;
  } finally {
    input?.dispose();
    output?.dispose();
  }
}

// ─── saveAlpha / loadAlpha ───────────────────────────────────────────────────

/** Persists the current α value to localStorage. */
export function saveAlpha(alpha: number): void {
  try {
    localStorage.setItem(FL_ALPHA_KEY, String(alpha));
  } catch {
    // silently fail
  }
}

/** Loads the persisted α value. Returns 1.0 if not found or parse error. */
export function loadAlpha(): number {
  try {
    const raw = localStorage.getItem(FL_ALPHA_KEY);
    if (!raw) return 1.0;
    const parsed = parseFloat(raw);
    return isFinite(parsed) ? parsed : 1.0;
  } catch {
    return 1.0;
  }
}
