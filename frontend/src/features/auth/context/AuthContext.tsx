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
    let unsubscribe: (() => void) | null = null;
    
    try {
      console.log('Setting up Firebase auth listener...');
      unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            console.log('User signed in:', firebaseUser.uid, firebaseUser.email);
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
            console.log('User signed out');
            // User is signed out
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      });
      console.log('Firebase auth listener set up successfully');
    } catch (error) {
      console.error('Error setting up Firebase auth listener:', error);
      setLoading(false);
    }

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout reached, stopping loading');
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth:', error);
        }
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await firebaseAuthService.login(email, password);
      // User state will be updated by the onAuthStateChanged listener
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<void> => {
    setLoading(true);
    try {
      await firebaseAuthService.register(email, password, displayName);
      // User state will be updated by the onAuthStateChanged listener
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      await firebaseAuthService.signInWithGoogle();
      // User state will be updated by the onAuthStateChanged listener
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    setLoading(true);
    try {
      await firebaseAuthService.signInWithGitHub();
      // User state will be updated by the onAuthStateChanged listener
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await firebaseAuthService.logout();
    // User state will be updated by the onAuthStateChanged listener
  };

  const resetPassword = async (email: string): Promise<void> => {
    await firebaseAuthService.resetPassword(email);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error("No user logged in");
    
    await firebaseAuthService.updateUserProfile(user.id, data);
    // Refresh user data
    const updatedProfile = await firebaseAuthService.getUserProfile(user.id);
    if (updatedProfile) {
      setUser(prev => prev ? { ...prev, profile: updatedProfile } : null);
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


