import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import { authService, User, LoginRequest, RegisterRequest } from "../../../services/authService";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // No initial loading
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Set up Firebase auth state listener with immediate response
    const unsubscribe = authService.onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setUser(user);
      setInitialized(true);
      // No loading state for auth changes - instant response
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    // No loading state - instant response
    try {
      const user = await authService.login(data);
      setUser(user);
      console.log('Login successful:', user.email);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    // No loading state - instant response
    try {
      const user = await authService.register(data);
      setUser(user);
      console.log('Registration successful:', user.email);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    // No loading state - instant response
    try {
      const user = await authService.loginWithGoogle();
      setUser(user);
      console.log('Google login successful:', user.email);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    // No loading state - instant response
    try {
      const user = await authService.loginWithGitHub();
      setUser(user);
      console.log('GitHub login successful:', user.email);
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    // No loading state - instant response
    try {
      await authService.logout();
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await authService.resetPassword(email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: any): Promise<void> => {
    try {
      await authService.updateUserProfile(data);
      // Update local state instantly
      if (user) {
        setUser({ ...user, ...data });
      }
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated: !!user, 
        loading: false, // Always false for instant response
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


