import React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/login.schema.js";
import { registerSchema } from "../schemas/register.schema.js";
import { useUser } from "../../../contexts/UserProvider.jsx";
import { User, Lock, Eye, EyeOff, Mail, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios.js";
import OtpVerification from "./OtpVerification.jsx";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSessionData, setOtpSessionData] = useState(null);
  const [otpType, setOtpType] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    control,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dob: "",
    },
  });

  const handleLogin = async (data) => {
    try {
      const response = await api.post("api/auth/login", {
        username: data.username,
        password: data.password,
      });


      // Check if OTP verification is required for reactivation
      if (response.data.data.requiresOtp) {
        toast.info("Account inactive. OTP sent for reactivation.");
        setOtpSessionData({
          otpSessionId: response.data.data.otpSessionId,
          maskedEmail: response.data.data.maskedEmail,
          otpExpiresIn: response.data.data.otpExpiresIn,
        });
        setOtpType("reactivate");
        return;
      }

      const { token, user } = response.data.data;
      login(token, user);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.status === 401) {
        toast.error("Invalid username or password.");
      }
    }
  };

  const handleRegister = async (data) => {
    try {
      const response = await api.post("api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        dob: data.dob,
      });

      // Set OTP session data
      setOtpSessionData({
        otpSessionId: response.data.data.otpSessionId,
        maskedEmail: response.data.data.maskedEmail,
        otpExpiresIn: response.data.data.otpExpiresIn,
      });
      setOtpType("register");
    } catch (error) {
      console.error("Register error:", error);

      if (error.status === 409) {
        toast.error("Username or email already exists.");
      }
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const response = await api.post("api/auth/forgot-password", {
        email,
      });
      
      setOtpSessionData({
        otpSessionId: response.data.data.otpSessionId,
        maskedEmail: response.data.data.maskedEmail,
        otpExpiresIn: response.data.data.otpExpiresIn,
      });
      setOtpType("forgot-password");
      setShowForgotPassword(false);
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <>
      {/* Show OTP Verification if session data exists */}
      {otpSessionData && (
        <OtpVerification
          otpSessionId={otpSessionData.otpSessionId}
          maskedEmail={otpSessionData.maskedEmail}
          onOtpType={otpType}
          backToLogin={() => {
            setOtpSessionData(null);
            setOtpType(null);
            setActiveTab("login");
          }}
        />
      )}

      {/* Show Auth Form if no OTP session */}
      {!otpSessionData && !showForgotPassword && (
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

          {/* Auth Card */}
          <div
            className="relative dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-6 border-2 dark:border-zinc-800 shadow-2xl"
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
              {/* Logo/Brand */}
              <div className="text-center mb-8">
                <h1
                  className="text-4xl mb-2 text-emerald-400 tracking-[0.3em]"
                  style={{ textShadow: "0 0 20px rgba(16, 185, 129, 0.8)" }}
                >
                  RETROBIT
                </h1>
                <p className="text-zinc-400">
                  Join the retro gaming revolution
                </p>
              </div>

              {/* Tabs */}
              <div className="w-full flex gap-2 p-1 rounded-xl dark:bg-zinc-800/50 mb-6 bg-gray-100">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "text-zinc-400 dark:hover:text-white"
                  }`}
                  style={{
                    textShadow:
                      activeTab === "login"
                        ? "0 0 10px rgba(16, 185, 129, 0.8)"
                        : "none",
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "text-zinc-400 dark:hover:text-white"
                  }`}
                  style={{
                    textShadow:
                      activeTab === "register"
                        ? "0 0 10px rgba(16, 185, 129, 0.8)"
                        : "none",
                  }}
                >
                  Register
                </button>
              </div>

              {/* Login Form */}
              {activeTab === "login" && (
                <form
                  onSubmit={handleSubmit(handleLogin)}
                  className="space-y-4 w-md"
                >
                  {/* Username Field */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        {...register("username")}
                        className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Enter your username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg cursor-pointer"
                    style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                  >
                    Login
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </form>
              )}

              {/* Register Form */}
              {activeTab === "register" && (
                <form
                  onSubmit={handleRegisterSubmit(handleRegister)}
                  className="space-y-4 w-xl"
                >
                  <div className="w-full space-y-4 grid grid-cols-2 gap-4">
                    {/* Username Field */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="text"
                          {...registerRegister("username")}
                          className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Choose a username"
                        />
                      </div>
                      {registerErrors.username && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerErrors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="email"
                          {...registerRegister("email")}
                          className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Enter your email"
                        />
                      </div>
                      {registerErrors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Full Name Field */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type="text"
                          {...registerRegister("fullName")}
                          className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      {registerErrors.fullName && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerErrors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth Field */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm text-zinc-400">
                        Date of Birth
                      </label>

                      <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => {
                          // Parse string to Date for calendar
                          const dateValue = field.value
                            ? new Date(field.value + "T00:00:00")
                            : undefined;

                          return (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="flex justify-between items-center p-3 bg-transparent hover:bg-transparent w-full border-2 dark:border-zinc-700 rounded-xl dark:text-white text-left dark:bg-zinc-800/50 focus:border-emerald-500 outline-none transition-colors">
                                  {field.value
                                    ? new Date(
                                        field.value + "T00:00:00"
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-2 w-4 h-4 text-zinc-500" />
                                </button>
                              </PopoverTrigger>

                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={dateValue}
                                  onSelect={(date) => {
                                    if (date) {
                                      // Convert to YYYY-MM-DD string
                                      const year = date.getFullYear();
                                      const month = String(
                                        date.getMonth() + 1
                                      ).padStart(2, "0");
                                      const day = String(
                                        date.getDate()
                                      ).padStart(2, "0");
                                      field.onChange(`${year}-${month}-${day}`);
                                    }
                                  }}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                  captionLayout="dropdown"
                                />
                              </PopoverContent>
                            </Popover>
                          );
                        }}
                      />

                      {registerErrors.dob && (
                        <p className="text-red-500 text-sm">
                          {registerErrors.dob.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          {...registerRegister("password")}
                          className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {registerErrors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerErrors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...registerRegister("confirmPassword")}
                          className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {registerErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {registerErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg cursor-pointer"
                    style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
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

          {/* Forgot Password Card */}
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
                    FORGOT PASSWORD?
                  </h1>
                  <p className="text-zinc-400 text-sm">
                    Enter your email and we'll send you a code to reset your password
                  </p>
                </div>

                {/* Forgot Password Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    if (email) {
                      handleForgotPassword(email);
                    }
                  }}
                  className="w-full space-y-6"
                >
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg cursor-pointer"
                    style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                  >
                    Send Reset Code
                  </button>

                  {/* Back to Login */}
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full py-2 px-4 border-2 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl transition-all cursor-pointer"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Auth;
