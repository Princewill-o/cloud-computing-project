import { FormEvent, useState } from "react";
import { useLocation, useNavigate, NavLink, Location } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";

type LocationState = {
  from?: Location;
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      login({
        user: {
          id: response.user.user_id,
          email: response.user.email,
          name: response.user.full_name,
        },
        accessToken: response.access_token,
      });
      navigate(state?.from?.pathname ?? "/", { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      console.error(apiError);
      setError(apiError.response?.data?.message || "Failed to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-primary mb-2">Welcome back</h2>
        <p className="text-sm text-secondary">
          Sign in to access your personalised dashboard and recommendations.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && !password ? error : undefined}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error && password ? error : undefined}
        />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-sm text-secondary text-center">
        New here?{" "}
        <NavLink to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
          Create an account
        </NavLink>
      </p>
    </div>
  );
}
