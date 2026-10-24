import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('must be a valid email'));

// Unknown keys such as `role` are stripped, so a client can never choose its own role.
export const registerSchema = z.object({
  email,
  // bcrypt ignores everything past 72 bytes, so longer passwords are rejected rather than truncated.
  password: z
    .string()
    .min(8, 'must be at least 8 characters')
    .max(72, 'must be at most 72 characters'),
  name: z
    .string()
    .trim()
    .min(1, 'must not be empty')
    .max(100, 'must be at most 100 characters')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string().min(1, 'is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
