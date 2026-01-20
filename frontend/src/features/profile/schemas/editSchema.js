import { z } from 'zod'

export const editSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
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
  // Avatar ID is optional, can be null or a positive integer
  avatar_id: z.number().int().positive().nullable().optional(),
});