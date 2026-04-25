import { useState, useEffect, useRef, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  buildFeatureVectorWithGoal,
  buildLabel,
  hasEnoughData,
} from "../utils/featureEngineering";
import {
  buildModel,
  loadModelWeights,
  saveModelWeights,
  trainModel,
  predictAlpha,
  saveAlpha,
  loadAlpha,
} from "../utils/flModel";

export interface FLModelResult {
  alpha: number;               // current correction factor (default 1.0)
  adjustedTarget: number;      // formulaTarget × alpha, rounded to whole number
  isTraining: boolean;         // true while model.fit() is running
  lastTrainedAt: string | null; // ISO string of last training run
  isPersonalized: boolean;     // true if alpha differs from 1.0 by more than 2%
  runTraining: () => Promise<void>; // call this after a weight log
}

export function useFLModel(formulaTarget: number, goal: string = ""): FLModelResult {
  const [alpha, setAlpha] = useState<number>(loadAlpha);
  const [isTraining, setIsTraining] = useState(false);
  const [lastTrainedAt, setLastTrainedAt] = useState<string | null>(null);
  const modelRef = useRef<tf.Sequential | null>(null);

  // On mount: build model and load saved weights
  useEffect(() => {
    const init = async () => {
      try {
        const model = buildModel();
        await loadModelWeights(model);
        modelRef.current = model;
      } catch (err) {
        console.error("FL model init failed:", err);
      }
    };
    init();

    // Cleanup: dispose model on unmount
    return () => {
      try {
        modelRef.current?.dispose();
      } catch {
        // ignore dispose errors
      }
    };
  }, []);

  // runTraining: called after a weekly weight log
  const runTraining = useCallback(async () => {
    if (!modelRef.current) return;
    if (!hasEnoughData()) return; // gate: need at least 2 weight logs
    if (isTraining) return;

    setIsTraining(true);
    try {
      const features = buildFeatureVectorWithGoal(formulaTarget, goal);
      const label = buildLabel(features);
      await trainModel(modelRef.current, features, label);
      const newAlpha = await predictAlpha(modelRef.current, features);
      await saveModelWeights(modelRef.current);
      saveAlpha(newAlpha);
      setAlpha(newAlpha);
      setLastTrainedAt(new Date().toISOString());
    } catch (err) {
      console.error("FL training failed:", err);
    } finally {
      setIsTraining(false);
    }
  }, [formulaTarget, goal, isTraining]);

  // If no data yet, adjustedTarget equals formulaTarget exactly
  const effectiveAlpha = hasEnoughData() ? alpha : 1.0;
  const adjustedTarget = Math.round(formulaTarget * effectiveAlpha);
  const isPersonalized = hasEnoughData() && Math.abs(alpha - 1.0) > 0.02;

  return { alpha, adjustedTarget, isTraining, lastTrainedAt, isPersonalized, runTraining };
}
