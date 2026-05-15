import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().nullable(),
});

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const taskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  dueDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid due date')
    .optional()
    .nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
});

export const taskUpdateSchema = taskSchema.partial();

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ');
    throw new Error(message);
  }
  return result.data;
}
