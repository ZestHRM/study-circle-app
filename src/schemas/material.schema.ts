import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const step1MaterialSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Please enter a material title." })
    .max(100, { message: "Title must be 100 characters or less." }),
  subjectId: z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val.trim().length > 0, {
      message: "Selecting a subject is required.",
    }),
});


export const pickedFileSchema = z.object({
  uri: z.string().min(1, { message: "Invalid file URI." }),
  name: z.string().min(1, { message: "Invalid file name." }),
  mimeType: z.string(),
  size: z
    .number()
    .nullable()
    .refine((val) => val === null || val <= MAX_FILE_SIZE_BYTES, {
      message: "File size must be under 25 MB.",
    }),
});

export const step2MaterialSchema = z.object({
  file: pickedFileSchema.nullable().refine((file) => file !== null, {
    message: "Please select a PDF document to upload.",
  }),
});

export type Step1MaterialValues = z.infer<typeof step1MaterialSchema>;
export type PickedFileValues = z.infer<typeof pickedFileSchema>;
export type Step2MaterialValues = z.infer<typeof step2MaterialSchema>;
