import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
];

const Box = 'div';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box className="min-h-screen flex">
      <aside className="w-64 bg-slate-850 text-white flex flex-col shrink-0">
        <Box className="p-6 border-b border-white/10">
          <Box className="flex items-center gap-2.5">
            <Box className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </Box>
            <Box>
              <p className="font-semibold tracking-tight">TaskFlow</p>
              <p className="text-xs text-slate-400">Team workspace</p>
            </Box>
          </Box>
        </Box>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Box className="p-4 border-t border-white/10">
          <Box className="flex items-center gap-3 px-2 mb-3">
            <Box className="w-9 h-9 rounded-full bg-brand-600/30 flex items-center justify-center text-sm font-semibold text-brand-100">
              {user?.name?.charAt(0)?.toUpperCase()}
            </Box>
            <Box className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </Box>
          </Box>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </Box>
      </aside>

      <main className="flex-1 overflow-auto">
        <Box className="max-w-6xl mx-auto p-8">
          <Outlet />
        </Box>
      </main>
    </Box>
  );
}
