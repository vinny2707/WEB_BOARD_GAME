import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(1, "Full name is required"),
    // Expect dob as a string in format YYYY-MM-DD
    dob: z
      .string({
        required_error: "Date of birth is required",
        invalid_type_error: "Invalid date",
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
      .refine(
        (val) => {
          // Basic validity check for actual calendar date
          const [y, m, d] = val.split("-").map(Number);
          const date = new Date(Date.UTC(y, m - 1, d));
          return (
            !isNaN(date.getTime()) &&
            date.getUTCFullYear() === y &&
            date.getUTCMonth() === m - 1 &&
            date.getUTCDate() === d
          );
        },
        {
          message: "Invalid calendar date",
        }
      ),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
