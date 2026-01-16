import React, { use } from "react";
import {
  Edit2,
  Trophy,
  Target,
  Lock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserProvider";
import { getInitials } from "@/utils/Username";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { User } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { editSchema } from "../schemas/editSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import api from "@/api/axios";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [backup, setBackup] = useState({
    full_name: "",
    dob: "",
  });
  const [achievements, setAchievements] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: "",
      dob: "",
    },
  });

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/achievements/me");
        setAchievements(response.data.data);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        toast.error("Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAchievements();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || "",
        dob: user.dob || "",
      });

      setBackup({
        full_name: user.full_name || "",
        dob: user.dob || "",
      });
    }
  }, [user]);

  const handleCancel = () => {
    reset(backup);
  };

  const onSubmit = async (data) => {
    console.log("Submitting data:", data);
    try {
      const response = await api.put("/api/auth/profile", data);
      toast.success("Profile updated successfully");
      setOpen(false);
      console.log("Profile updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Filter achievements based on active tab
  const getFilteredAchievements = () => {
    if (!achievements) return [];

    switch (activeTab) {
      case "unlocked":
        return achievements.achievements.unlocked || [];
      case "in_progress":
        return achievements.achievements.in_progress || [];
      case "locked":
        return achievements.achievements.locked || [];
      case "all":
      default:
        return [
          ...(achievements.achievements.unlocked || []),
          ...(achievements.achievements.in_progress || []),
          ...(achievements.achievements.locked || []),
        ];
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      beginner: "bg-green-500/20 text-green-400 border-green-500/30",
      expert: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      special: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };
    return colors[category] || colors.beginner;
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 flex flex-col gap-6 dark:bg-zinc-900/50">
      {/* Profile Card */}
      <div className="w-full bg-zinc-50 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 border shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Large Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl text-2xl sm:text-3xl text-white flex-shrink-0">
            {getInitials(user.username)}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl dark:text-white">
              {user.username}
            </h1>
            <span className="text-sm dark:text-zinc-400 text-gray-600 break-all">
              {user.email}
            </span>
          </div>

          {/* Edit Button */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap">
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="text"
                        {...register("full_name")}
                        className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Date of birth */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm text-zinc-400">
                      Date of Birth
                    </label>

                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => {
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
                                    const year = date.getFullYear();
                                    const month = String(
                                      date.getMonth() + 1
                                    ).padStart(2, "0");
                                    const day = String(date.getDate()).padStart(
                                      2,
                                      "0"
                                    );
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

                    {errors.dob && (
                      <p className="text-red-500 text-sm">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg cursor-pointer"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="w-full bg-zinc-50 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 border shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Achievements</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : achievements ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Unlocked
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {achievements.unlocked_count}/{achievements.total_count}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Total Points
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {achievements.total_points}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold dark:text-white">
                      {achievements.achievements.in_progress?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { id: "all", label: "All", icon: Trophy },
                { id: "unlocked", label: "Unlocked", icon: CheckCircle2 },
                { id: "in_progress", label: "In Progress", icon: Target },
                { id: "locked", label: "Locked", icon: Lock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredAchievements().map((achievement) => (
                <div
                  key={achievement.id}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 transition-all ${
                    achievement.is_unlocked
                      ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 dark:from-emerald-500/20 dark:to-cyan-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {/* Locked Overlay */}
                  {!achievement.is_unlocked &&
                    achievement.progress?.percentage === 0 && (
                      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Lock className="w-12 h-12 text-zinc-400" />
                      </div>
                    )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`text-4xl p-3 rounded-xl ${
                        achievement.is_unlocked
                          ? "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg"
                          : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      {achievement.icon || "🏆"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg dark:text-white line-clamp-1">
                          {achievement.name}
                        </h3>
                        {achievement.points && (
                          <span className="flex-shrink-0 px-2 py-1 bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold">
                            +{achievement.points}
                          </span>
                        )}
                      </div>

                      {achievement.description && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                          {achievement.description}
                        </p>
                      )}

                      {/* Category Badge */}
                      {achievement.category && (
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-medium border mb-3 ${getCategoryColor(
                            achievement.category
                          )}`}
                        >
                          {achievement.category}
                        </span>
                      )}

                      {/* Progress Bar */}
                      {achievement.progress && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Progress: {achievement.progress.current}/
                              {achievement.progress.required}
                            </span>
                            <span className="font-bold text-emerald-500">
                              {achievement.progress.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${achievement.progress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Unlocked Date */}
                      {achievement.unlocked_at && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                          Unlocked{" "}
                          {new Date(
                            achievement.unlocked_at
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {getFilteredAchievements().length === 0 && (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400">
                  No achievements in this category yet
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">
              Failed to load achievements
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
