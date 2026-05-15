import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/errors.js';
import { authenticate, loadUser } from '../middleware/auth.js';
import { signupSchema, loginSchema } from '../validators/schemas.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const data = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { email: data.email, password, name: data.name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = signToken(user.id);
    res.status(201).json({ user, token });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user.id);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token,
    });
  })
);

router.get('/me', authenticate, loadUser, (req, res) => {
  res.json({ user: req.user });
});

export default router;
