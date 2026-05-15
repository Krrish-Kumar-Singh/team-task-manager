import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../lib/errors.js';
import { authenticate, requireProjectMember } from '../middleware/auth.js';
import { taskSchema, taskUpdateSchema } from '../validators/schemas.js';

const router = Router();
router.use(authenticate);

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
};

async function validateAssignee(projectId, assigneeId) {
  if (!assigneeId) return;
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: assigneeId, projectId } },
  });
  if (!member) throw new AppError('Assignee must be a project member', 400);
}

router.get(
  '/project/:projectId',
  requireProjectMember,
  asyncHandler(async (req, res) => {
    const { status, assigneeId, overdue } = req.query;
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: {
        projectId: req.params.projectId,
        ...(status && { status }),
        ...(assigneeId && { assigneeId }),
        ...(overdue === 'true' && {
          dueDate: { lt: now },
          status: { not: 'DONE' },
        }),
      },
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ tasks });
  })
);

router.post(
  '/project/:projectId',
  requireProjectMember,
  asyncHandler(async (req, res) => {
    const data = taskSchema.parse(req.body);
    await validateAssignee(req.params.projectId, data.assigneeId);

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? 'TODO',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId ?? null,
        projectId: req.params.projectId,
        creatorId: req.userId,
      },
      include: taskInclude,
    });
    await prisma.project.update({
      where: { id: req.params.projectId },
      data: { updatedAt: new Date() },
    });
    res.status(201).json({ task });
  })
);

router.get(
  '/:taskId',
  asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: { ...taskInclude, project: { select: { id: true, name: true } } },
    });
    if (!task) throw new AppError('Task not found', 404);

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId: task.projectId } },
    });
    if (!membership) throw new AppError('Access denied', 403);

    res.json({ task });
  })
);

router.patch(
  '/:taskId',
  asyncHandler(async (req, res) => {
    const data = taskUpdateSchema.parse(req.body);
    const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!existing) throw new AppError('Task not found', 404);

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId: existing.projectId } },
    });
    if (!membership) throw new AppError('Access denied', 403);

    const isAdmin = membership.role === 'ADMIN';
    const isAssignee = existing.assigneeId === req.userId;
    const isCreator = existing.creatorId === req.userId;
    if (!isAdmin && !isAssignee && !isCreator) {
      throw new AppError('You can only edit tasks you created, are assigned to, or as admin', 403);
    }

    if (data.assigneeId !== undefined) {
      await validateAssignee(existing.projectId, data.assigneeId);
    }

    const task = await prisma.task.update({
      where: { id: req.params.taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      },
      include: taskInclude,
    });
    res.json({ task });
  })
);

router.delete(
  '/:taskId',
  asyncHandler(async (req, res) => {
    const existing = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!existing) throw new AppError('Task not found', 404);

    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.userId, projectId: existing.projectId } },
    });
    if (!membership) throw new AppError('Access denied', 403);
    if (membership.role !== 'ADMIN' && existing.creatorId !== req.userId) {
      throw new AppError('Only admins or task creators can delete tasks', 403);
    }

    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.status(204).send();
  })
);

export default router;
