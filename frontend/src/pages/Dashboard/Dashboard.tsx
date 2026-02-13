import { useAuth } from '../../context/AuthContext.tsx';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Your target is to <span className="font-bold text-indigo-600">{user?.goal}</span>.
        </p>

        {/* Dynamic BMI Display from Backend */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800">Your Health Stats</h2>
          <p className="mt-1">BMI: <span className="font-bold">{user?.bmi || 'Not Calculated'}</span></p>
        </div>

        <button 
          onClick={logout}
          className="mt-8 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
