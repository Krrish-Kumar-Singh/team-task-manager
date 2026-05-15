import { AppError } from '../lib/errors.js';
import { ZodError } from 'zod';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: err.errors.map((e) => e.message).join(', '),
    });
  }
  if (err.message?.includes('Unique constraint')) {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  console.error(err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
