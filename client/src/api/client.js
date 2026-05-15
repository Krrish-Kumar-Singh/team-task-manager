const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return data;
}

export const authApi = {
  signup: (body) => api('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => api('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => api('/auth/me'),
};

export const projectsApi = {
  list: () => api('/projects'),
  get: (id) => api(`/projects/${id}`),
  create: (body) => api('/projects', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/projects/${id}`, { method: 'DELETE' }),
  addMember: (id, body) =>
    api(`/projects/${id}/members`, { method: 'POST', body: JSON.stringify(body) }),
  updateMember: (projectId, memberId, body) =>
    api(`/projects/${projectId}/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  removeMember: (projectId, memberId) =>
    api(`/projects/${projectId}/members/${memberId}`, { method: 'DELETE' }),
};

export const tasksApi = {
  list: (projectId, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/tasks/project/${projectId}${q ? `?${q}` : ''}`);
  },
  create: (projectId, body) =>
    api(`/tasks/project/${projectId}`, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id) => api(`/tasks/${id}`, { method: 'DELETE' }),
};

export const dashboardApi = {
  get: () => api('/dashboard'),
};
