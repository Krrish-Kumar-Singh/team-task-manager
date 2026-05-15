import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export async function loadUser(req, _res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!user) return next(new AppError('User not found', 401));
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireProjectMember(req, _res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return next(new AppError('Project ID required', 400));

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: req.userId, projectId },
    },
  });

  if (!membership) {
    return next(new AppError('You are not a member of this project', 403));
  }

  req.membership = membership;
  next();
}

export async function requireProjectAdmin(req, _res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return next(new AppError('Project ID required', 400));

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: req.userId, projectId },
    },
  });

  if (!membership) {
    return next(new AppError('You are not a member of this project', 403));
  }
  if (membership.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403));
  }

  req.membership = membership;
  next();
}
