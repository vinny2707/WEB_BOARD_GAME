import React, { use } from 'react'
import { Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserProvider';
import { getInitials } from '@/utils/Username';
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
import { useForm, Controller } from 'react-hook-form';
import { User } from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { editSchema } from '../schemas/editSchema';
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import api from '@/api/axios';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [backup, setBackup] = useState({
    full_name: '',
    dob: '',
  });

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

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        dob: user.dob || '',
      });

      setBackup({
        full_name: user.full_name || '',
        dob: user.dob || '',
      });
    }
  }, [user]);

  const handleCancel = () => {
    reset(backup);
  };

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    try {
      const response = await api.put('/api/auth/profile', data);
      toast.success('Profile updated successfully');
      setOpen(false);
      // Optionally update user context or show success message
      console.log('Profile updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <div className="w-full flex-1 p-6 flex justify-center items-start dark:bg-zinc-900/50">
      <div className="w-full bg-zinc-50 border-gray-200 dark:bg-zinc-900/50 dark:border-zinc-800 rounded-2xl p-6 border shadow-lg">
        <div className="flex items-center gap-6">
          {/* Large Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl text-3xl text-white">
            {getInitials(user.username)}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl dark:text-white">{user.username}</h1>
            <span className="text-sm dark:text-zinc-400 text-gray-600">
              {user.email}
            </span>
          </div>

          {/* Edit Button */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="cursor-pointer px-6 py-3 rounded-xl border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
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
                        className="w-full pl-12 pr-4 py-3 dark:bg-zinc-800/50 border-2 dark:border-zinc-700 rounded-xl dark:text-white placeholder-zinc-500 focus:border-emerald-500 outline-none transition-colors"
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
    </div>
  );
}

export default Profile