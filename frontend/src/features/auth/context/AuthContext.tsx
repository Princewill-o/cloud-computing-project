import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import { authService, User as BackendUser } from "../../../services/authService";

type AuthContextValue = {
  user: BackendUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser({
        user_id: currentUser.user_id,
        email: currentUser.email,
        full_name: currentUser.full_name,
        name: currentUser.full_name, // Add alias
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const backendUser = await authService.login({ email, password });
      setUser({
        ...backendUser,
        name: backendUser.full_name, // Add alias
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    setLoading(true);
    try {
      const backendUser = await authService.register({ 
        email, 
        password, 
        full_name: displayName 
      });
      setUser({
        ...backendUser,
        name: backendUser.full_name, // Add alias
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    // For now, we'll use a demo account for Google login
    // In a real app, you'd implement OAuth flow
    await login("demo@example.com", "password123");
  };

  const loginWithGitHub = async (): Promise<void> => {
    // For now, we'll use a demo account for GitHub login
    // In a real app, you'd implement OAuth flow
    await login("test@careerguide.com", "testpass123");
  };

  const logout = async (): Promise<void> => {
    authService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    // For demo purposes, just show success
    console.log("Password reset requested for:", email);
    throw new Error("Password reset functionality not implemented in demo");
  };

  const updateProfile = async (data: any): Promise<void> => {
    // For demo purposes, just update local state
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading,
        login, 
        register,
        loginWithGoogle,
        loginWithGitHub,
        logout,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}


