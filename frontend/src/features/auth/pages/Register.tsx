import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../state/AuthContext";
import { useOnboarding } from "../../onboarding/state/OnboardingContext";
import { Button, Input } from "../../../components/ui";

// Define the shape of our form data for TypeScript
type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const { data, planRevealed } = useOnboarding();
  const { register: authRegister } = useAuth(); 
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  if (!planRevealed) {
    return <Navigate to="/onboarding/gender" replace />;
  }

  const onSubmit = async (formData: FormValues) => {
    setAuthError("");
    setLoading(true);

    try {
      await authRegister({
        ...formData,
        gender: data.gender,
        age: Number(data.age),
        height: Number(data.height),
        weight: Number(data.weight),
        goal: data.goal,
        activityLevel: data.activityLevel,
        targetWeight: data.targetWeight ? Number(data.targetWeight) : undefined,
        timeframeWeeks: data.timeframeWeeks ? Number(data.timeframeWeeks) : undefined,
      });

      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("An unexpected error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F7F3]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Create your account</h1>
          <p className="mt-2 text-gray-500">To save your personalized plan</p>
        </div>

        {authError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center" role="alert">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Full Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              error={errors.name?.message}
              {...register("name", { required: "Name is required" })}
            />
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address"
                }
              })}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="Password (min 6 characters)"
              error={errors.password?.message}
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
          </div>

          <Button type="submit" isLoading={loading}>
            Complete Registration
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-500 hover:text-blue-400">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}