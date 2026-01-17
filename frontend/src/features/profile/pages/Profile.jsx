import React from "react";
import {
  Edit2,
  Trophy,
  Target,
  Lock,
  CheckCircle2,
  TrendingUp,
  User,
  CalendarIcon,
  Camera,
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
import AvatarPicker from "../components/AvatarPicker";

const Profile = () => {
  const { user, updateUser } = useUser();
  const [open, setOpen] = useState(false);
  const [backup, setBackup] = useState({
    full_name: "",
    dob: "",
    avatar_id: null,
  });
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      full_name: "",
      dob: "",
      avatar_id: null,
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
      const initialData = {
        full_name: user.full_name || "",
        dob: user.dob || "",
        avatar_id: user.avatar_id || null,
      };
      reset(initialData);
      setBackup(initialData);
      setSelectedAvatarId(user.avatar_id || null);
    }
  }, [user, reset]);

  const handleCancel = () => {
    reset(backup);
    setSelectedAvatarId(backup.avatar_id);
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatarId(avatarId);
    setValue("avatar_id", avatarId);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const payload = {
        full_name: data.full_name,
        dob: data.dob,
        avatar_id: selectedAvatarId,
      };
      
      await api.put("/api/auth/profile", payload);
      toast.success("Profile updated successfully!");
      setOpen(false);
      
      // Refresh user data to get updated avatar_url
      await updateUser();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
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

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="w-full flex-1 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center bg-white/50 dark:bg-slate-800/50  rounded-2xl p-8 border border-gray-200 dark:border-slate-700 shadow-lg">
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">Bạn chưa đăng nhập</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Vui lòng đăng nhập để xem profile của bạn
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 p-4 sm:p-6 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="w-full bg-white/50 dark:bg-slate-800/50  border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 border shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Avatar with Image or Initials */}
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl text-2xl sm:text-3xl text-white flex-shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-165"
                />
              ) : (
                getInitials(user?.username)
              )}
            </div>
            {/* Camera overlay on hover */}
            <div 
              onClick={() => setOpen(true)}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">
              {user?.username}
            </h1>
            {user?.full_name && (
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {user.full_name}
              </p>
            )}
            <p className="text-sm dark:text-slate-400 text-gray-500 break-all">
              {user?.email}
            </p>
            {user?.dob && (
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                📅 {new Date(user.dob).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 transition-all flex items-center gap-2 text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-emerald-500/25">
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your avatar and personal information
                  </DialogDescription>
                </DialogHeader>

                {/* Avatar Picker Section */}
                <div className="space-y-4">
                  <AvatarPicker
                    selectedId={selectedAvatarId}
                    onSelect={handleAvatarSelect}
                    currentAvatarUrl={user?.avatar_url}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 dark:border-slate-700" />

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        {...register("full_name")}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
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
                              <button
                                type="button"
                                className="flex justify-between items-center w-full py-3 px-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-left text-slate-900 dark:text-white focus:border-emerald-500 outline-none transition-colors"
                              >
                                {field.value
                                  ? new Date(
                                      field.value + "T00:00:00"
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : <span className="text-slate-400">Pick a date</span>}
                                <CalendarIcon className="w-5 h-5 text-slate-400" />
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dob.message}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <DialogClose asChild>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleCancel}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white transition-all shadow-lg"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="w-full bg-white/50 dark:bg-slate-800/50  border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 border shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">Achievements</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">
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
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700"
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
                      : "bg-slate-100/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {/* Locked Overlay */}
                  {!achievement.is_unlocked &&
                    achievement.progress?.percentage === 0 && (
                      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <Lock className="w-12 h-12 text-slate-400" />
                      </div>
                    )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`text-4xl p-3 rounded-xl ${
                        achievement.is_unlocked
                          ? "bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg"
                          : "bg-slate-300 dark:bg-slate-700"
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
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
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
                            <span className="text-slate-600 dark:text-slate-400">
                              Progress: {achievement.progress.current}/
                              {achievement.progress.required}
                            </span>
                            <span className="font-bold text-emerald-500">
                              {achievement.progress.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
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
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
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
                <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  No achievements in this category yet
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              Failed to load achievements
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
