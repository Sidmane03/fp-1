import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";
import { onboardingApi } from "../api/onboarding.api";

export default function PlanReveal() {
  const { data, planPreview, setPlanPreview, setPlanRevealed, resetOnboarding } =
    useOnboarding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white text-xl">Calculating your plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={handleStartOver}
            className="py-3 px-6 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (!planPreview) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Your Personalized Plan</h1>
          <p className="mt-2 text-gray-400">Here's what we recommend for you</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Daily Calories</p>
            <p className="text-2xl font-bold text-blue-400">{planPreview.targetCalories}</p>
            <p className="text-xs text-gray-500">kcal</p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Protein</p>
            <p className="text-2xl font-bold text-green-400">{planPreview.macros.protein}g</p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Carbs</p>
            <p className="text-2xl font-bold text-yellow-400">{planPreview.macros.carbs}g</p>
          </div>
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">Fats</p>
            <p className="text-2xl font-bold text-orange-400">{planPreview.macros.fats}g</p>
          </div>
        </div>

        {/* BMR / TDEE info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">BMR</span>
            <span className="text-white font-medium">{planPreview.bmr} kcal</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">TDEE</span>
            <span className="text-white font-medium">{planPreview.tdee} kcal</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCreateAccount}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Plan — Create Account
          </button>
          <button
            onClick={handleStartOver}
            className="w-full py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}