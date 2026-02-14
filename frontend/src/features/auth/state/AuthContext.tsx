import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authApi } from "../api/auth.api";
import { tokenStorage } from "../../../lib/storage";
import type { User, LoginCredentials, RegisterData } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = tokenStorage.get();
        if (token) {
          const profile = await authApi.getProfile();
          setUser({ ...profile, token });
        }
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const userData = await authApi.login(credentials);
    setUser(userData);
  };

  // Register → auto-login (token stored inside authApi.register)
  const register = async (data: RegisterData) => {
    const userData = await authApi.register(data);
    setUser(userData);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

return (
  <AuthContext.Provider value={{user, loading, login, register, logout}}>
    {children}
  </AuthContext.Provider>
);
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};