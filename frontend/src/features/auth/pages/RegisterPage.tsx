import { FormEvent, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
      });
      login({
        user: {
          id: response.user.user_id,
          email: response.user.email,
          name: response.user.full_name,
        },
        accessToken: response.access_token,
      });
      navigate("/questionnaire", { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      console.error(apiError);
      setError(apiError.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-primary mb-2">Create an account</h2>
        <p className="text-sm text-secondary">
          Get started with personalized career guidance and recommendations.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          helperText="Must be at least 8 characters"
        />
        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-sm text-secondary text-center">
        Already have an account?{" "}
        <NavLink to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          Sign in
        </NavLink>
      </p>
    </div>
  );
}
