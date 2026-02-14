import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/state/AuthContext";
import { api } from "../../../lib/axios";

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

const goalLabels: Record<string, string> = {
  lose_weight: "Lose Weight",
  maintain: "Maintain Weight",
  gain_muscle: "Gain Muscle",
};

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error || "Something went wrong"}</p>
          <button
            onClick={handleLogout}
            className="py-2 px-6 rounded-xl border-2 border-gray-700 text-gray-300 hover:border-gray-500"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const { fitnessProfile: fp } = profile;

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Hello, {profile.name}! 👋
            </h1>
            <p className="mt-1 text-gray-400">
              Goal:{" "}
              <span className="text-blue-400 font-medium">
                {goalLabels[profile.goal] || profile.goal}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="py-2 px-4 rounded-xl border-2 border-gray-700 text-gray-400 text-sm hover:border-red-500 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Daily Targets */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400">Daily Calories</p>
            <p className="text-3xl font-bold text-blue-400">
              {fp.targetCalories}
            </p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400">Protein</p>
            <p className="text-3xl font-bold text-green-400">
              {fp.macros.protein}g
            </p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400">Carbs</p>
            <p className="text-3xl font-bold text-yellow-400">
              {fp.macros.carbs}g
            </p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-400">Fats</p>
            <p className="text-3xl font-bold text-orange-400">
              {fp.macros.fats}g
            </p>
          </div>
        </div>

        {/* Body Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">Your Stats</h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">BMR</span>
              <span className="text-white font-medium">{fp.bmr} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">TDEE</span>
              <span className="text-white font-medium">{fp.tdee} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">BMI</span>
              <span className="text-white font-medium">
                {profile.bmi ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Weight</span>
              <span className="text-white font-medium">
                {profile.weight} kg
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Height</span>
              <span className="text-white font-medium">
                {profile.height} cm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Age</span>
              <span className="text-white font-medium">{profile.age}</span>
            </div>
          </div>
        </div>

        {/* Goal Details (if gain/lose) */}
        {profile.targetWeight && profile.timeframeWeeks && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
            <h2 className="text-lg font-semibold text-white">Goal Details</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Target Weight</span>
              <span className="text-white font-medium">
                {profile.targetWeight} kg
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Timeframe</span>
              <span className="text-white font-medium">
                {profile.timeframeWeeks} weeks
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}