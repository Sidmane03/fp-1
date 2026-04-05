import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

// Adjust slider ranges per goal
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

  // Validate target weight direction
  const getTargetWeightError = (): string | null => {
    if (!data.targetWeight) return null;
    const tw = Number(data.targetWeight);
    if (tw < 20) return "Target weight must be at least 20 kg";
    if (goal === "lose_weight" && tw >= currentWeight) {
      return "Target must be less than your current weight for weight loss";
    }
    if (goal === "gain_muscle" && tw <= currentWeight) {
      return "Target must be more than your current weight for muscle gain";
    }
    return null;
  };

  const targetWeightError = getTargetWeightError();

  const handleSliderChange = (value: number) => {
    const clamped = Math.min(Math.max(value, config.min), config.max);
    const rounded = Math.round(clamped * 20) / 20; // round to 0.05

    if (weightDiff > 0) {
      updateData({
        weeklyRate: String(rounded),
        timeframeWeeks: String(Math.ceil(weightDiff / rounded)),
      });
    } else {
      updateData({ weeklyRate: String(rounded) });
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

  const isNextDisabled =
    !data.targetWeight ||
    Number(data.targetWeight) < 20 ||
    !data.timeframeWeeks ||
    Number(data.timeframeWeeks) < 1 ||
    !!targetWeightError;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F8F7F3] p-4 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-10 py-8 flex-1 flex flex-col">
        
        {/* Top Header & Segmented Progress Bar */}
        <div className="flex items-center gap-4 px-2">
          {/* Soft round Back Button */}
          <button 
            onClick={() => navigate("/onboarding/goal")}
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
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 3 completed */}
            <div className="h-1.5 flex-1 rounded-full bg-[#FF8A00]"></div> {/* Step 4 current */}
            <div className="h-1.5 flex-1 rounded-full bg-gray-200"></div>   {/* Step 5 */}
          </div>
          
          <span className="text-sm font-medium text-gray-400">Skip</span>
        </div>

        <div className="text-center px-4">
          <h1 className="text-3xl font-bold font-serif text-[#1A1A1A]">
            {goal === "lose_weight" ? "How fast to lose?" : "How fast to gain?"}
          </h1>
          <p className="mt-3 text-gray-500 font-medium font-serif italic text-lg">
            {currentWeight} kg → {targetWeight || "?"} kg
            {weightDiff > 0 && (
              <span className="text-[#FF5722]"> ({weightDiff.toFixed(1)} kg {goal === "lose_weight" ? "to lose" : "to gain"})</span>
            )}
          </p>
        </div>

        <div className="space-y-6 px-2">
          {/* Target Weight Input Card */}
          <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 transition-shadow focus-within:shadow-[0_8px_30px_rgb(255,87,34,0.12)] border border-transparent focus-within:border-[#FF5722]/30">
            <label className="block text-sm font-bold text-[#1A1A1A] mb-3">
              {goal === "lose_weight" ? "Target weight" : "Target reach weight"}
            </label>
            <div className="flex items-center gap-3 bg-[#F8F7F3] rounded-[16px] p-3 px-4 focus-within:ring-2 focus-within:ring-[#FF5722] transition-shadow">
              <input
                type="number"
                value={data.targetWeight}
                onChange={(e) => {
                  updateData({ targetWeight: e.target.value });
                  const tw = Number(e.target.value);
                  const diff = Math.abs(currentWeight - tw);
                  if (diff > 0 && weeklyRate > 0) {
                    updateData({ timeframeWeeks: String(Math.ceil(diff / weeklyRate)) });
                  }
                }}
                placeholder={goal === "lose_weight" ? "e.g. 65" : "e.g. 80"}
                className="w-full bg-transparent text-[#1A1A1A] font-medium text-lg placeholder-gray-400 focus:outline-none"
              />
              <span className="text-gray-400 font-medium">kg</span>
            </div>
            {targetWeightError && (
              <p className="mt-3 text-sm font-medium text-red-500">{targetWeightError}</p>
            )}
          </div>

          {/* Slider & Weeks Section — only show if target weight is valid */}
          {data.targetWeight && !targetWeightError && weightDiff > 0 && (
            <div className="space-y-6">
              
              {/* Rate Card */}
              <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-transparent">
                
                {/* Zone Labels */}
                <div className="flex justify-between text-xs font-bold px-1 mb-4 uppercase tracking-wider">
                  <span className="text-green-500">Steady</span>
                  <span className="text-blue-500">Standard</span>
                  <span className="text-orange-500">Rapid</span>
                </div>

                {/* Slider */}
                <div className="relative mb-8">
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={weeklyRate}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-[#FF8A00]/30 transition-all bg-gray-200"
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
                  {/* Note: Custom thumb styling requires CSS, but native works okay. Added thick height & focus state */}
                </div>

                {/* Current Value Display */}
                <div className="text-center font-serif">
                  <span
                    className={`text-5xl font-bold transition-colors ${
                      zone === "recommended"
                        ? "text-blue-500"
                        : zone === "fast"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    {weeklyRate.toFixed(1)}
                  </span>
                  <span className="text-gray-400 text-lg ml-2 font-sans font-medium">kg / week</span>
                </div>

                {/* Warning for fast zone */}
                {zone === "aggressive" && (
                  <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 flex items-start gap-3 border border-red-100">
                    <span className="text-lg">⚠️</span>
                    <span>
                      {goal === "lose_weight"
                        ? "Losing this fast may cause muscle loss, fatigue, and nutrient deficiency."
                        : "Gaining this fast will likely include significant fat gain."}
                    </span>
                  </div>
                )}

                {zone === "fast" && (
                  <div className="mt-6 rounded-2xl bg-orange-50 p-4 text-sm font-medium text-orange-600 flex items-start gap-3 border border-orange-100">
                    <span className="text-lg">⚡</span>
                    <span>Ambitious but doable with high discipline.</span>
                  </div>
                )}
              </div>

              {/* Weeks Input Card */}
              <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-transparent focus-within:shadow-[0_8px_30px_rgb(255,87,34,0.12)] focus-within:border-[#FF5722]/30 transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-[#1A1A1A]">
                    Estimated timeline
                  </label>
                  <div className="flex items-center gap-2 bg-[#F8F7F3] rounded-[12px] p-2 focus-within:ring-2 focus-within:ring-[#FF5722] transition-shadow">
                    <input
                      type="number"
                      min="1"
                      max="104"
                      value={data.timeframeWeeks}
                      onChange={(e) => handleWeeksChange(e.target.value)}
                      className="w-16 bg-transparent text-[#1A1A1A] font-bold text-center focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm font-medium pr-2">weeks</span>
                  </div>
                </div>

                {calculatedWeeks > 0 && (
                  <div className="bg-[#FFF9F5] rounded-xl p-3 text-center border border-[#FF5722]/10">
                    <p className="text-[#FF5722] font-semibold">
                      Goal reached in: {formatDuration(calculatedWeeks)}
                    </p>
                  </div>
                )}

                {showMinWarning && (
                  <p className="text-orange-500 text-sm font-medium mt-3">
                    ⚠️ Not safely achievable in {weeksValue} week{weeksValue > 1 ? "s" : ""}. Minimum recommended: {minWeeks} weeks.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-8 pb-4 px-2 w-full">
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className="w-full py-4 rounded-full bg-linear-to-r from-[#FF8A00] to-[#FF5722] text-white font-bold text-lg shadow-[0_8px_20px_rgb(255,87,34,0.3)] hover:shadow-[0_12px_25px_rgb(255,87,34,0.4)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-[#FF8A00]/50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}