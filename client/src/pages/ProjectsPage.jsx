import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { projectsApi } from '../api/client.js';
import { Badge, Button, Card, Input, Modal, Textarea } from '../components/ui.jsx';
import Box from '../components/Box.jsx';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    projectsApi
      .list()
      .then((d) => setProjects(d.projects))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await projectsApi.create({ name, description: description || null });
      setModalOpen(false);
      setName('');
      setDescription('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box className="flex items-center justify-between mb-8">
        <Box>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage teams and deliverables</p>
        </Box>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New project
        </Button>
      </Box>

      {loading && <p className="text-slate-500">Loading projects…</p>}
      {error && !modalOpen && <p className="text-red-600">{error}</p>}

      <Box className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="h-full hover:border-brand-200 hover:shadow-md transition-all cursor-pointer">
              <Box className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <Badge variant={p.myRole === 'ADMIN' ? 'admin' : 'member'}>{p.myRole}</Badge>
              </Box>
              {p.description && (
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.description}</p>
              )}
              <Box className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {p.members.length} members
                </span>
                <span>{p._count.tasks} tasks</span>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>

      {!loading && projects.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-slate-500">No projects yet. Create one to get started.</p>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Box className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
          </Box>
        </form>
      </Modal>
    </Box>
  );
}
