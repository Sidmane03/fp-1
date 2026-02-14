import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

const genderOptions = [
  { value: "male", label: "Male", icon: "🙋‍♂️" },
  { value: "female", label: "Female", icon: "🙋‍♀️" },
  { value: "other", label: "Other", icon: "🧑" },
] as const;

export default function GenderStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();

  const handleSelect = (gender: typeof data.gender) => {
    updateData({ gender });
  };

  const handleNext = () => {
    navigate("/onboarding/biometrics");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">What's your gender?</h1>
          <p className="mt-2 text-gray-400">This helps us calculate your plan accurately</p>
        </div>

        <div className="space-y-3">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                ${
                  data.gender === option.value
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500"
                }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-lg font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}