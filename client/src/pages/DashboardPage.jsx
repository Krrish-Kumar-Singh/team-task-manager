import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  FolderKanban,
  ListTodo,
} from 'lucide-react';
import { dashboardApi } from '../api/client.js';
import { Badge, Card } from '../components/ui.jsx';
import Box from '../components/Box.jsx';

const statusBadge = {
  TODO: 'todo',
  IN_PROGRESS: 'progress',
  DONE: 'done',
};

const statusLabel = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="flex items-start gap-4">
      <Box className={`p-2.5 rounded-lg ${accent}`}>
        <Icon className="w-5 h-5" />
      </Box>
      <Box>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </Box>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  const { stats, myTasks, overdueTasks, recentProjects } = data;

  return (
    <Box>
      <Box className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your team&apos;s workload</p>
      </Box>

      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={ListTodo} label="Total tasks" value={stats.total} accent="bg-slate-100 text-slate-600" />
        <StatCard icon={Circle} label="To do" value={stats.todo} accent="bg-slate-100 text-slate-600" />
        <StatCard icon={Clock} label="In progress" value={stats.inProgress} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdue} accent="bg-red-50 text-red-600" />
      </Box>

      <Box className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">My assigned tasks</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks assigned to you yet.</p>
          ) : (
            <ul className="space-y-3">
              {myTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/projects/${task.project.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                  >
                    <Box className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.project.name}</p>
                    </Box>
                    <Badge variant={statusBadge[task.status]}>{statusLabel[task.status]}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue tasks
          </h2>
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing overdue — great work!</p>
          ) : (
            <ul className="space-y-3">
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/projects/${task.project.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg p-3 bg-red-50/50 hover:bg-red-50 transition-colors"
                  >
                    <Box className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{task.title}</p>
                      <p className="text-xs text-red-600">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </Box>
                    <Badge variant="overdue">Overdue</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Box>

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FolderKanban className="w-4 h-4" />
          Recent projects
        </h2>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-slate-500">
            No projects yet.{' '}
            <Link to="/projects" className="text-brand-600 font-medium">
              Create your first project
            </Link>
          </p>
        ) : (
          <Box className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="rounded-lg border border-slate-100 p-4 hover:border-brand-200 hover:shadow-sm transition-all"
              >
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {p._count.tasks} tasks · {p._count.members} members
                </p>
              </Link>
            ))}
          </Box>
        )}
      </Card>
    </Box>
  );
}
