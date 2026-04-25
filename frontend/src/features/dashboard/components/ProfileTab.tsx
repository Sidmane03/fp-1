import React from "react";
import type { UserProfile } from "../types/dashboard.types";
import { seedDevData } from "../utils/featureEngineering";

interface ProfileTabProps {
  profile: UserProfile;
  theme: string;
  planExpanded: boolean;
  onTogglePlan: () => void;
  onLogout: () => void;
  formulaTarget: number;
}

const FAT_COLOR = "#60A5FA";
const PROTEIN_COLOR = "#FACC15";
const CARBS_COLOR = "#4ADE80";

export function ProfileTab({
  profile,
  theme,
  planExpanded,
  onTogglePlan,
  onLogout,
  formulaTarget,
}: ProfileTabProps) {
  const { fitnessProfile: fp } = profile;

  const textTitle = theme === "light" ? "text-[#1A1A1A]" : "text-white";
  const textDim = theme === "light" ? "text-gray-400" : "text-gray-500";
  const bgDim = theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-800/30";
  const borderDim = theme === "light" ? "border-gray-100" : "border-gray-800/50";

  return (
    <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
      <div className="px-1">
        <h2 className={`text-2xl font-bold font-serif ${textTitle}`}>Hi, {profile.name}!</h2>
        <p className={`text-sm font-medium ${textDim} mt-0.5`}>Your personal health profile</p>
      </div>

      <div className={`${theme === "light" ? "bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "bg-gray-900 rounded-[28px] shadow-2xl border border-gray-800"} overflow-hidden`}>
        <button
          onClick={onTogglePlan}
          className={`w-full flex items-center justify-between p-6 text-left transition-colors ${theme === "light" ? "hover:bg-gray-50" : "hover:bg-gray-800/50"}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${theme === "light" ? "bg-indigo-50 text-indigo-500" : "bg-indigo-900/30 text-indigo-400"}`}>⚙️</div>
            <div>
              <h2 className={`text-lg font-bold font-serif ${textTitle}`}>Your Plan</h2>
              <p className="text-xs font-medium text-gray-500 italic">Baseline calculations</p>
            </div>
          </div>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 transition-transform duration-300 ${planExpanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          className={`transition-all duration-400 ease-out overflow-hidden ${
            planExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6 space-y-5">
            {/* BMR / TDEE */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-[24px] p-5 text-center border ${bgDim} ${borderDim}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">BMR</span>
                <span className={`text-2xl font-bold font-serif ${textTitle}`}>{fp.bmr}</span>
                <span className="text-xs font-medium text-gray-400 ml-1">kcal</span>
              </div>
              <div className={`rounded-[24px] p-5 text-center border ${bgDim} ${borderDim}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">TDEE</span>
                <span className={`text-2xl font-bold font-serif ${textTitle}`}>{fp.tdee}</span>
                <span className="text-xs font-medium text-gray-400 ml-1">kcal</span>
              </div>
            </div>

            {/* Target Calories */}
            <div className={`rounded-[24px] p-6 text-center border ${bgDim} ${borderDim}`}>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Daily Target</span>
              <span className={`text-4xl font-bold font-serif ${textTitle}`}>{fp.targetCalories}</span>
              <span className="text-sm font-medium text-gray-400 ml-1">kcal / day</span>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-[20px] p-4 text-center border ${bgDim} ${borderDim}`}>
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{ backgroundColor: FAT_COLOR }} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Fat</span>
                <span className={`text-lg font-bold font-serif ${textTitle}`}>{fp.macros.fats}g</span>
              </div>
              <div className={`rounded-[20px] p-4 text-center border ${bgDim} ${borderDim}`}>
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{ backgroundColor: PROTEIN_COLOR }} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Protein</span>
                <span className={`text-lg font-bold font-serif ${textTitle}`}>{fp.macros.protein}g</span>
              </div>
              <div className={`rounded-[20px] p-4 text-center border ${bgDim} ${borderDim}`}>
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{ backgroundColor: CARBS_COLOR }} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Carbs</span>
                <span className={`text-lg font-bold font-serif ${textTitle}`}>{fp.macros.carbs}g</span>
              </div>
            </div>

            {/* Weight Targets */}
            {profile.targetWeight && (
              <div className={`flex justify-between items-center rounded-[24px] px-6 py-5 border ${bgDim} ${borderDim}`}>
                <div className="text-center flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Starting</span>
                  <span className={`text-lg font-bold font-serif ${textTitle}`}>{profile.weight} kg</span>
                </div>
                <div className="flex items-center text-gray-300 dark:text-gray-600 px-3">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                   </svg>
                </div>
                <div className="text-center flex-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Target</span>
                  <span className={`text-lg font-bold font-serif ${textTitle}`}>{profile.targetWeight} kg</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className={`w-full py-4 mt-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border ${
          theme === "light" 
            ? "bg-white border-gray-100 text-gray-500 hover:text-red-500 hover:border-red-50" 
            : "bg-gray-900 border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-900/50 hover:bg-red-950/20"
        }`}
      >
        Logout
      </button>

      {/* DEV ONLY: Seed test data for FL training loop */}
      {import.meta.env.DEV && (
        <button
          onClick={() => {
            seedDevData(formulaTarget);
            alert("✅ Dev data seeded! 7 intake logs + 4 weight logs added to localStorage.");
          }}
          className="w-full py-3 mt-2 rounded-2xl font-bold text-xs transition-all border border-dashed border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          🧪 Seed Test Data (Dev Only)
        </button>
      )}
    </div>
  );
}
