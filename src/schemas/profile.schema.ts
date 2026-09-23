import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name cannot be empty." })
    .max(100, { message: "Name cannot exceed 100 characters." })
    .optional(),
  phone: z
    .string()
    .trim()
    .optional(),
  institute: z
    .string()
    .trim()
    .optional(),
  level: z
    .enum(["School", "College", "Coaching", "CompetitiveExams"], {
      message: "Please select a valid education level.",
    })
    .optional(),
  classOrStandard: z
    .string()
    .trim()
    .optional(),
  city: z
    .string()
    .trim()
    .optional(),
  state: z
    .string()
    .trim()
    .optional(),
  country: z
    .string()
    .trim()
    .optional(),
  zipcode: z
    .string()
    .trim()
    .optional(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
