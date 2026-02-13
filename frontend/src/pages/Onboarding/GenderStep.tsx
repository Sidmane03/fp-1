import { useOnboarding } from '../../context/OnboardingContext';
import { useNavigate } from 'react-router-dom';

const GenderStep = () => {
  const { updateData } = useOnboarding();
  const navigate = useNavigate();

  const handleSelect = (gender: string) => {
    // 1. Save data to the "Bucket"
    updateData({ gender });
    // 2. Move to next step
    navigate('/onboarding/biometrics');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Which one are you?</h2>
          <p className="mt-2 text-gray-600">To calculate your metabolic rate</p>
        </div>

        <div className="grid gap-4">
          {['male', 'female', 'other'].map((g) => (
            <button
              key={g}
              onClick={() => handleSelect(g)}
              className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group"
            >
              <span className="text-lg font-medium capitalize text-gray-900 group-hover:text-indigo-700">
                {g}
              </span>
              <span className="text-gray-400 group-hover:text-indigo-600">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenderStep;