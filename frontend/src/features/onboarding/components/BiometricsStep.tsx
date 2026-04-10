import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

export default function BiometricsStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const age = Number(data.age);
    const height = Number(data.height);
    const weight = Number(data.weight);

    if (!data.age || age < 13 || age > 120) newErrors.age = "Age must be 13–120";
    if (!data.height || height < 100 || height > 210) newErrors.height = "This seems unusual. Please check your height";
    if (!data.weight || weight < 25 || weight > 350) newErrors.weight = "This seems unusual. Please check your weight";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigate("/onboarding/goal");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans bg-[#F8F7F3] text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-10 py-8">
        
        {/* Top Header & Segmented Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          {/* Soft round Back Button */}
          <button 
            onClick={() => navigate("/onboarding/gender")}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full shadow-[0_2px_10px_rgb(0,0,0,0.04)] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5722] bg-white text-gray-500 hover:text-[#1A1A1A]"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          {/* Segmented Stepper */}
          <div className="flex-1 flex gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 1 completed */}
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 2 current */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 3 */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 4 */}
          </div>
          
          <span className="text-sm font-medium text-gray-400">Skip</span>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">Your body metrics</h1>
          <p className="mt-2 text-gray-400 font-medium">We need these for accurate calculations</p>
        </div>

        {/* Floating Input Cards */}
        <div className="space-y-4 px-2">
          {/* Age Input Card */}
          <div className="p-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all bg-white border-gray-100/50">
            <label htmlFor="age" className="block text-sm font-bold mb-2 text-[#1A1A1A]">Age</label>
            <input
              id="age"
              type="number"
              value={data.age}
              onChange={(e) => updateData({ age: e.target.value })}
              placeholder="e.g. 25"
              className="w-full py-3 px-4 rounded-xl border border-transparent placeholder-gray-400 font-bold focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all outline-none bg-[#F8F7F3] text-[#1A1A1A]"
            />
            {errors.age && <p className="mt-2 text-sm font-medium text-red-500">{errors.age}</p>}
          </div>

          {/* Height Input Card */}
          <div className="p-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all flex items-center justify-between gap-4 bg-white border-gray-100/50">
            <div className="flex-1">
              <label htmlFor="height" className="block text-sm font-bold mb-2 text-[#1A1A1A]">Height</label>
              <input
                id="height"
                type="number"
                value={data.height}
                onChange={(e) => updateData({ height: e.target.value })}
                placeholder="e.g. 175"
                className="w-full py-3 px-4 rounded-xl border border-transparent placeholder-gray-400 font-bold focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all outline-none bg-[#F8F7F3] text-[#1A1A1A]"
              />
              {errors.height && <p className="mt-2 text-sm font-medium text-red-500">{errors.height}</p>}
            </div>
            <span className="font-bold text-gray-300 self-end mb-4 pr-2">cm</span>
          </div>

          {/* Weight Input Card */}
          <div className="p-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all flex items-center justify-between gap-4 bg-white border-gray-100/50">
            <div className="flex-1">
              <label htmlFor="weight" className="block text-sm font-bold mb-2 text-[#1A1A1A]">Weight</label>
              <input
                id="weight"
                type="number"
                value={data.weight}
                onChange={(e) => updateData({ weight: e.target.value })}
                placeholder="e.g. 70"
                className="w-full py-3 px-4 rounded-xl border border-transparent placeholder-gray-400 font-bold focus:bg-white focus:border-[#FF5722] focus:ring-4 focus:ring-[#FF5722]/10 transition-all outline-none bg-[#F8F7F3] text-[#1A1A1A]"
              />
              {errors.weight && <p className="mt-2 text-sm font-medium text-red-500">{errors.weight}</p>}
            </div>
            <span className="font-bold text-gray-300 self-end mb-4 pr-2">kg</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 px-2">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FF5722] text-white font-bold text-lg shadow-[0_8px_20px_rgb(255,87,34,0.3)] hover:shadow-[0_12px_25px_rgb(255,87,34,0.4)] hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#FF8A00]/50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}