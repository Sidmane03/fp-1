import React from "react";
import type { UserProfile, WeightLog } from "../types/dashboard.types";

interface ProgressTabProps {
  profile: UserProfile;
  weekWeight: WeightLog | null;
  currentWeight: number;
  weightProgress: number;
  adherence: number;
  isCheckInDay: boolean;
  daysUntilCheckIn: number;
  theme: string;
  showWeightInput: boolean;
  weightInput: string;
  onShowWeightInput: () => void;
  onWeightInputChange: (val: string) => void;
  onLogWeight: () => void;
  onCancelWeightInput: () => void;
}

export function ProgressTab({
  profile,
  weekWeight,
  currentWeight,
  weightProgress,
  adherence,
  isCheckInDay,
  daysUntilCheckIn,
  theme,
  showWeightInput,
  weightInput,
  onShowWeightInput,
  onWeightInputChange,
  onLogWeight,
  onCancelWeightInput,
}: ProgressTabProps) {
  
  const textTitle = theme === "light" ? "text-[#1A1A1A]" : "text-white";
  const textDim = theme === "light" ? "text-gray-400" : "text-gray-500";
  const bgDim = theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-800/30";
  const borderDim = theme === "light" ? "border-gray-100" : "border-gray-800/50";
  const cardBase = theme === "light" 
    ? "bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
    : "bg-gray-900 rounded-[28px] p-6 shadow-2xl border border-gray-800";

  const targetWeight = profile.targetWeight ?? profile.weight;

  return (
    <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
      <div className="px-1">
        <h2 className={`text-2xl font-bold font-serif ${textTitle}`}>Weekly Progress</h2>
        <p className={`text-sm font-medium ${textDim} mt-0.5`}>Track your journey</p>
      </div>

      <div className={cardBase}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${theme === "light" ? "bg-blue-50 text-blue-500" : "bg-blue-900/30 text-blue-400"}`}>📊</div>
          <div>
            <h3 className={`text-lg font-bold font-serif ${textTitle}`}>Body Weight</h3>
            <p className="text-xs font-medium text-gray-500 italic">Milestone tracking</p>
          </div>
        </div>

        {profile.targetWeight && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2.5">
              <span className={`font-bold tabular-nums ${textTitle}`}>{currentWeight} <span className={`text-xs ${textDim}`}>kg</span></span>
              <span className={`font-bold tabular-nums ${textDim}`}>{targetWeight} <span className="text-xs opacity-50">kg</span></span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden shadow-inner ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(3, weightProgress * 100)}%`,
                  background: "linear-gradient(90deg, #3B82F6, #818CF8)",
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-2 tracking-widest">
              <span>Start ({profile.weight})</span>
              <span>Target Weight</span>
            </div>
          </div>
        )}

        {/* Weight Log Button / Next Check-in */}
        {!showWeightInput && (
          <>
            {isCheckInDay && !weekWeight ? (
              <button
                onClick={onShowWeightInput}
                className={`w-full py-4 rounded-2xl border-2 border-dashed text-sm font-bold transition-all mb-4 ${
                  theme === "light" 
                    ? "bg-gray-50/50 border-gray-200 text-[#1A1A1A] hover:border-blue-400 hover:text-blue-500" 
                    : "bg-gray-800/50 border-gray-700 text-blue-400 hover:border-blue-500/50 hover:bg-gray-800"
                }`}
              >
                ⚖️ Log This Week's Weight
              </button>
            ) : weekWeight ? (
              <div className={`flex items-center justify-between rounded-2xl px-5 py-4 mb-4 border ${bgDim} ${borderDim}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className={`text-sm font-bold ${textTitle}`}>Weight logged</p>
                    <p className="text-xs text-gray-400 font-medium">{weekWeight.weight} kg this week</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 mb-4 border ${bgDim} ${borderDim}`}>
                <span className="text-xl">📅</span>
                <p className={`text-sm font-medium ${textDim}`}>
                  Next check-in: <span className={`font-bold ${textTitle}`}>{daysUntilCheckIn} day{daysUntilCheckIn !== 1 ? "s" : ""}</span>
                </p>
              </div>
            )}
          </>
        )}

        {/* Inline Weight Input */}
        {showWeightInput && (
          <div className="flex items-center gap-3 mb-4 animate-[fadeInUp_0.2s_ease-out]">
            <input
              type="number"
              min="1"
              step="0.1"
              value={weightInput}
              onChange={(e) => onWeightInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onLogWeight()}
              placeholder="Weight in kg..."
              autoFocus
              className={`flex-1 px-5 py-3 rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                theme === "light" ? "bg-gray-50 border-gray-100 text-[#1A1A1A]" : "bg-gray-800 border-gray-700 text-white"
              }`}
            />
            <button
              onClick={onLogWeight}
              className={`w-11 h-11 rounded-2xl text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${
                theme === "light" ? "bg-[#3B82F6]" : "bg-blue-600"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              onClick={onCancelWeightInput}
              className="text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        <div className={`w-full h-px ${theme === "light" ? "bg-gray-100" : "bg-gray-800"} my-6`} />

        {/* Adherence Stat */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weekly Consistency</p>
          <div className={`flex items-center gap-4 rounded-2xl px-5 py-5 border ${bgDim} ${borderDim}`}>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${
                    i < adherence 
                      ? "bg-[#4ADE80] shadow-[0_0_10px_rgba(74,222,128,0.3)]" 
                      : (theme === "light" ? "bg-gray-200" : "bg-gray-700")
                  }`}
                />
              ))}
            </div>
            <span className={`text-sm font-semibold ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
              Logged <span className={`font-black ${textTitle}`}>{adherence}</span> of last 7 days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
