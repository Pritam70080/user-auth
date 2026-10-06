import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().trim().min(3).max(50),
  email: z.email().trim(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(1),
});

export const emailSchema = z.object({
  email: z.email().trim(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EmailInput = z.infer<typeof emailSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;