import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────
export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name").max(100),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Missions ──────────────────────────────────────────────
export const createMissionSchema = z.object({
  goal: z.string().min(10, "Describe your goal in at least 10 characters").max(500),
  category: z.string().min(1, "Select a category"),
  desiredOutcome: z.string().max(500).optional(),
  targetDate: z.string().optional(),
  budgetAmount: z.coerce.number().positive().optional(),
  budgetCurrency: z.string().default("INR"),
  weeklyAvailableHours: z.coerce.number().min(1).max(168).optional(),
  constraints: z.string().max(300).optional(),
});

export const editMissionSchema = z.object({
  title: z.string().min(3, "Mission title must be at least 3 characters").max(150),
  description: z.string().min(10).max(1000),
  goal: z.string().min(10).max(500),
  category: z.string().min(1),
  targetDate: z.string().optional(),
  budgetAmount: z.coerce.number().positive().optional(),
  weeklyAvailableHours: z.coerce.number().min(1).max(168).optional(),
});

// ── Tasks ─────────────────────────────────────────────────
export const createTaskSchema = z.object({
  title: z.string().min(3, "Task title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional(),
  missionId: z.string().min(1, "Select a mission"),
  milestoneId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  estimatedDurationMinutes: z.coerce.number().positive().optional(),
});

// ── Memory ────────────────────────────────────────────────
export const createMemorySchema = z.object({
  content: z.string().min(5, "Enter at least 5 characters").max(1000),
  category: z.enum([
    "goal", "preference", "decision", "feedback",
    "achievement", "constraint", "context",
  ]),
  relatedMissionId: z.string().optional(),
  importance: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  tags: z.array(z.string()).default([]),
});

// ── Support ───────────────────────────────────────────────
export const contactSupportSchema = z.object({
  subject: z.string().min(5, "Provide a subject").max(150),
  category: z.enum(["bug", "feature", "billing", "account", "marketplace", "other"]),
  description: z.string().min(20, "Describe the issue in at least 20 characters").max(2000),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  relatedMissionId: z.string().optional(),
  relatedOrderId: z.string().optional(),
});

// ── Profile ───────────────────────────────────────────────
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CreateMissionFormData = z.infer<typeof createMissionSchema>;
export type EditMissionFormData = z.infer<typeof editMissionSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type CreateMemoryFormData = z.infer<typeof createMemorySchema>;
export type ContactSupportFormData = z.infer<typeof contactSupportSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
