import { z } from 'zod'

export const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(1, "Full name is required"),
    dob: z.date({
      required_error: "Date of birth is required",
      invalid_type_error: "Invalid date",
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });