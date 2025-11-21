"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  verifyOtpAsync,
  forgetPasswordAsync,
  clearError,
} from "@/features/auth/authSlice";

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    isLoading,
    error: authError,
    resetEmail,
  } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Redirect if no email in state (user came directly to this page)
  useEffect(() => {
    if (!resetEmail) {
      router.push("/forgot-password");
    }
  }, [resetEmail, router]);

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelector(
        `input[data-index="${index - 1}"]`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (!resetEmail) {
      router.push("/forgot-password");
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    dispatch(clearError());

    try {
      const result = await dispatch(forgetPasswordAsync(resetEmail));

      if (forgetPasswordAsync.fulfilled.match(result)) {
        setResendSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(clearError());
    setResendSuccess(false);

    if (!resetEmail) {
      router.push("/forgot-password");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      return;
    }

    try {
      const result = await dispatch(
        verifyOtpAsync({ email: resetEmail, otp: otpCode })
      );

      if (verifyOtpAsync.fulfilled.match(result)) {
        router.push("/reset-password");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
    }
  };

  return (
    <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-0">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to your email.
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Success Message */}
          {resendSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                OTP code has been resent to your email.
              </p>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{authError}</p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              OTP Code
            </label>
            <div className="grid grid-cols-6 gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  data-index={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 aspect-square text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Verify OTP"}
          </button>

          {/* Resend Code */}
          <p className="text-center text-sm text-gray-700 mt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isLoading}
              className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin w-3 h-3" />
                </>
              ) : (
                "Resend"
              )}
            </button>
          </p>

          {/* Back to Forgot Password */}
          <p className="text-center text-sm text-gray-600 mt-4">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Back
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
