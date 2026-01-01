import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import { User as FirebaseUser } from "firebase/auth";
import { firebaseAuthService, UserProfile } from "../../../services/firebaseAuth";

type User = {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  profile?: UserProfile;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in
        const profile = await firebaseAuthService.getUserProfile(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || profile?.displayName || "",
          photoURL: firebaseUser.photoURL || profile?.photoURL,
          profile: profile || undefined
        });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await firebaseAuthService.login(email, password);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    try {
      setLoading(true);
      await firebaseAuthService.register(email, password, displayName);
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseAuthService.signInWithGoogle();
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    try {
      setLoading(true);
      await firebaseAuthService.signInWithGitHub();
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseAuthService.logout();
      // User state will be updated by the onAuthStateChanged listener
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await firebaseAuthService.resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error("No user logged in");
    
    try {
      await firebaseAuthService.updateUserProfile(user.id, data);
      // Refresh user data
      const updatedProfile = await firebaseAuthService.getUserProfile(user.id);
      if (updatedProfile) {
        setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
      }
    } catch (error) {
      throw error;
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


