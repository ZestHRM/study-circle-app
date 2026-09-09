import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Subject name is required." })
    .max(50, { message: "Subject name cannot exceed 50 characters." }),
});

export type CreateSubjectValues = z.infer<typeof createSubjectSchema>;
