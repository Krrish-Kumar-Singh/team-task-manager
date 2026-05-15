import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/errors.js';
import { authenticate, requireProjectMember, requireProjectAdmin } from '../middleware/auth.js';
import { projectSchema, addMemberSchema, updateMemberSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);

const projectInclude = {
  members: {
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  },
  _count: { select: { tasks: true } },
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const enriched = projects.map((p) => ({
      ...p,
      myRole: p.members.find((m) => m.userId === req.userId)?.role,
    }));

    res.json({ projects: enriched });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = projectSchema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        members: {
          create: { userId: req.userId, role: 'ADMIN' },
        },
      },
      include: projectInclude,
    });
    res.status(201).json({ project: { ...project, myRole: 'ADMIN' } });
  })
);

router.get(
  '/:projectId',
  requireProjectMember,
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: projectInclude,
    });
    if (!project) throw new AppError('Project not found', 404);
    res.json({ project: { ...project, myRole: req.membership.role } });
  })
);

router.patch(
  '/:projectId',
  requireProjectAdmin,
  asyncHandler(async (req, res) => {
    const data = projectSchema.partial().parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.projectId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: projectInclude,
    });
    res.json({ project: { ...project, myRole: 'ADMIN' } });
  })
);

router.delete(
  '/:projectId',
  requireProjectAdmin,
  asyncHandler(async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.projectId } });
    res.status(204).send();
  })
);

router.post(
  '/:projectId/members',
  requireProjectAdmin,
  asyncHandler(async (req, res) => {
    const data = addMemberSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('User not found. They must sign up first.', 404);

    const existing = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: req.params.projectId } },
    });
    if (existing) throw new AppError('User is already a project member', 409);

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: req.params.projectId,
        role: data.role,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    res.status(201).json({ member });
  })
);

router.patch(
  '/:projectId/members/:memberId',
  requireProjectAdmin,
  asyncHandler(async (req, res) => {
    const data = updateMemberSchema.parse(req.body);
    const member = await prisma.projectMember.findFirst({
      where: { id: req.params.memberId, projectId: req.params.projectId },
    });
    if (!member) throw new AppError('Member not found', 404);
    if (member.userId === req.userId && data.role !== 'ADMIN') {
      throw new AppError('You cannot demote yourself from admin', 400);
    }

    const updated = await prisma.projectMember.update({
      where: { id: req.params.memberId },
      data: { role: data.role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    res.json({ member: updated });
  })
);

router.delete(
  '/:projectId/members/:memberId',
  requireProjectAdmin,
  asyncHandler(async (req, res) => {
    const member = await prisma.projectMember.findFirst({
      where: { id: req.params.memberId, projectId: req.params.projectId },
    });
    if (!member) throw new AppError('Member not found', 404);
    if (member.userId === req.userId) {
      throw new AppError('Admins cannot remove themselves. Transfer admin first.', 400);
    }
    await prisma.projectMember.delete({ where: { id: req.params.memberId } });
    res.status(204).send();
  })
);

export default router;
