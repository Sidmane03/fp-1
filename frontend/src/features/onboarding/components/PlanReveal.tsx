import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";
import { onboardingApi } from "../api/onboarding.api";

export default function PlanReveal() {
  const navigate = useNavigate();
  const { data, planPreview, setPlanPreview, setPlanRevealed, resetOnboarding } =
    useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredMacro, setHoveredMacro] = useState<'fats' | 'protein' | 'carbs' | null>(null);

  useEffect(() => {
    // If no onboarding data, redirect back
    if (!data.age || !data.height || !data.weight) {
      navigate("/onboarding/gender", { replace: true });
      return;
    }

    // Calculate plan on mount
    const fetchPlan = async () => {
      setLoading(true);
      setError("");
      try {
        const plan = await onboardingApi.calculatePlan(data);
        setPlanPreview(plan);
        setPlanRevealed(true);
      } catch (err: any) {
        setError(err.message || "Failed to calculate plan");
      } finally {
        setLoading(false);
      }
    };

    if (!planPreview) {
      fetchPlan();
    }
  }, []);

  const handleCreateAccount = () => {
    navigate("/register");
  };

  const handleStartOver = () => {
    resetOnboarding();
    navigate("/onboarding/gender");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans bg-[#F8F7F3]">
        <div className="w-16 h-16 border-4 border-[#FF5722]/30 border-t-[#FF5722] rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-bold font-serif mt-1 text-[#1A1A1A]">Curating your plan...</h2>
        <p className="text-gray-500 mt-2 font-medium">Analyzing your biometrics and goals</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center bg-[#F8F7F3]">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold font-serif text-[#1A1A1A]">Something went wrong</h2>
        <p className="text-gray-500 mt-2 mb-8 font-medium">{error}</p>
        <button
          onClick={handleStartOver}
          className="py-4 px-8 rounded-full shadow-[0_8px_30_rgb(0,0,0,0.06)] font-bold hover:-translate-y-0.5 transition-all border bg-white text-[#1A1A1A] border-gray-100"
        >
          Start Over
        </button>
      </div>
    );
  }

  if (!planPreview) return null;

  // Calculate macro percentages based on calories for Visual Weights
  const fatCals = planPreview.macros.fats * 9;
  const proteinCals = planPreview.macros.protein * 4;
  const carbsCals = planPreview.macros.carbs * 4;
  const totalCals = fatCals + proteinCals + carbsCals;

  const fatPct = (fatCals / totalCals) * 100;
  const proteinPct = (proteinCals / totalCals) * 100;
  const carbsPct = 100 - fatPct - proteinPct; // remainder

  const maxPct = Math.max(fatPct, proteinPct, carbsPct);

  // Colors matching reference
  const FAT_COLOR = "#60A5FA"; // Blue
  const PROTEIN_COLOR = "#FACC15"; // Yellow
  const CARBS_COLOR = "#4ADE80"; // Green

  // SVG Chart Calculations
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  // Reduce dash slightly to create a clean gap between segments
  const gap = 3; 
  
  const fatDash = Math.max(0, (fatPct / 100) * circumference - gap);
  const proteinDash = Math.max(0, (proteinPct / 100) * circumference - gap);
  const carbsDash = Math.max(0, (carbsPct / 100) * circumference - gap);

  const fatOffset = 0;
  const proteinOffset = (fatPct / 100) * circumference;
  const carbsOffset = ((fatPct + proteinPct) / 100) * circumference;

  const getOpacity = (macro: 'fats' | 'protein' | 'carbs') => {
    if (!hoveredMacro) return 1;
    return hoveredMacro === macro ? 1 : 0.3;
  };

  const getBarWidth = (pct: number) => `${Math.max((pct / maxPct) * 60, 4)}px`;

  return (
    <div className="min-h-screen flex flex-col items-center pb-32 pt-10 px-4 font-sans bg-[#F8F7F3] text-[#1A1A1A]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header area matching the app feel */}
        <div className="flex justify-between items-center px-2 mb-4">
          <button 
            onClick={handleStartOver}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)] text-gray-500 hover:text-[#1A1A1A] transition-colors"
          >
            {/* Refresh icon for start over */}
            <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1A1A1A"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
          </button>
          <div className="bg-white px-5 py-2.5 rounded-full shadow-sm font-bold font-serif text-lg tracking-wide border border-gray-50">
            Your Plan
          </div>
          <div className="w-12 h-12"></div> {/* spacer */}
        </div>

        {/* Primary Calorie Goal Card */}
        <div className="rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all flex flex-col items-center pt-8 bg-white border-white/60">
          
          {/* Donut Chart */}
          <div className="relative w-48 h-48 shrink-0 mb-10">
            <svg viewBox="0 0 160 160" className="absolute inset-0 w-full h-full -rotate-90">
              
              {/* Fat Segment */}
              <circle
                cx="80" cy="80" r={radius}
                fill="transparent"
                stroke={FAT_COLOR}
                strokeWidth="12"
                strokeDasharray={`${fatDash} ${circumference}`}
                strokeDashoffset={-fatOffset}
                className="transition-opacity duration-300 cursor-pointer hover:stroke-[14px]"
                style={{ opacity: getOpacity('fats') }}
                onMouseEnter={() => setHoveredMacro('fats')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
              
              {/* Protein Segment */}
              <circle
                cx="80" cy="80" r={radius}
                fill="transparent"
                stroke={PROTEIN_COLOR}
                strokeWidth="12"
                strokeDasharray={`${proteinDash} ${circumference}`}
                strokeDashoffset={-proteinOffset}
                className="transition-opacity duration-300 cursor-pointer hover:stroke-[14px]"
                style={{ opacity: getOpacity('protein') }}
                onMouseEnter={() => setHoveredMacro('protein')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
              
              {/* Carbs Segment */}
              <circle
                cx="80" cy="80" r={radius}
                fill="transparent"
                stroke={CARBS_COLOR}
                strokeWidth="12"
                strokeDasharray={`${carbsDash} ${circumference}`}
                strokeDashoffset={-carbsOffset}
                className="transition-opacity duration-300 cursor-pointer hover:stroke-[14px]"
                style={{ opacity: getOpacity('carbs') }}
                onMouseEnter={() => setHoveredMacro('carbs')}
                onMouseLeave={() => setHoveredMacro(null)}
              />
            </svg>
            
            {/* Inner Text Center */}
            <div className="absolute inset-[16px] rounded-full flex flex-col items-center justify-center p-2 text-center pointer-events-none transition-colors bg-white">
              {hoveredMacro === null && (
                <div className="flex flex-col items-center justify-center mt-1">
                  <span className="text-[11px] font-bold font-sans text-gray-400 tracking-wider">TARGET</span>
                  <span className="text-[40px] font-bold font-serif mt-1 leading-none text-[#1A1A1A]">{planPreview.targetCalories}</span>
                  <span className="text-[11px] font-bold font-sans text-gray-400 mt-1 uppercase tracking-widest">KCal</span>
                </div>
              )}
              {hoveredMacro === 'fats' && (
                <div className="flex flex-col items-center justify-center mt-1">
                  <span className="text-base font-medium font-sans text-[#1A1A1A]">Fat</span>
                  <span className="text-[28px] font-bold font-serif text-[#1A1A1A] mt-1 leading-none">{planPreview.macros.fats}g</span>
                </div>
              )}
              {hoveredMacro === 'protein' && (
                <div className="flex flex-col items-center justify-center mt-1">
                  <span className="text-base font-medium font-sans text-[#1A1A1A]">Protein</span>
                  <span className="text-[28px] font-bold font-serif text-[#1A1A1A] mt-1 leading-none">{planPreview.macros.protein}g</span>
                </div>
              )}
              {hoveredMacro === 'carbs' && (
                <div className="flex flex-col items-center justify-center mt-1">
                  <span className="text-base font-medium font-sans text-[#1A1A1A]">Carbs</span>
                  <span className="text-[28px] font-bold font-serif text-[#1A1A1A] mt-1 leading-none">{planPreview.macros.carbs}g</span>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Macro Legend */}
          <div className="flex justify-between items-start w-full px-2">
            
            {/* Fat Legend */}
            <div 
              className="flex flex-col gap-1.5 cursor-pointer transition-opacity duration-300 items-start"
              style={{ opacity: getOpacity('fats') }}
              onMouseEnter={() => setHoveredMacro('fats')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FAT_COLOR }}></div>
                <span className="text-sm font-bold font-sans text-[#1A1A1A]">Fat</span>
              </div>
              <div className="w-[60px] h-[4px] rounded-full overflow-hidden bg-gray-100">
                 <div className="h-full rounded-full transition-all duration-300" style={{ width: getBarWidth(fatPct), backgroundColor: FAT_COLOR }}></div>
              </div>
              <span className="text-xs font-bold font-serif text-gray-500 mt-1">{planPreview.macros.fats}g</span>
            </div>

            {/* Protein Legend */}
            <div 
              className="flex flex-col gap-1.5 cursor-pointer transition-opacity duration-300 items-start"
              style={{ opacity: getOpacity('protein') }}
              onMouseEnter={() => setHoveredMacro('protein')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROTEIN_COLOR }}></div>
                <span className="text-sm font-bold font-sans text-[#1A1A1A]">Protein</span>
              </div>
              <div className="w-[60px] h-[4px] rounded-full overflow-hidden bg-gray-100">
                 <div className="h-full rounded-full transition-all duration-300" style={{ width: getBarWidth(proteinPct), backgroundColor: PROTEIN_COLOR }}></div>
              </div>
              <span className="text-xs font-bold font-serif text-gray-500 mt-1">{planPreview.macros.protein}g</span>
            </div>

            {/* Carbs Legend */}
            <div 
              className="flex flex-col gap-1.5 cursor-pointer transition-opacity duration-300 items-start"
              style={{ opacity: getOpacity('carbs') }}
              onMouseEnter={() => setHoveredMacro('carbs')}
              onMouseLeave={() => setHoveredMacro(null)}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CARBS_COLOR }}></div>
                <span className="text-sm font-bold font-sans text-[#1A1A1A]">Carbs</span>
              </div>
              <div className="w-[60px] h-[4px] rounded-full overflow-hidden bg-gray-100">
                 <div className="h-full rounded-full transition-all duration-300" style={{ width: getBarWidth(carbsPct), backgroundColor: CARBS_COLOR }}></div>
              </div>
              <span className="text-xs font-bold font-serif text-gray-500 mt-1">{planPreview.macros.carbs}g</span>
            </div>

          </div>

          <div className="mt-8 pt-5 w-full flex justify-center items-center gap-2 border-t transition-colors border-gray-100/50">
            <span className="text-lg">✨</span>
            <span className="font-bold font-serif text-[13px] text-[#1A1A1A]">Optimized for your goal!</span>
          </div>
        </div>

        {/* Secondary Metrics Card */}
        <div className="rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-all bg-white border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-indigo-50 text-indigo-500">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">Body Metrics</h2>
              <p className="text-sm font-medium text-gray-400">Your baseline calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[20px] p-5 text-center transition-colors bg-[#F8F7F3]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">BMR</span>
              <span className="text-2xl font-bold font-serif text-[#1A1A1A]">{planPreview.bmr}</span>
              <span className="text-sm font-medium text-gray-400 ml-1">kcal</span>
            </div>
            <div className="rounded-[20px] p-5 text-center transition-colors bg-[#F8F7F3]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">TDEE</span>
              <span className="text-2xl font-bold font-serif text-[#1A1A1A]">{planPreview.tdee}</span>
              <span className="text-sm font-medium text-gray-400 ml-1">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Bar (mimicking the reference dark pill menu) */}
       {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-50">
        <div className="w-full max-w-sm bg-[#1A1A1A] rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.4)] p-2 pl-6 flex items-center justify-between">

          <span className="text-white font-semibold font-serif text-lg tracking-wide">
            Create Account
          </span>

          <button
            onClick={handleCreateAccount}
            className="w-12 h-12 flex items-center justify-center rounded-full
                       bg-gradient-to-br from-orange-500 to-orange-600
                       text-white text-2xl leading-none
                       shadow-[0_0_15px_rgba(255,115,0,0.6),0_8px_20px_rgba(0,0,0,0.4)]
                       ring-2 ring-orange-400/30
                       hover:scale-105 active:scale-95
                       transition-all duration-200"
          >
            <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
          </button>

        </div>
      </div>
    </div>
  );
}