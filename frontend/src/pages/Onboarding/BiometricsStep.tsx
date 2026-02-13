import { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useNavigate } from 'react-router-dom';

const BiometricsStep = () => {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();

  // Initialize with existing data if user goes "Back"
  const [age, setAge] = useState(data.age || '');
  const [height, setHeight] = useState(data.height || '');
  const [weight, setWeight] = useState(data.weight || '');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ 
      age: age.toString(), 
      height: height.toString(), 
      weight: weight.toString() 
    });
    // Navigate to the Reveal page (or Activity/Goal steps if you build them)
    navigate('/onboarding/reveal'); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Measurements</h2>
        
        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition"
          >
            Calculate Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default BiometricsStep;