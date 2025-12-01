import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (payload: { user: User; accessToken: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "career_guide_auth";

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: User;
          accessToken: string;
        };
        setUser(parsed.user);
        setAccessToken(parsed.accessToken);
      } catch {
        // ignore
      }
    }
  }, []);

  const login: AuthContextValue["login"] = ({ user: u, accessToken: token }) => {
    setUser(u);
    setAccessToken(token);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: u, accessToken: token })
    );
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user && !!accessToken, accessToken, login, logout }}
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


