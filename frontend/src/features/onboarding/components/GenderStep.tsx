import { useNavigate, Link } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

const genderOptions = [
  { value: "male", label: "Male", icon: "🙋‍♂️", color: "bg-blue-50" },
  { value: "female", label: "Female", icon: "🙋‍♀️", color: "bg-pink-50" },
  { value: "other", label: "Other", icon: "🧑", color: "bg-orange-50" },
] as const;

export default function GenderStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();

  const handleSelect = (gender: typeof data.gender) => {
    updateData({ gender });
  };

  const handleNext = () => {
    if (data.gender) navigate("/onboarding/biometrics");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans bg-[#F8F7F3] text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-10 py-8 flex-1 flex flex-col">
        
        {/* Top Header & Segmented Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          <div className="shrink-0 w-10 h-10"></div>
          <div className="flex-1 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div>
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>
          </div>
          <span className="text-sm font-medium text-gray-400 cursor-pointer">Skip</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">Identify your gender</h1>
        </div>

        {/* Gender Options Grid */}
        <div className="grid grid-cols-2 gap-4 px-2">
          {genderOptions.map((option) => {
            const isSelected = data.gender === option.value;
            const isOther = option.value === "other";

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex transition-all outline-none border-2 rounded-[24px] p-6 
                  ${isOther ? "col-span-2 flex-row justify-center gap-4 items-center" : "flex-col items-center gap-3"}
                  ${isSelected 
                    ? "bg-white border-[#FF5722] shadow-[0_8px_30px_rgba(255,87,34,0.15)]" 
                    : "bg-white border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
                  }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${option.color}`}>
                  {option.icon}
                </div>
                <span className="text-lg font-bold font-serif">{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-auto pt-8 pb-4 px-2 w-full">
          <button
            onClick={handleNext}
            disabled={!data.gender}
            className={`w-full py-4 rounded-full text-white font-bold text-lg transition-all outline-none shadow-lg
              ${data.gender 
                ? "bg-gradient-to-r from-[#FF8A00] to-[#FF5722] hover:-translate-y-0.5 active:scale-95" 
                : "bg-gray-300 cursor-not-allowed"}`}
          >
            Next
          </button>
          
          <div className="text-center text-sm font-medium mt-6">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-[#1A1A1A] hover:text-[#FF5722] font-bold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
