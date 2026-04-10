import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../features/auth/state/AuthContext";
import { OnboardingProvider } from "../features/onboarding/state/OnboardingContext";
import { ThemeProvider } from "../context/ThemeContext";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
