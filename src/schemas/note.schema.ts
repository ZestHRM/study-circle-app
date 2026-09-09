import { z } from "zod";

export const addNoteSchema = z.object({
  subjectId: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val.trim().length > 0, {
      message: "Subject is required.",
    }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Content is required." })
    .max(5000, { message: "Content must be 5000 characters or less." }),
});

export type AddNoteSchemaValues = z.infer<typeof addNoteSchema>;
