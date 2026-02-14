import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../state/OnboardingContext";

export default function BiometricsStep() {
  const { data, updateData } = useOnboarding();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const age = Number(data.age);
    const height = Number(data.height);
    const weight = Number(data.weight);

    if (!data.age || age < 13 || age > 120) newErrors.age = "Age must be 13–120";
    if (!data.height || height < 50 || height > 300) newErrors.height = "Height must be 50–300 cm";
    if (!data.weight || weight < 20 || weight > 500) newErrors.weight = "Weight must be 20–500 kg";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigate("/onboarding/goal");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Your body metrics</h1>
          <p className="mt-2 text-gray-400">We need these for accurate calculations</p>
        </div>

        <div className="space-y-4">
          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Age</label>
            <input
              type="number"
              value={data.age}
              onChange={(e) => updateData({ age: e.target.value })}
              placeholder="e.g. 25"
              className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.age && <p className="mt-1 text-sm text-red-400">{errors.age}</p>}
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Height (cm)</label>
            <input
              type="number"
              value={data.height}
              onChange={(e) => updateData({ height: e.target.value })}
              placeholder="e.g. 175"
              className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.height && <p className="mt-1 text-sm text-red-400">{errors.height}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={data.weight}
              onChange={(e) => updateData({ weight: e.target.value })}
              placeholder="e.g. 70"
              className="w-full p-3 rounded-xl bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            {errors.weight && <p className="mt-1 text-sm text-red-400">{errors.weight}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/onboarding/gender")}
            className="flex-1 py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-semibold hover:border-gray-500 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}