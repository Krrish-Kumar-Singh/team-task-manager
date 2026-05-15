import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../lib/errors.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projectIds = (
      await prisma.projectMember.findMany({
        where: { userId: req.userId },
        select: { projectId: true },
      })
    ).map((m) => m.projectId);

    if (projectIds.length === 0) {
      return res.json({
        stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
        myTasks: [],
        overdueTasks: [],
        recentProjects: [],
      });
    }

    const now = new Date();
    const [statusGroups, overdueCount, myTasks, overdueTasks, recentProjects] =
      await Promise.all([
        prisma.task.groupBy({
          by: ['status'],
          where: { projectId: { in: projectIds } },
          _count: true,
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            dueDate: { lt: now },
            status: { not: 'DONE' },
          },
        }),
        prisma.task.findMany({
          where: { projectId: { in: projectIds }, assigneeId: req.userId },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 8,
        }),
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
            dueDate: { lt: now },
            status: { not: 'DONE' },
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
        prisma.project.findMany({
          where: { id: { in: projectIds } },
          include: { _count: { select: { tasks: true, members: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    statusGroups.forEach((g) => {
      counts[g.status] = g._count;
    });
    const total = counts.TODO + counts.IN_PROGRESS + counts.DONE;

    res.json({
      stats: {
        total,
        todo: counts.TODO,
        inProgress: counts.IN_PROGRESS,
        done: counts.DONE,
        overdue: overdueCount,
      },
      myTasks,
      overdueTasks,
      recentProjects,
    });
  })
);

export default router;
