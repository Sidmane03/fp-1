import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", icon: "🔥", desc: "Burn fat and get lean" },
  { value: "maintain", label: "Maintain", icon: "⚖️", desc: "Stay where you are" },
  { value: "gain_muscle", label: "Gain Muscle", icon: "💪", desc: "Build mass and strength" },
] as const;

export default function GoalStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showTimeframe = data.goal !== "maintain";

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (showTimeframe) {
      const tw = Number(data.targetWeight);
      const tf = Number(data.timeframeWeeks);

      if (!data.targetWeight || tw < 20 || tw > 500)
        newErrors.targetWeight = "Enter a valid target weight (20–500 kg)";
      if (!data.timeframeWeeks || tf < 1 || tf > 52)
        newErrors.timeframeWeeks = "Timeframe must be 1–52 weeks";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigate("/onboarding/activity");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">What's your goal?</h1>
          <p className="mt-2 text-gray-400">We'll tailor your plan to match</p>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          {goalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateData({ goal: option.value });
                if (option.value === "maintain") {
                  updateData({ targetWeight: "", timeframeWeeks: "" });
                }
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                ${
                  data.goal === option.value
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500"
                }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="text-left">
                <span className="text-lg font-medium block">{option.label}</span>
                <span className="text-sm text-gray-400">{option.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Timeframe Fields (only for lose/gain) */}
        {showTimeframe && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Target weight (kg)
              </label>
              <input
                type="number"
                value={data.targetWeight}
                onChange={(e) => updateData({ targetWeight: e.target.value })}
                placeholder={data.goal === "lose_weight" ? "e.g. 65" : "e.g. 80"}
                className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              {errors.targetWeight && (
                <p className="mt-1 text-sm text-red-400">{errors.targetWeight}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                In how many weeks?
              </label>
              <input
                type="number"
                value={data.timeframeWeeks}
                onChange={(e) => updateData({ timeframeWeeks: e.target.value })}
                placeholder="e.g. 12"
                className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              {errors.timeframeWeeks && (
                <p className="mt-1 text-sm text-red-400">{errors.timeframeWeeks}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/onboarding/biometrics")}
            className="flex-1 py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}