import { z } from "zod";
import { AppError } from "./errorHandler.js";
import {
  CATEGORIES,
  LEVELS,
  SCHEME_STATUSES,
  SCHEME_TYPES,
  STATES,
} from "../constants/enums.js";
import { DISTRICT_SLUGS } from "../constants/districts.js";

// Runs a zod schema and throws a 400 AppError with a readable message.
// (zod 4 keeps problems in error.issues; the old error.errors no longer exists.)
export function parseOrThrow(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0].message, 400);
  }
  return result.data;
}

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// Query string for GET /api/schemes. strict() rejects unknown keys.
export const schemeQuerySchema = z
  .object({
    state: z.enum(STATES, "Invalid state").optional(),
    district: z.enum(DISTRICT_SLUGS, "Invalid district").optional(),
    category: z.enum(CATEGORIES, "Invalid category").optional(),
    status: z.enum(SCHEME_STATUSES, "Invalid status").optional(),
    type: z.enum(SCHEME_TYPES, "Invalid type").optional(),
    level: z.enum(LEVELS, "Invalid level").optional(),
    page: z.coerce.number("page must be a number").int().min(1, "page must be 1 or more").default(1),
    limit: z.coerce
      .number("limit must be a number")
      .int()
      .min(1, "limit must be 1 or more")
      .max(50, "limit cannot be more than 50")
      .default(20),
  })
  .strict();

export const slugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
});