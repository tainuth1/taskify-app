"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store";
import { signInAsync, clearError } from "@/features/auth/authSlice";

// Validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(5, "Password must be at least 5 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInFormData, string>> & { general?: string }
  >({});

  const {
    isLoading,
    error: authError,
    isAuthenticated,
  } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Redirect to workspace if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/workspace");
    }
  }, [isAuthenticated, router]);

  // Display auth errors
  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
    }
  }, [authError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }

    // Clear general error
    if (errors.general) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    dispatch(clearError());

    try {
      // Validate form data with Zod
      const validatedData = signInSchema.parse(formData);

      // Dispatch signin action
      const result = await dispatch(
        signInAsync({
          email: validatedData.email,
          password: validatedData.password,
        })
      );

      // Check if signin was successful
      if (signInAsync.fulfilled.match(result)) {
        // Reset form on success
        setFormData({ email: "", password: "" });
        // Redirect will happen via useEffect when isAuthenticated becomes true
      } else if (signInAsync.rejected.match(result)) {
        // Handle API errors
        const errorMessage = result.payload?.message || "Signin failed";
        const apiErrors = result.payload?.errors;

        if (apiErrors) {
          // Map API field errors to form errors
          const fieldErrors: Partial<Record<keyof SignInFormData, string>> = {};
          Object.entries(apiErrors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              fieldErrors[field as keyof SignInFormData] = messages[0];
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: Partial<Record<keyof SignInFormData, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignInFormData] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error("Unexpected error:", error);
        setErrors({ general: "An unexpected error occurred" });
      }
    }
  };

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center p-5 md:p-0">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started Now
          </h2>
          <p className="text-gray-600 text-sm">
            Please log in to your account to continue.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* General Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none transition ${
                errors.email
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-blue-600"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none transition pr-12 ${
                  errors.password
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          {/* <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-2 border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 cursor-pointer"
            >
              I agree to the Terms & Privacy
            </label>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Log in"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-700 mt-4">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">Or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="cursor-not-allowed flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-900"
            >
              <Image
                src={"/icons/google.svg"}
                alt="Google"
                width={20}
                height={20}
              />
              <span className="text-sm">Google</span>
            </button>
            <button
              type="button"
              className="cursor-not-allowed flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-900"
            >
              <Image
                src={"/icons/github.svg"}
                alt="Github"
                width={20}
                height={20}
              />
              <span className="text-sm">Github</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
