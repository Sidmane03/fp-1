import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  gender: string;
  age: number;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  targetWeight?: number;
  timeframeWeeks?: number;
  bmi: number | null;
  createdAt?: string;
  fitnessProfile: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  };
}

interface IntakeLog {
  calories: number;
  loggedAt: string;
}

interface WeightLog {
  weight: number;
  loggedAt: string;
}

type Tab = "home" | "progress" | "profile";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const FAT_COLOR = "#60A5FA";
const PROTEIN_COLOR = "#FACC15";
const CARBS_COLOR = "#4ADE80";
const CALORIE_RING_COLOR = "#4F9CF9";
const CALORIE_OVER_COLOR = "#EF4444"; 

const goalLabels: Record<string, string> = {
  lose_weight: "Lose Weight",
  maintain: "Maintain Weight",
  gain_muscle: "Gain Muscle",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getWeekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - start.getTime();
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getIntakeLog(dateKey: string): IntakeLog | null {
  const raw = localStorage.getItem(`intake_log_${dateKey}`);
  return raw ? JSON.parse(raw) : null;
}

function setIntakeLog(dateKey: string, log: IntakeLog): void {
  localStorage.setItem(`intake_log_${dateKey}`, JSON.stringify(log));
}

function getWeightLog(weekKey: string): WeightLog | null {
  const raw = localStorage.getItem(`weight_log_${weekKey}`);
  return raw ? JSON.parse(raw) : null;
}

function setWeightLog(weekKey: string, log: WeightLog): void {
  localStorage.setItem(`weight_log_${weekKey}`, JSON.stringify(log));
}

function getAdherenceCount(): number {
  let count = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (localStorage.getItem(`intake_log_${key}`)) count++;
  }
  return count;
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Theme State from Context
  const { theme, toggleTheme } = useTheme();

  // Tab State
  const [currentTab, setCurrentTab] = useState<Tab>("home");

  // Zone 1 state
  const [todayLog, setTodayLog] = useState<IntakeLog | null>(null);
  const [showCalInput, setShowCalInput] = useState(false);
  const [calInput, setCalInput] = useState("");

  // Zone 2 state
  const [weekWeight, setWeekWeight] = useState<WeightLog | null>(null);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [adherence, setAdherence] = useState(0);

  // Zone 3 state
  const [planExpanded, setPlanExpanded] = useState(false);

  const todayKey = useMemo(() => getTodayKey(), []);
  const weekKey = useMemo(() => getWeekKey(), []);
  const weekDates = useMemo(() => getWeekDates(), []);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: res } = await api.get("/api/users/profile");
        setProfile(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    setTodayLog(getIntakeLog(todayKey));
    setWeekWeight(getWeightLog(weekKey));
    setAdherence(getAdherenceCount());
  }, [todayKey, weekKey]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogCalories = () => {
    const val = parseInt(calInput, 10);
    if (isNaN(val) || val <= 0) return;
    const log: IntakeLog = { calories: val, loggedAt: new Date().toISOString() };
    setIntakeLog(todayKey, log);
    setTodayLog(log);
    setShowCalInput(false);
    setCalInput("");
    setAdherence(getAdherenceCount());
  };

  const handleEditCalories = () => {
    if (todayLog) {
      setCalInput(String(todayLog.calories));
      setShowCalInput(true);
    }
  };

  const handleLogWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;
    const log: WeightLog = { weight: val, loggedAt: new Date().toISOString() };
    setWeightLog(weekKey, log);
    setWeekWeight(log);
    setShowWeightInput(false);
    setWeightInput("");
  };

  // toggleTheme is now provided by useTheme() context

  // ─── Check-in Day Logic ─────────────────────────────────────────────────────

  const registrationDay = useMemo(() => {
    if (!profile?.createdAt) return new Date().getDay();
    return new Date(profile.createdAt).getDay();
  }, [profile]);

  const isCheckInDay = new Date().getDay() === registrationDay;

  const daysUntilCheckIn = useMemo(() => {
    const today = new Date().getDay();
    if (today === registrationDay) return 0;
    return (registrationDay - today + 7) % 7;
  }, [registrationDay]);

  // ─── Loading / Error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans ${theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-950"}`}>
        <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-6" />
        <h2 className={`text-2xl font-bold font-serif ${theme === "light" ? "text-[#1A1A1A]" : "text-white"}`}>Loading your dashboard...</h2>
        <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-2 font-medium`}>Fetching your fitness plan</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans text-center ${theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-950"}`}>
        <div className={`w-20 h-20 ${theme === "light" ? "bg-red-50 text-red-500" : "bg-red-900/30 text-red-400"} rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm`}>⚠️</div>
        <h2 className={`text-2xl font-bold font-serif ${theme === "light" ? "text-[#1A1A1A]" : "text-white"}`}>Something went wrong</h2>
        <p className={`${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-2 mb-8 font-medium`}>{error || "Could not load your profile"}</p>
        <button
          onClick={handleLogout}
          className={`py-4 px-8 rounded-full font-bold shadow-xl transition-all border ${
            theme === "light" 
              ? "bg-white text-[#1A1A1A] border-gray-100 hover:bg-gray-50" 
              : "bg-gray-900 text-white border-gray-800 hover:bg-gray-800"
          }`}
        >
          Logout
        </button>
      </div>
    );
  }

  const { fitnessProfile: fp } = profile;
  const consumed = todayLog?.calories ?? 0;
  const target = fp.targetCalories;
  const remaining = Math.max(0, target - consumed);
  const progressPercent = Math.min(consumed / target, 1);
  const isOverGoal = consumed > target;

  // ─── SVG Donut Calculations ─────────────────────────────────────────────────

  const RADIUS = 72;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const filledDash = progressPercent * CIRCUMFERENCE;

  // Macro Target and Proportional logging check
  const fatTarget = fp.macros.fats;
  const proteinTarget = fp.macros.protein;
  const carbsTarget = fp.macros.carbs;

  // Actual macro grams logged (approximated based on simple calorie ratio for UI visualization)
  const loggedFat = todayLog ? Math.round(consumed * (fp.macros.fats / target)) : 0;
  const loggedProtein = todayLog ? Math.round(consumed * (fp.macros.protein / target)) : 0;
  const loggedCarbs = todayLog ? Math.round(consumed * (fp.macros.carbs / target)) : 0;

  // Weight progress
  const currentWeight = weekWeight?.weight ?? profile.weight;
  const targetWeight = profile.targetWeight ?? profile.weight;
  const startWeight = profile.weight;
  const weightRange = Math.abs(targetWeight - startWeight);
  const weightProgress = weightRange > 0 ? Math.min(1, Math.abs(currentWeight - startWeight) / weightRange) : 0;

  // ─── Classes ────────────────────────────────────────────────────────────────
  const cardBase = theme === "light" 
    ? "bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
    : "bg-gray-900 rounded-[28px] p-6 shadow-2xl border border-gray-800";
  
  const textTitle = theme === "light" ? "text-[#1A1A1A]" : "text-white";
  const textDim = theme === "light" ? "text-gray-400" : "text-gray-500";
  const bgDim = theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-800/30";
  const borderDim = theme === "light" ? "border-gray-100" : "border-gray-800/50";
  const ctaGradient = "bg-linear-to-r from-[#FF8A00] to-[#FF5722]";

  // ─── Render Sub-Components for Tabs ──────────────────────────────────────────

  const HomeTab = (
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
          onClick={toggleTheme}
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
          onClick={() => setCurrentTab("progress")}
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

          <div className={`flex items-center gap-3 mt-4 text-sm font-medium ${textDim}`}>
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

        {/* Log / Edit Calories */}
        {!showCalInput && !todayLog && (
          <button
            onClick={() => { setShowCalInput(true); setCalInput(""); }}
            className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ${ctaGradient}`}
          >
            🔥 Log Today's Calories
          </button>
        )}

        {todayLog && !showCalInput && (
          <div className={`flex items-center justify-between rounded-2xl px-5 py-4 border ${bgDim} ${borderDim}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${theme === "light" ? "bg-green-50 text-green-500" : "bg-green-900/30 text-green-400"}`}>✅</div>
              <div>
                <p className={`text-sm font-bold ${textTitle}`}>Logged today</p>
                <p className="text-xs text-gray-400 font-medium">{todayLog.calories} kcal</p>
              </div>
            </div>
            <button
              onClick={handleEditCalories}
              className="text-sm font-bold text-[#60A5FA] hover:underline transition-all"
            >
              Edit
            </button>
          </div>
        )}

        {showCalInput && (
          <div className="space-y-3 animate-[fadeInUp_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={calInput}
                onChange={(e) => setCalInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogCalories()}
                placeholder="Enter calories..."
                autoFocus
                className={`flex-1 px-5 py-3.5 rounded-2xl border font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${
                  theme === "light" ? "bg-gray-50 border-gray-100 text-[#1A1A1A] placeholder:text-gray-300" : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-600"
                }`}
              />
              <button
                onClick={handleLogCalories}
                className={`w-12 h-12 rounded-2xl text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${ctaGradient}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => { setShowCalInput(false); setCalInput(""); }}
              className="text-sm font-medium text-gray-500 hover:text-gray-400 transition-colors px-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const ProgressTab = (
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
                onClick={() => { setShowWeightInput(true); setWeightInput(""); }}
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
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
              placeholder="Weight in kg..."
              autoFocus
              className={`flex-1 px-5 py-3 rounded-2xl border font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                theme === "light" ? "bg-gray-50 border-gray-100 text-[#1A1A1A]" : "bg-gray-800 border-gray-700 text-white"
              }`}
            />
            <button
              onClick={handleLogWeight}
              className={`w-11 h-11 rounded-2xl text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform ${
                theme === "light" ? "bg-[#3B82F6]" : "bg-blue-600"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              onClick={() => { setShowWeightInput(false); setWeightInput(""); }}
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

  const ProfileTab = (
    <div className="space-y-5 animate-[fadeInUp_0.3s_ease-out]">
      <div className="px-1">
        <h2 className={`text-2xl font-bold font-serif ${textTitle}`}>Hi, {profile.name}!</h2>
        <p className={`text-sm font-medium ${textDim} mt-0.5`}>Your personal health profile</p>
      </div>

      <div className={`${theme === "light" ? "bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]" : "bg-gray-900 rounded-[28px] shadow-2xl border border-gray-800"} overflow-hidden`}>
        <button
          onClick={() => setPlanExpanded(!planExpanded)}
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
        onClick={handleLogout}
        className={`w-full py-4 mt-4 rounded-2xl font-bold text-sm transition-all active:scale-95 border ${
          theme === "light" 
            ? "bg-white border-gray-100 text-gray-500 hover:text-red-500 hover:border-red-50" 
            : "bg-gray-900 border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-900/50 hover:bg-red-950/20"
        }`}
      >
        Logout
      </button>
    </div>
  );

  // ─── Main Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen flex flex-col items-center pb-32 pt-6 px-4 font-sans transition-colors duration-500 ${theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-950 text-white"}`}>
      <div className="w-full max-w-md">
        
        {/* Render Tab Content */}
        {currentTab === "home" && HomeTab}
        {currentTab === "progress" && ProgressTab}
        {currentTab === "profile" && ProfileTab}

      </div>

      {/* ─── Fixed Bottom Navigation Bar ───────────────────────────────────── */}
      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none z-50">
        <nav className={`w-full max-w-[280px] backdrop-blur-xl border rounded-full p-1.5 flex items-center justify-between pointer-events-auto transition-all ${
          theme === "light" 
            ? "bg-white/80 border-gray-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.06)]" 
            : "bg-gray-900/80 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        }`}>
          <button
            onClick={() => setCurrentTab("home")}
            className={`flex-1 py-3 px-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-center ${
              currentTab === "home" 
                ? (theme === "light" ? "bg-[#1A1A1A] text-white shadow-md" : "bg-gray-800 text-white shadow-lg") 
                : (theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300")
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentTab("progress")}
            className={`flex-1 py-3 px-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-center ${
              currentTab === "progress" 
                ? (theme === "light" ? "bg-[#1A1A1A] text-white shadow-md" : "bg-gray-800 text-white shadow-lg") 
                : (theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300")
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setCurrentTab("profile")}
            className={`flex-1 py-3 px-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 text-center ${
              currentTab === "profile" 
                ? (theme === "light" ? "bg-[#1A1A1A] text-white shadow-md" : "bg-gray-800 text-white shadow-lg") 
                : (theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-gray-500 hover:text-gray-300")
            }`}
          >
            Profile
          </button>
        </nav>
      </div>
    </div>
  );
}
