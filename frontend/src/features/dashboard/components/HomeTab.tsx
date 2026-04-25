import React, { useMemo } from "react";
import type { UserProfile, IntakeLog, WeightLog } from "../types/dashboard.types";

interface HomeTabProps {
  profile: UserProfile;
  todayLog: IntakeLog | null;
  adherence: number;
  theme: string;
  showCalInput: boolean;
  calInput: string;
  foodNameInput: string;
  isCheckInDay: boolean;
  weekWeight: WeightLog | null;
  adjustedTarget: number;
  isPersonalized: boolean;
  onShowCalInput: () => void;
  onCalInputChange: (val: string) => void;
  onFoodNameInputChange: (val: string) => void;
  onLogCalories: () => void;
  onEditFoodItem: (id: string, name: string, calories: number) => void;
  onRemoveFoodItem: (id: string) => void;
  onCancelCalInput: () => void;
  onNavigateToProgress: () => void;
  onToggleTheme: () => void;
}

const FAT_COLOR = "#60A5FA";
const PROTEIN_COLOR = "#FACC15";
const CARBS_COLOR = "#4ADE80";
const CALORIE_RING_COLOR = "#4F9CF9";
const CALORIE_OVER_COLOR = "#EF4444"; 
const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const goalLabels: Record<string, string> = {
  lose_weight: "Lose Weight",
  maintain: "Maintain Weight",
  gain_muscle: "Gain Muscle",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function getWeekDates(): { day: string; date: number; isToday: boolean }[] {
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sun
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay);

  return DAYS.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      day,
      date: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

export function HomeTab({
  profile,
  todayLog,
  theme,
  showCalInput,
  calInput,
  foodNameInput,
  isCheckInDay,
  weekWeight,
  adjustedTarget,
  isPersonalized,
  onShowCalInput,
  onCalInputChange,
  onFoodNameInputChange,
  onLogCalories,
  onEditFoodItem,
  onRemoveFoodItem,
  onCancelCalInput,
  onNavigateToProgress,
  onToggleTheme,
}: HomeTabProps) {
  const weekDates = useMemo(() => getWeekDates(), []);

  // Theme derived classes
  const textTitle = theme === "light" ? "text-[#1A1A1A]" : "text-white";
  const textDim = theme === "light" ? "text-gray-400" : "text-gray-500";
  const bgDim = theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-800/30";
  const borderDim = theme === "light" ? "border-gray-100" : "border-gray-800/50";
  const ctaGradient = "bg-linear-to-r from-[#FF8A00] to-[#FF5722]";
  const cardBase = theme === "light" 
    ? "bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
    : "bg-gray-900 rounded-[28px] p-6 shadow-2xl border border-gray-800";

  const { fitnessProfile: fp } = profile;
  const consumed = todayLog?.calories ?? 0;
  // Use the FL-adjusted target if personalized, otherwise fall back to formula target
  const target = adjustedTarget > 0 ? adjustedTarget : fp.targetCalories;
  const remaining = Math.max(0, target - consumed);
  const progressPercent = Math.min(consumed / target, 1);
  const isOverGoal = consumed > target;

  const filledDash = progressPercent * CIRCUMFERENCE;

  const fatTarget = fp.macros.fats;
  const proteinTarget = fp.macros.protein;
  const carbsTarget = fp.macros.carbs;

  const loggedFat = todayLog ? Math.round(consumed * (fp.macros.fats / target)) : 0;
  const loggedProtein = todayLog ? Math.round(consumed * (fp.macros.protein / target)) : 0;
  const loggedCarbs = todayLog ? Math.round(consumed * (fp.macros.carbs / target)) : 0;

  return (
    <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="px-1 flex justify-between items-start">
        <div className="flex-1">
          <h1 className={`text-2xl font-bold font-serif ${textTitle}`}>
            Hello, {profile.name}! 👋
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-0.5">
            {goalLabels[profile.goal] || profile.goal}
          </p>
        </div>
        <button
          onClick={onToggleTheme}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-2xl border transition-all ${
            theme === "light" ? "bg-white border-gray-100 text-[#1A1A1A] shadow-sm" : "bg-gray-900 border-gray-800 text-white"
          }`}
        >
          {theme === "light" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          )}
        </button>
      </div>

      {/* ─── Weekly Check-in Banner ───────────────────────────────────────── */}
      {isCheckInDay && !weekWeight && (
        <button
          onClick={onNavigateToProgress}
          className={`w-full border rounded-2xl p-4 flex items-center justify-between text-left group transition-all duration-300 ${
            theme === "light" 
              ? "bg-blue-50/50 border-blue-100 text-blue-900 hover:bg-blue-50" 
              : "bg-linear-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">⚖️</span>
            <span className={`text-sm font-bold italic ${theme === "light" ? "text-blue-600" : "text-blue-100"}`}>Time for your weekly weigh-in →</span>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
            theme === "light" ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400"
          }`}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
             </svg>
          </div>
        </button>
      )}

      {/* ─── Zone 1 — Today's Logging ─────────────────────────────────────────── */}
      <div className={cardBase}>
        
        {/* Week Strip */}
        <div className="flex justify-between items-center mb-6 px-1">
          {weekDates.map(({ day, date, isToday }) => (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[#60A5FA]" : textDim}`}>
                {day}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isToday
                    ? "bg-[#689ffe] text-white shadow-[0_4px_15px_rgba(96,165,250,0.4)]"
                    : `${theme === "light" ? "text-[#1A1A1A]" : "text-gray-400"} font-medium`
                }`}
              >
                {date}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`w-full h-px ${theme === "light" ? "bg-gray-100" : "bg-gray-800"} mb-6`} />

        {/* Calorie Donut Ring */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-52 h-52 shrink-0">
            {/* ViewBox 200x200 to fix glow truncation */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle
                cx="100" cy="100" r={RADIUS}
                fill="transparent"
                stroke={theme === "light" ? "#E8EAED" : "rgba(255, 255, 255, 0.08)"}
                strokeWidth="11"
                strokeLinecap="round"
              />
              <circle
                cx="100" cy="100" r={RADIUS}
                fill="transparent"
                stroke={isOverGoal ? CALORIE_OVER_COLOR : CALORIE_RING_COLOR}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={`${filledDash} ${CIRCUMFERENCE}`}
                filter={consumed > 0 ? "url(#glow)" : "none"}
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: 1,
                  boxShadow: consumed > 0 ? `0 0 15px ${isOverGoal ? CALORIE_OVER_COLOR : CALORIE_RING_COLOR}` : "none"
                }}
              />
            </svg>
            <div className="absolute inset-[14px] rounded-full flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-[11px] font-bold font-sans tracking-wider uppercase ${textDim}`}>
                Consumed
              </span>
              <span className={`text-[42px] font-bold font-serif leading-none mt-1 ${textTitle}`}>
                {consumed}
              </span>
              <span className={`text-[11px] font-bold font-sans mt-2 uppercase tracking-widest ${textDim}`}>
                KCal
              </span>
              {isOverGoal && (
                <div className="mt-2 bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
                  Goal Exceeded
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col items-center gap-1 mt-4 text-sm font-medium ${textDim}`}>
            <div className="flex items-center gap-3">
              <span>
                Goal: <span className={`font-bold ${textTitle}`}>{target}</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              {isOverGoal ? (
                <span className="text-red-500 font-bold">
                  Exceeded: {consumed - target} 
                </span>
              ) : (
                <span>
                  Remaining: <span className="font-bold text-[#60A5FA]">{remaining}</span>
                </span>
              )}
            </div>
            {isPersonalized && (
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1">
                ✦ Personalized for you
              </span>
            )}
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="space-y-4.5 mb-8">
           {/* Fat */}
           <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FAT_COLOR }} />
                <span className={`text-[11px] font-bold ${textDim} uppercase tracking-wider`}>Fat</span>
              </div>
              <span className={`text-xs font-bold ${textTitle} tabular-nums`}>{loggedFat}g / {fatTarget}g</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
               <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (loggedFat / fatTarget) * 100)}%`,
                    backgroundColor: FAT_COLOR,
                  }}
                />
            </div>
          </div>
          
          {/* Protein */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PROTEIN_COLOR }} />
                <span className={`text-[11px] font-bold ${textDim} uppercase tracking-wider`}>Protein</span>
              </div>
              <span className={`text-xs font-bold ${textTitle} tabular-nums`}>{loggedProtein}g / {proteinTarget}g</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
               <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (loggedProtein / proteinTarget) * 100)}%`,
                    backgroundColor: PROTEIN_COLOR,
                  }}
                />
            </div>
          </div>

          {/* Carbs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CARBS_COLOR }} />
                <span className={`text-[11px] font-bold ${textDim} uppercase tracking-wider`}>Carbs</span>
              </div>
              <span className={`text-xs font-bold ${textTitle} tabular-nums`}>{loggedCarbs}g / {carbsTarget}g</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (loggedCarbs / carbsTarget) * 100)}%`,
                    backgroundColor: CARBS_COLOR,
                  }}
                />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className={`w-full h-px ${theme === "light" ? "bg-gray-100" : "bg-gray-800"} mb-5`} />

        {/* Food Items List */}
        {todayLog && todayLog.items.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center px-1">
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${textDim}`}>Food Entries</h4>
              <button 
                onClick={onShowCalInput}
                className="w-6 h-6 rounded-full bg-[#60A5FA]/10 text-[#60A5FA] flex items-center justify-center hover:bg-[#60A5FA]/20 transition-all"
              >
                <span className="text-lg leading-none">+</span>
              </button>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {todayLog.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between group rounded-2xl px-4 py-3 border transition-all ${
                    theme === "light" ? "bg-gray-50/50 border-gray-100/50 hover:bg-gray-50" : "bg-gray-800/20 border-gray-800/40 hover:bg-gray-800/40"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm font-bold truncate ${textTitle}`}>{item.name}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{item.calories} kcal</p>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        onFoodNameInputChange(item.name);
                        onCalInputChange(String(item.calories));
                        // Technically we should have a "startEdit" logic, but for simplicity we'll just remove and re-add if saved
                        // OR we can add an isEditingId state.
                        onRemoveFoodItem(item.id);
                        onShowCalInput();
                      }}
                      className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-400"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button 
                      onClick={() => onRemoveFoodItem(item.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-red-400"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log Today's Calories Button (Initial state) */}
        {!showCalInput && !todayLog && (
          <button
            onClick={onShowCalInput}
            className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${ctaGradient}`}
          >
            🔥 Log Today's Calories
          </button>
        )}

        {/* Input Form */}
        {showCalInput && (
          <div className="space-y-4 animate-[fadeInUp_0.2s_ease-out]">
            <div className="space-y-3">
               <input
                type="text"
                value={foodNameInput}
                onChange={(e) => onFoodNameInputChange(e.target.value)}
                placeholder="What did you eat?"
                autoFocus
                className={`w-full px-5 py-3.5 rounded-2xl border font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                  theme === "light" ? "bg-gray-50 border-gray-100 text-[#1A1A1A] placeholder:text-gray-300" : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                }`}
              />
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={calInput}
                  onChange={(e) => onCalInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onLogCalories()}
                  placeholder="Calories"
                  className={`flex-1 px-5 py-3.5 rounded-2xl border font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                    theme === "light" ? "bg-gray-50 border-gray-100 text-[#1A1A1A] placeholder:text-gray-300" : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                  }`}
                />
                <button
                  onClick={onLogCalories}
                  className={`w-14 h-14 rounded-2xl text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${ctaGradient}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={onCancelCalInput}
              className="w-full text-xs font-bold text-gray-500 hover:text-gray-400 transition-colors py-2 uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add more entries button (when items exist but form is closed) */}
        {todayLog && !showCalInput && (
           <button
            onClick={onShowCalInput}
            className={`w-full py-3.5 rounded-2xl border-2 border-dashed font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              theme === "light" ? "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-500" : "bg-transparent border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">+</span> Add Another Item
          </button>
        )}
      </div>
    </div>
  );
}
