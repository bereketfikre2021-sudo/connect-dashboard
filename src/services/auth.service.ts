import api from '@/lib/api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put('/auth/profile', data),
};
