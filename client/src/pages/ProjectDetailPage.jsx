import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react';
import { projectsApi, tasksApi } from '../api/client.js';
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Textarea,
} from '../components/ui.jsx';
import Box from '../components/Box.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const statusBadge = { TODO: 'todo', IN_PROGRESS: 'progress', DONE: 'done' };
const statusLabel = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };

function isOverdue(task) {
  if (!task.dueDate || task.status === 'DONE') return false;
  return new Date(task.dueDate) < new Date();
}

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [error, setError] = useState('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
    assigneeId: '',
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  const isAdmin = project?.myRole === 'ADMIN';

  const load = useCallback(async () => {
    try {
      const [proj, taskRes] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.list(projectId, filter === 'overdue' ? { overdue: 'true' } : {}),
      ]);
      setProject(proj.project);
      let list = taskRes.tasks;
      if (filter !== 'all' && filter !== 'overdue') {
        list = list.filter((t) => t.status === filter);
      }
      setTasks(list);
    } catch (e) {
      setError(e.message);
    }
  }, [projectId, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await tasksApi.create(projectId, {
        title: taskForm.title,
        description: taskForm.description || null,
        status: taskForm.status,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null,
        assigneeId: taskForm.assigneeId || null,
      });
      setTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    await tasksApi.update(taskId, { status });
    load();
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await tasksApi.delete(taskId);
    load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await projectsApi.addMember(projectId, { email: memberEmail, role: memberRole });
      setMemberModal(false);
      setMemberEmail('');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    await projectsApi.updateMember(projectId, memberId, { role });
    load();
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    await projectsApi.removeMember(projectId, memberId);
    load();
  };

  if (!project) {
    return <p className="text-slate-500">{error || 'Loading project…'}</p>;
  }

  return (
    <Box>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      <Box className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <Box>
          <Box className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge variant={isAdmin ? 'admin' : 'member'}>{project.myRole}</Badge>
          </Box>
          {project.description && (
            <p className="text-slate-500 mt-1 max-w-2xl">{project.description}</p>
          )}
        </Box>
        <Box className="flex gap-2">
          {isAdmin && (
            <Button variant="secondary" onClick={() => setMemberModal(true)}>
              <UserPlus className="w-4 h-4" />
              Add member
            </Button>
          )}
          <Button onClick={() => setTaskModal(true)}>
            <Plus className="w-4 h-4" />
            New task
          </Button>
        </Box>
      </Box>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <Box className="grid lg:grid-cols-3 gap-6">
        <Box className="lg:col-span-2 space-y-4">
          <Box className="flex gap-2 flex-wrap">
            {[
              ['all', 'All'],
              ['TODO', 'To do'],
              ['IN_PROGRESS', 'In progress'],
              ['DONE', 'Done'],
              ['overdue', 'Overdue'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </Box>

          {tasks.length === 0 ? (
            <Card>
              <p className="text-slate-500 text-sm">No tasks match this filter.</p>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="!p-4">
                <Box className="flex items-start justify-between gap-3">
                  <Box className="min-w-0 flex-1">
                    <Box className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-slate-900">{task.title}</h3>
                      <Badge variant={statusBadge[task.status]}>{statusLabel[task.status]}</Badge>
                      {isOverdue(task) && <Badge variant="overdue">Overdue</Badge>}
                    </Box>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                    )}
                    <Box className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      {task.assignee && <span>Assigned to {task.assignee.name}</span>}
                      {task.dueDate && (
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-2 shrink-0">
                    <Select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="!w-auto text-xs"
                    >
                      <option value="TODO">To do</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="DONE">Done</option>
                    </Select>
                    {(isAdmin || task.creator?.id === user?.id) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </Box>
                </Box>
              </Card>
            ))
          )}
        </Box>

        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Team members</h2>
          <ul className="space-y-3">
            {project.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2">
                <Box className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
                </Box>
                {isAdmin ? (
                  <Box className="flex items-center gap-1">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="text-xs border rounded px-1 py-0.5"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Box>
                ) : (
                  <Badge variant={m.role === 'ADMIN' ? 'admin' : 'member'}>{m.role}</Badge>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </Box>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <Select
            label="Status"
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </Select>
          <Input
            label="Due date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <Select
            label="Assignee"
            value={taskForm.assigneeId}
            onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {project.members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </Select>
          <Box className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create task</Button>
          </Box>
        </form>
      </Modal>

      <Modal open={memberModal} onClose={() => setMemberModal(false)} title="Add team member">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input
            label="Member email"
            type="email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <p className="text-xs text-slate-500">User must already have an account.</p>
          <Box className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setMemberModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Add member</Button>
          </Box>
        </form>
      </Modal>
    </Box>
  );
}
