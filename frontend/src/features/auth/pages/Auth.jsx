import React from 'react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../schemas/login.schema.js'
import { registerSchema } from '../schemas/register.schema.js'
import { useUser } from '../../../contexts/UserProvider.jsx'
import { User, Lock, Eye, EyeOff, Mail, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Controller } from "react-hook-form";


const Auth = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { setUser } = useUser()

  const {register, handleSubmit, formState: { errors }} = useForm({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    control,
    formState: { errors: registerErrors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dob: undefined, 
    },
  });

  const handleLogin = (data) => {
    console.log("Login Data:", data)
    // Mock login logic
    setUser({
      id: 1,
      username: data.username,
      email: 'example@example.com',
      role: 'user',
    })
  }

  const handleRegister = (data) => {
    console.log("Register Data:", data)
    // Mock register logic
    setUser({
      id: 2,
      username: data.username,
      email: data.email,
      role: 'user',
    })
  }

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

      {/* Auth Card */}
      <div className="relative">
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
              <p className="text-zinc-400">Join the retro gaming revolution</p>
            </div>

            {/* Tabs */}
            <div className="w-full flex gap-2 p-1 rounded-xl dark:bg-zinc-800/50 mb-6 bg-gray-100">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 px-4 rounded-lg transition-all ${
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
                className={`flex-1 py-3 px-4 rounded-lg transition-all ${
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
                      className="w-full pl-12 pr-12 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
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
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg"
                  style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                >
                  Login
                </button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-emerald-400 hover:text-emerald-300"
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
                className="space-y-4 w-full"
              >
                <div className="w-full space-y-4 grid grid-cols-2 gap-2">
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
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex justify-between items-center p-3 bg-transparent hover:bg-transparent w-full border-2 dark:border-zinc-700 rounded-xl text-black dark:text-white text-left dark:bg-zinc-800/50 focus:border-emerald-500 outline-none transition-colors">
                              {field.value instanceof Date
                                ? field.value.toLocaleDateString()
                                : "Pick a date"}
                              <CalendarIcon className="ml-2 w-4 h-4 text-zinc-500" />
                            </button>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
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
                        className="w-full pl-12 pr-12 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
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
                        className="w-full pl-12 pr-12 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
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
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg"
                  style={{ boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                >
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth