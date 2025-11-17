"use client";

import { useState } from "react";
import Link from "next/link";

export default function VerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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
        <form className="space-y-5">
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
                />
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition mt-6"
          >
            Verify OTP
          </button>

          {/* Resend Code */}
          <p className="text-center text-sm text-gray-700 mt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="cursor-pointer font-semibold text-blue-600 hover:text-blue-700"
            >
              Resend
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
