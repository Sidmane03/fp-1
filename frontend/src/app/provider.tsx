import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../features/auth/state/AuthContext";
import { OnboardingProvider } from "../features/onboarding/state/OnboardingContext";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Router>
      <AuthProvider>
        <OnboardingProvider>
          {children}
        </OnboardingProvider>
      </AuthProvider>
    </Router>
  );
}
