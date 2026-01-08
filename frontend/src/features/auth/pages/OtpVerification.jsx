import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserProvider.jsx";
import api from "../../../api/axios.js";

const otpSchema = z.object({
  otpCode: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

const OtpVerification = ({ otpSessionId, maskedEmail, onOtpType }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(otpSchema),
  });
  const { login } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Start OTP timer from 5 minutes (300 seconds)
    setTimeLeft(300);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpSessionId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOtp = async (data) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Determine which endpoint to use based on context
      const endpoint =
        onOtpType === "register"
          ? "api/auth/verify-otp"
          : "api/auth/verify-reactivation-otp";

      const response = await api.post(endpoint, {
        otpSessionId,
        otpCode: data.otpCode,
      });

      console.log("OTP Verification Response:", response.data);
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      login(token, user);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setErrorMessage(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post("api/auth/resend-otp", {
        otpSessionId,
      });

      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      reset();
      console.log("OTP resent successfully");
    } catch (error) {
      console.error("Resend OTP error:", error);
      setErrorMessage(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="w-full min-h-screen dark:bg-zinc-950 flex items-center justify-center p-6"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(16, 185, 129) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* OTP Verification Card */}
      <div className="relative w-full max-w-md">
        <div
          className="relative dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 dark:border-zinc-800 shadow-2xl"
          style={{ boxShadow: "0 0 40px rgba(16, 185, 129, 0.1)" }}
        >
          {/* Glassmorphism effect */}
          <div
            className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
            }}
          ></div>

          <div className="relative flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-8">
              <h1
                className="text-3xl mb-2 text-emerald-400 tracking-[0.2em]"
                style={{ textShadow: "0 0 20px rgba(16, 185, 129, 0.8)" }}
              >
                VERIFY OTP
              </h1>
              <p className="text-zinc-400 text-sm mb-2">
                Enter the 6-digit code sent to:
              </p>
              <p className="text-emerald-400 font-semibold">{maskedEmail}</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="w-full mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* OTP Form */}
            <form
              onSubmit={handleSubmit(handleVerifyOtp)}
              className="w-full space-y-6"
            >
              {/* OTP Code Input */}
              <div>
                <label className="block text-sm text-zinc-400 mb-3">
                  OTP Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    {...register("otpCode")}
                    className="w-full pl-12 pr-4 py-4 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                </div>
                {errors.otpCode && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.otpCode.message}
                  </p>
                )}
              </div>

              {/* Timer */}
              <div className="text-center">
                <p className="text-sm text-zinc-400">
                  Code expires in:{" "}
                  <span
                    className={
                      timeLeft <= 60
                        ? "text-red-400 font-bold"
                        : "text-emerald-400 font-bold"
                    }
                  >
                    {formatTime(timeLeft)}
                  </span>
                </p>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-xl transition-all shadow-lg"
                style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            {/* Resend Section */}
            <div className="w-full mt-6 pt-6 border-t border-zinc-700">
              {!canResend ? (
                <p className="text-center text-sm text-zinc-400">
                  Didn't receive the code? You can resend after timer expires.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-zinc-400">
                    Didn't receive the code?
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="w-full py-2 px-4 border-2 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
