import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/OnboardingContext';
import api from '../../services/api'; // Use your existing axios instance

const PlanReveal = () => {
  const { data } = useOnboarding();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // Call the new "Calculator" endpoint
        const response = await api.post('/users/calculate-plan', {
          ...data,
          age: Number(data.age),
          height: Number(data.height),
          weight: Number(data.weight)
        });
        setPlan(response.data);
      } catch (error) {
        console.error("Failed to calculate", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [data]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your profile...</h2>
        <p className="text-gray-500">Calculating metabolic rate and macro split</p>
        {/* You can add a loading spinner here */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Custom Plan</h1>
      <p className="text-gray-600 mb-8">Based on your {data.goal.replace('_', ' ')} goal</p>

      {/* The "Payoff" Cards */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <p className="text-indigo-100 uppercase text-xs font-bold tracking-wider">Daily Target</p>
          <div className="text-5xl font-extrabold mt-2">{plan?.dailyCalories}</div>
          <p className="text-sm opacity-80">Calories</p>
        </div>
        
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{plan?.macros.protein}g</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{plan?.macros.carbs}g</div>
            <div className="text-xs text-gray-500">Carbs</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{plan?.macros.fats}g</div>
            <div className="text-xs text-gray-500">Fats</div>
          </div>
        </div>

        <div className="p-6 bg-indigo-50">
          <p className="text-center text-gray-700">
            Reach your goal by <span className="font-bold text-indigo-700">{plan?.projectedDate}</span>
          </p>
        </div>
      </div>

      {/* The Hook: "Save this plan" */}
      <button
        onClick={() => navigate('/register')} // Now send them to create account
        className="w-full max-w-md bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-lg"
      >
        Save Plan & Start Journey
      </button>
      
      <p className="mt-4 text-xs text-gray-400">
        By continuing you agree to our Terms of Service.
      </p>
    </div>
  );
};

export default PlanReveal;