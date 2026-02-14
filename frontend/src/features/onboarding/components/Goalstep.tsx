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
   const handleNext = () => {
    if (data.goal === "maintain") {
      navigate("/onboarding/activity");
    } else {
      navigate("/onboarding/pace");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">What's your goal?</h1>
          <p className="mt-2 text-gray-400">We'll tailor your plan to match</p>
        </div>

        <div className="space-y-3">
          {goalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateData({ goal: option.value });
                if (option.value === "maintain") {
                  updateData({ targetWeight: "", timeframeWeeks: "", weeklyRate: "" });
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