import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(1, { message: "Password is required." }),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Full name is required." })
      .max(100, { message: "Name cannot exceed 100 characters." }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required." })
      .email({ message: "Please enter a valid email address." }),
    phone: z
      .string()
      .trim()
      .min(1, { message: "Phone number is required." }),
    institute: z
      .string()
      .trim()
      .min(1, { message: "Institute is required." }),
    level: z.enum(["School", "College", "Coaching", "CompetitiveExams"], {
      message: "Please select an education level.",
    }),
    classOrStandard: z
      .string()
      .trim()
      .min(1, { message: "Class or standard is required." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required." })
      .email({ message: "Please enter a valid email address." }),
    code: z
      .string()
      .trim()
      .min(1, { message: "Verification code is required." }),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
  code: z
    .string()
    .trim()
    .min(1, { message: "Verification code is required." }),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
