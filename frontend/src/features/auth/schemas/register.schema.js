import { z } from "zod";

// Helpers
const usernameRegex = /^[a-zA-Z0-9_]+$/; // letters, numbers, underscore
// Supports Vietnamese characters, spaces, hyphens, apostrophes
const nameRegex = /^[\p{L}\s'-]+$/u;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(usernameRegex, "Username can contain letters, numbers, and underscores only"),

    email: z.string().trim().toLowerCase().email("Invalid email address"),

    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be at most 50 characters")
      .regex(nameRegex, "Full name can include letters, spaces, hyphens, and apostrophes only"),

    // Expect dob as a string in format YYYY-MM-DD
    dob: z
      .string({
        required_error: "Date of birth is required",
        invalid_type_error: "Invalid date",
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .refine((val) => {
        // Basic validity check for actual calendar date
        const [y, m, d] = val.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        return (
          !isNaN(date.getTime()) &&
          date.getUTCFullYear() === y &&
          date.getUTCMonth() === m - 1 &&
          date.getUTCDate() === d
        );
      }, { message: "Invalid calendar date" })
      .refine((val) => {
        // Age must be at least 13 and less than 120
        const [y, m, d] = val.split("-").map(Number);
        const birth = new Date(y, m - 1, d);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const mDiff = today.getMonth() - birth.getMonth();
        if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age >= 13 && age <= 120;
      }, { message: "You must be at least 13 years old" }),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be at most 128 characters"),

    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
