import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { settingsService } from '@/services/cms.service';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const res = await settingsService.get(); return res.data.data; },
    staleTime: 10 * 60 * 1000,
  });

  const logoUrl = settings?.logo;
  const siteName = settings?.websiteName || 'Connect Digitals';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(email, password);
      setAuth(data.data.admin, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.admin.name}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* Logo — circular if set, fallback to CD */}
          <div className="flex items-center justify-center mb-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-700 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-primary/30">
                CD
              </div>
            )}
          </div>
          <h1 className="text-xl font-semibold text-white">{siteName}</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
