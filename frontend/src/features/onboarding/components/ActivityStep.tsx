import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

const activityOptions = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise", icon: "🪑" },
  { value: "light", label: "Lightly Active", desc: "Light exercise 1–3 days/week", icon: "🚶" },
  { value: "moderate", label: "Moderately Active", desc: "Moderate exercise 3–5 days/week", icon: "🏃" },
  { value: "active", label: "Active", desc: "Hard exercise 6–7 days/week", icon: "🏋️" },
  { value: "very_active", label: "Very Active", desc: "Intense training + physical job", icon: "⚡" },
] as const;

export default function ActivityStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();

  const handleSelect = (level: typeof data.activityLevel) => {
    updateData({ activityLevel: level });
  };

  const handleNext = () => {
    navigate("/onboarding/reveal");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Activity level</h1>
          <p className="mt-2 text-gray-400">How active are you on a typical week?</p>
        </div>

        <div className="space-y-3">
          {activityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                ${
                  data.activityLevel === option.value
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

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/onboarding/goal")}
            className="flex-1 py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            See My Plan
          </button>
        </div>
      </div>
    </div>
  );
}