import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

const goalOptions = [
  { value: "lose_weight", label: "Lose Weight", icon: "🔥", desc: "Burn fat and get lean" },
  { value: "maintain", label: "Maintain weight", icon: "⚖️", desc: "Stay where you are" },
  { value: "gain_muscle", label: "Build muscle", icon: "💪", desc: "Gain mass and strength" },
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
    <div className="min-h-screen flex flex-col items-center bg-[#F8F7F3] p-4 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-10 py-8 flex-1 flex flex-col">
        
        {/* Top Header & Segmented Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          {/* Soft round Back Button */}
          <button 
            onClick={() => navigate("/onboarding/biometrics")}
            className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-gray-500 hover:text-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          {/* Segmented Stepper */}
          <div className="flex-1 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 1 completed */}
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 2 completed */}
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 3 current */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 4 */}
          </div>
          
          <span className="text-sm font-medium text-gray-400">Skip</span>
        </div>

        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">What is your main goal?</h1>
        </div>

        <div className="space-y-4 px-2">
          {goalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                updateData({ goal: option.value });
                if (option.value === "maintain") {
                  updateData({ targetWeight: "", timeframeWeeks: "", weeklyRate: "" });
                }
              }}
              className={`w-full flex items-center gap-4 p-5 rounded-[20px] transition-all outline-none focus:ring-4 focus:ring-[#FF5722]/20
                ${
                  data.goal === option.value
                    ? "bg-[#FFF9F5] shadow-[0_8px_30px_rgb(255,87,34,0.12)] border border-[#FF5722]"
                    : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#F8F7F3] flex items-center justify-center text-xl shrink-0">
                {option.icon}
              </div>
              <div className="text-left flex-1">
                <span className="text-lg font-bold font-serif text-[#1A1A1A] block">{option.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-8 pb-4 px-2 w-full">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-linear-to-r from-[#FF8A00] to-[#FF5722] text-white font-bold text-lg shadow-[0_8px_20px_rgb(255,87,34,0.3)] hover:shadow-[0_12px_25px_rgb(255,87,34,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#FF8A00]/50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}