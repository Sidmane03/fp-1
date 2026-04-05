import { useNavigate, Link } from "react-router-dom";
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
    <div className="min-h-screen flex flex-col items-center bg-[#F8F7F3] p-4 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-10 py-8 flex-1 flex flex-col">
        
        {/* Top Header & Segmented Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          {/* Soft round Back Button (Hidden on first step, but keeps layout aligned) */}
          <div className="shrink-0 w-10 h-10"></div>
          
          {/* Segmented Stepper */}
          <div className="flex-1 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 1 current */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 2 */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 3 */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 4 */}
          </div>
          
          <span className="text-sm font-medium text-gray-400">Skip</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">Identify your gender</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 px-2">
          {genderOptions.slice(0, 2).map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex flex-col items-center gap-3 p-6 rounded-[24px] transition-all outline-none focus:ring-4 focus:ring-[#FF5722]/20
                ${
                  data.gender === option.value
                    ? "bg-white shadow-[0_8px_30px_rgb(255,87,34,0.12)] border-2 border-[#FF5722]"
                    : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl
                ${option.value === 'male' ? 'bg-blue-50' : 'bg-pink-50'}`}
              >
                {option.icon}
              </div>
              <span className="text-lg font-bold font-serif">{option.label}</span>
            </button>
          ))}
          
          {/* Full width option for 'Other' to keep the grid clean if needed, or just let it span */}
          <button
            onClick={() => handleSelect(genderOptions[2].value)}
            className={`col-span-2 w-full flex items-center justify-center gap-4 p-4 rounded-[20px] transition-all outline-none focus:ring-4 focus:ring-[#FF5722]/20
              ${
                data.gender === genderOptions[2].value
                  ? "bg-white shadow-[0_8px_30px_rgb(255,87,34,0.12)] border-2 border-[#FF5722]"
                  : "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-transparent hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
              }`}
          >
            <span className="text-2xl">{genderOptions[2].icon}</span>
            <span className="text-lg font-bold font-serif">{genderOptions[2].label}</span>
          </button>
        </div>

        <div className="mt-auto pt-8 pb-4 px-2 w-full">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-linear-to-r from-[#FF8A00] to-[#FF5722] text-white font-bold text-lg shadow-[0_8px_20px_rgb(255,87,34,0.3)] hover:shadow-[0_12px_25px_rgb(255,87,34,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#FF8A00]/50"
          >
            Next
          </button>
          
          <div className="text-center text-sm font-medium mt-6">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="text-[#1A1A1A] hover:text-[#FF5722] transition-colors outline-none focus:ring-2 focus:ring-[#FF5722] rounded px-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}