import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "../styles/index.css";
// Providers (we'll move these into features soon, but keeping here for now)
import { AuthProvider, useAuth } from "../features/auth/state/AuthContext";
import { OnboardingProvider } from "../features/onboarding/state/OnboardingContext";

// Layout
import PrivateRoute from "../components/layout/PrivateRoute";

// Feature: Auth
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

// Feature: Onboarding
import GenderStep from "../features/onboarding/components/GenderStep";
import BiometricsStep from "../features/onboarding/components/BiometricsStep";
import GoalStep from "../features/onboarding/components/Goalstep";
import ActivityStep from "../features/onboarding/components/ActivityStep";
import PaceStep from "../features/onboarding/components/PaceStep";
import PlanReveal from "../features/onboarding/components/PlanReveal";

// Feature: Dashboard
import Dashboard from "../features/dashboard/pages/Dashboard";

// Home redirect based on auth state
function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/onboarding/gender" replace />
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public: Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public: Onboarding */}
            <Route path="/onboarding/gender" element={<GenderStep />} />
            <Route path="/onboarding/biometrics" element={<BiometricsStep />} />
            <Route path="/onboarding/goal" element={<GoalStep />} />
            <Route path="/onboarding/goal" element={<GoalStep />} />
            <Route path="/onboarding/pace" element={<PaceStep />} />    {/* NEW */}
            <Route path="/onboarding/activity" element={<ActivityStep />} />
            <Route path="/onboarding/activity" element={<ActivityStep />} />
            <Route path="/onboarding/reveal" element={<PlanReveal />} />

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;