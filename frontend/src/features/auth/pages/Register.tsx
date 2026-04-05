import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../state/AuthContext";
import { useOnboarding } from "../../onboarding/state/OnboardingContext";

// Define the shape of our form data for TypeScript
type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const { data, planRevealed } = useOnboarding();
  // Alias register to authRegister to prevent naming collision with react-hook-form
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

  // RHF passes the validated data to this function
  const onSubmit = async (formData: FormValues) => {
    setAuthError("");
    setLoading(true);

    try {
      await authRegister({
        ...formData, // Spread the validated name, email, and password
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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-gray-400">To save your personalized plan</p>
        </div>

        {authError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center" role="alert">
            {authError}
          </div>
        )}

        {/* Use RHF's handleSubmit to wrap your custom onSubmit */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Full Name"
              className={`w-full p-3 rounded-xl bg-gray-900 border-2 text-white placeholder-gray-500 focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-700 focus:border-blue-500"
              }`}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Email address"
              className={`w-full p-3 rounded-xl bg-gray-900 border-2 text-white placeholder-gray-500 focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-700 focus:border-blue-500"
              }`}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address (e.g., name@example.com)"
                }
              })}
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password (min 6 characters)"
              className={`w-full p-3 rounded-xl bg-gray-900 border-2 text-white placeholder-gray-500 focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-700 focus:border-blue-500"
              }`}
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}