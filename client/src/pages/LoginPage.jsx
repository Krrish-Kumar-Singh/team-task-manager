import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Input, Card } from '../components/ui.jsx';
import Box from '../components/Box.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex">
      <Box className="hidden lg:flex lg:w-1/2 bg-slate-850 text-white p-12 flex-col justify-between">
        <Box className="flex items-center gap-3">
          <Box className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </Box>
          <span className="text-xl font-semibold">TaskFlow</span>
        </Box>
        <Box>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Manage projects.
            <br />
            Deliver on time.
          </h1>
          <p className="mt-4 text-slate-400 text-lg max-w-md">
            Coordinate your team with role-based access, task assignments, and a clear view of
            what&apos;s overdue.
          </p>
        </Box>
        <p className="text-sm text-slate-500">Professional team workspace</p>
      </Box>

      <Box className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md !p-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your workspace</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </Card>
      </Box>
    </Box>
  );
}
