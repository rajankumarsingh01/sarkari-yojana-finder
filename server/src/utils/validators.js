import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const eligibilitySchema = z.object({
  age: z.number().int().positive().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  annualIncome: z.number().nonnegative().optional(),
  socialCategory: z.string().optional(),
});