import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext'; // Import this
import PrivateRoute from './components/layout/PrivateRoute';

// Pages (We will create the missing ones next)

import Dashboard from './pages/Dashboard/Dashboard';
import GenderStep from './pages/Onboarding/GenderStep';
import BiometricsStep from './pages/Onboarding/BiometricsStep';
import PlanReveal from './pages/Onboarding/PlanReveal';
import Login from './pages/Auth/login'; 
import Register from './pages/Auth/Register';
function App() {
  return (
    <Router>
      <AuthProvider>
        {/* FIX: Wrap the Routes with OnboardingProvider so data persists to Register page */}
        <OnboardingProvider> 
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Register needs access to Onboarding data, so it stays inside the Provider */}
            <Route path="/register" element={<Register />} />

            {/* Onboarding Routes */}
            <Route path="/onboarding/gender" element={<GenderStep />} />
            <Route path="/onboarding/biometrics" element={<BiometricsStep />} />
            <Route path="/onboarding/reveal" element={<PlanReveal />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;