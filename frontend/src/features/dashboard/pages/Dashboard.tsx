import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../lib/axios";

import type { UserProfile, Tab } from "../types/dashboard.types";
import { useIntakeLogs } from "../hooks/useIntakeLogs";
import { useWeightLogs } from "../hooks/useWeightLogs";
import { useFLModel } from "../hooks/useFLModel";
import { HomeTab } from "../components/HomeTab";
import { ProgressTab } from "../components/ProgressTab";
import { ProfileTab } from "../components/ProfileTab";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { theme, toggleTheme } = useTheme();

  const [currentTab, setCurrentTab] = useState<Tab>("home");

  const [showCalInput, setShowCalInput] = useState(false);
  const [calInput, setCalInput] = useState("");
  const [foodNameInput, setFoodNameInput] = useState("");

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  const [planExpanded, setPlanExpanded] = useState(false);

  // Hooks
  const { todayLog, adherence, addFoodItem, editFoodItem, removeFoodItem } = useIntakeLogs();
  const { adjustedTarget, isPersonalized, runTraining } = useFLModel(
    profile?.fitnessProfile.targetCalories ?? 0,
    profile?.goal ?? ""
  );
  const { weekWeight, currentWeight, weightProgress, isCheckInDay, daysUntilCheckIn, logWeight } = useWeightLogs(profile, runTraining);

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: res } = await api.get("/api/users/profile");
        setProfile(res.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to load profile");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogCalories = () => {
    const val = parseInt(calInput, 10);
    if (isNaN(val) || val <= 0) return;
    addFoodItem(foodNameInput, val);
    setShowCalInput(false);
    setCalInput("");
    setFoodNameInput("");
  };

  const handleLogWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;
    logWeight(val);
    setShowWeightInput(false);
    setWeightInput("");
  };

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

  // ─── Main Render ─────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen flex flex-col items-center pb-32 pt-6 px-4 font-sans transition-colors duration-500 ${theme === "light" ? "bg-[#F8F7F3]" : "bg-gray-950 text-white"}`}>
      <div className="w-full max-w-md">
        
        {/* Render Tab Content */}
        {currentTab === "home" && (
          <HomeTab
            profile={profile}
            todayLog={todayLog}
            adherence={adherence}
            theme={theme}
            showCalInput={showCalInput}
            calInput={calInput}
            foodNameInput={foodNameInput}
            isCheckInDay={isCheckInDay}
            weekWeight={weekWeight}
            adjustedTarget={adjustedTarget}
            isPersonalized={isPersonalized}
            onShowCalInput={() => { setShowCalInput(true); setCalInput(""); setFoodNameInput(""); }}
            onCalInputChange={setCalInput}
            onFoodNameInputChange={setFoodNameInput}
            onLogCalories={handleLogCalories}
            onEditFoodItem={editFoodItem}
            onRemoveFoodItem={removeFoodItem}
            onCancelCalInput={() => { setShowCalInput(false); setCalInput(""); setFoodNameInput(""); }}
            onNavigateToProgress={() => setCurrentTab("progress")}
            onToggleTheme={toggleTheme}
          />
        )}
        
        {currentTab === "progress" && (
          <ProgressTab
            profile={profile}
            weekWeight={weekWeight}
            currentWeight={currentWeight}
            weightProgress={weightProgress}
            adherence={adherence}
            isCheckInDay={isCheckInDay}
            daysUntilCheckIn={daysUntilCheckIn}
            theme={theme}
            showWeightInput={showWeightInput}
            weightInput={weightInput}
            onShowWeightInput={() => { setShowWeightInput(true); setWeightInput(""); }}
            onWeightInputChange={setWeightInput}
            onLogWeight={handleLogWeight}
            onCancelWeightInput={() => { setShowWeightInput(false); setWeightInput(""); }}
          />
        )}
        
        {currentTab === "profile" && (
          <ProfileTab
            profile={profile}
            theme={theme}
            planExpanded={planExpanded}
            onTogglePlan={() => setPlanExpanded(!planExpanded)}
            onLogout={handleLogout}
            formulaTarget={profile.fitnessProfile.targetCalories}
          />
        )}

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
