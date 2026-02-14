import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

// 🔧 TEAM: Adjust slider ranges per goal
const PACE_CONFIG = {
  lose_weight: { min: 0.1, max: 1.4, recommended: 0.8, step: 0.1 },
  gain_muscle: { min: 0.1, max: 0.5, recommended: 0.3, step: 0.05 },
};

const getZone = (
  value: number,
  config: { min: number; max: number; recommended: number }
) => {
  if (value <= config.recommended) return "recommended";
  if (value <= config.max * 0.8) return "fast";
  return "aggressive";
};

// Friendly duration string: "12 weeks (~3 months)"
const formatDuration = (weeks: number): string => {
  const rounded = Math.ceil(weeks);
  if (rounded < 4) return `${rounded} week${rounded > 1 ? "s" : ""}`;
  const months = Math.round(rounded / 4.33);
  if (months < 1) return `${rounded} weeks`;
  return `${rounded} weeks (~${months} month${months > 1 ? "s" : ""})`;
};

export default function PaceStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();

  const goal = data.goal as "lose_weight" | "gain_muscle";
  const config = PACE_CONFIG[goal] || PACE_CONFIG.lose_weight;

  const currentWeight = Number(data.weight);
  const targetWeight = Number(data.targetWeight);
  const weightDiff = Math.abs(currentWeight - targetWeight);

  const weeklyRate = Number(data.weeklyRate) || config.recommended;
  const calculatedWeeks = weightDiff > 0 ? weightDiff / weeklyRate : 0;

  const zone = getZone(weeklyRate, config);

  // Sync timeframeWeeks whenever slider changes
  useEffect(() => {
    if (calculatedWeeks > 0) {
      updateData({ timeframeWeeks: String(Math.ceil(calculatedWeeks)) });
    }
  }, [weeklyRate]);



  const handleSliderChange = (value: number) => {
    const clamped = Math.min(Math.max(value, config.min), config.max);
    const rounded = Math.round(clamped * 20) / 20; // round to 0.05
    updateData({ weeklyRate: String(rounded) });

    if (weightDiff > 0) {
      updateData({ timeframeWeeks: String(Math.ceil(weightDiff / rounded)) });
    }
  };

  const handleWeeksChange = (weeksStr: string) => {
    const weeks = Number(weeksStr);
    if (!weeks || weeks < 1) {
      updateData({ timeframeWeeks: weeksStr });
      return;
    }

    updateData({ timeframeWeeks: weeksStr });

    if (weightDiff > 0) {
      let newRate = weightDiff / weeks;
      newRate = Math.min(Math.max(newRate, config.min), config.max);
      newRate = Math.round(newRate * 20) / 20;
      updateData({ weeklyRate: String(newRate) });
    }
  };

  const handleNext = () => {
    navigate("/onboarding/activity");
  };

  // Min weeks warning
  const minWeeks = Math.ceil(weightDiff / config.max);
  const weeksValue = Number(data.timeframeWeeks);
  const showMinWarning = weeksValue > 0 && weeksValue < minWeeks;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            {goal === "lose_weight" ? "How fast to lose?" : "How fast to gain?"}
          </h1>
          <p className="mt-2 text-gray-400">
            {currentWeight} kg → {targetWeight} kg ({weightDiff.toFixed(1)} kg{" "}
            {goal === "lose_weight" ? "to lose" : "to gain"})
          </p>
        </div>
        <div>
  <label className="block text-sm font-medium text-gray-300 mb-1">
    {goal === "lose_weight" ? "What's your target weight?" : "What weight do you want to reach?"}
  </label>
  <div className="flex items-center gap-2">
    <input
      type="number"
      value={data.targetWeight}
      onChange={(e) => updateData({ targetWeight: e.target.value })}
      placeholder={goal === "lose_weight" ? "e.g. 65" : "e.g. 80"}
      className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
    />
    <span className="text-gray-400">kg</span>
  </div>
</div>

        {/* Slider Section */}
        <div className="space-y-4">
          {/* Zone Labels */}
          <div className="flex justify-between text-xs font-medium px-1">
            <span className="text-green-400">Slow</span>
            <span className="text-blue-400">Recommended</span>
            <span className="text-orange-400">Fast</span>
          </div>

          {/* Slider */}
          <div className="relative">
            <input
              type="range"
              min={config.min}
              max={config.max}
              step={config.step}
              value={weeklyRate}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #22c55e 0%, 
                  #22c55e 35%, 
                  #3b82f6 35%, 
                  #3b82f6 65%, 
                  #f97316 65%, 
                  #ef4444 100%)`,
              }}
            />
          </div>

          {/* Current Value Display */}
          <div className="text-center">
            <span
              className={`text-4xl font-bold ${
                zone === "recommended"
                  ? "text-blue-400"
                  : zone === "fast"
                  ? "text-orange-400"
                  : "text-red-400"
              }`}
            >
              {weeklyRate.toFixed(1)}
            </span>
            <span className="text-gray-400 text-lg ml-2">kg / week</span>
          </div>

          {/* Warning for fast zone */}
          {zone === "aggressive" && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
              ⚠️{" "}
              {goal === "lose_weight"
                ? "Losing this fast may cause muscle loss, fatigue, and nutrient deficiency"
                : "Gaining this fast will likely include significant fat gain"}
            </div>
          )}

          {zone === "fast" && (
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-3 text-sm text-orange-400 text-center">
              ⚡ Ambitious but doable with discipline
            </div>
          )}
        </div>

        {/* Weeks Section */}
        <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">
              Estimated time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="104"
                value={data.timeframeWeeks}
                onChange={(e) => handleWeeksChange(e.target.value)}
                className="w-20 p-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-center focus:border-blue-500 focus:outline-none"
              />
              <span className="text-gray-400 text-sm">weeks</span>
            </div>
          </div>

          {calculatedWeeks > 0 && (
            <p className="text-gray-500 text-sm text-center">
              {formatDuration(calculatedWeeks)}
            </p>
          )}

          {showMinWarning && (
            <p className="text-yellow-400 text-xs text-center">
              ⚠️ Not safely achievable in {weeksValue} week
              {weeksValue > 1 ? "s" : ""}. Minimum recommended: {minWeeks}{" "}
              weeks.
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/onboarding/goal")}
            className="flex-1 py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!data.targetWeight || Number(data.targetWeight) < 20 || !data.timeframeWeeks || Number(data.timeframeWeeks) < 1}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}