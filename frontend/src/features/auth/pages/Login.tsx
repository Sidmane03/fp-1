// pages/Login.tsx (or .jsx)
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../state/AuthContext";
import { Button, Input } from "../../../components/ui";

// Define the shape of our form data for TypeScript
type LoginValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>();

  const onSubmit = async (data: LoginValues) => {
    setAuthError("");
    setLoading(true);

    try {
      await login({ email: data.email, password: data.password });
      navigate("/dashboard");
    } catch (err) {
      // Type-safe error handling
      if (err instanceof Error) {
        setAuthError(err.message || "Failed to login");
      } else {
        setAuthError("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Sign in to your fitness planner</p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div 
            className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center" 
            role="alert"
          >
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address"
                }
              })}
              // Optional: Add a conditional error class if you want the border to turn red
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              {...register("password", { 
                required: "Password is required" 
              })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link
            to="/onboarding/gender"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}