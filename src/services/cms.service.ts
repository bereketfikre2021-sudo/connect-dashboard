import api from '@/lib/api';

// ── Generic helpers ───────────────────────────────────────────────
function formData(data: Record<string, any>, file?: File, fileKey = 'image') {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  });
  if (file) fd.append(fileKey, file);
  return fd;
}

// ── Dashboard ─────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// ── Hero ──────────────────────────────────────────────────────────
export const heroService = {
  getAll: () => api.get('/hero'),
  getById: (id: string) => api.get(`/hero/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/hero', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/hero/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/hero/${id}`),
  reorder: (items: { id: string; displayOrder: number }[]) =>
    api.put('/hero/reorder', { items }),
};

// ── Portfolio ─────────────────────────────────────────────────────
export const portfolioService = {
  getAll: (params?: Record<string, any>) => api.get('/portfolio', { params }),
  getById: (id: string) => api.get(`/portfolio/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/portfolio', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/portfolio/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/portfolio/${id}`),
};

// ── Case Studies ──────────────────────────────────────────────────
export const caseStudyService = {
  getAll: (params?: Record<string, any>) => api.get('/case-studies', { params }),
  getById: (id: string) => api.get(`/case-studies/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/case-studies', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/case-studies/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/case-studies/${id}`),
};

// ── Blog ──────────────────────────────────────────────────────────
export const blogService = {
  getAll: (params?: Record<string, any>) => api.get('/blog', { params }),
  getById: (id: string) => api.get(`/blog/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/blog', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/blog/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/blog/${id}`),
};

// ── Trusted Brands ────────────────────────────────────────────────
export const trustedBrandService = {
  getAll: () => api.get('/trusted-brands'),
  getById: (id: string) => api.get(`/trusted-brands/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/trusted-brands', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/trusted-brands/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/trusted-brands/${id}`),
  reorder: (items: { id: string; displayOrder: number }[]) =>
    api.put('/trusted-brands/reorder', { items }),
};

// ── Testimonials ──────────────────────────────────────────────────
export const testimonialService = {
  getAll: () => api.get('/testimonials'),
  getById: (id: string) => api.get(`/testimonials/${id}`),
  create: (data: Record<string, any>, image?: File) =>
    api.post('/testimonials', formData(data, image)),
  update: (id: string, data: Record<string, any>, image?: File) =>
    api.put(`/testimonials/${id}`, formData(data, image)),
  delete: (id: string) => api.delete(`/testimonials/${id}`),
  reorder: (items: { id: string; displayOrder: number }[]) =>
    api.put('/testimonials/reorder', { items }),
};

// ── Analytics ─────────────────────────────────────────────────────
export const analyticsService = {
  getStats: () => api.get('/analytics/stats'),
};

// ── Contact Leads ─────────────────────────────────────────────────
export const contactService = {
  getAll: (params?: Record<string, any>) => api.get('/contact', { params }),
  getById: (id: string) => api.get(`/contact/${id}`),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/contact/${id}/status`, { status, notes }),
  delete: (id: string) => api.delete(`/contact/${id}`),
  getStats: () => api.get('/contact/stats'),
};

// ── Settings ──────────────────────────────────────────────────────
export const settingsService = {
  get: () => api.get('/settings'),
  update: (data: Record<string, any>, logo?: File, favicon?: File) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    if (logo) fd.append('logo', logo);
    if (favicon) fd.append('favicon', favicon);
    return api.put('/settings', fd);
  },
};
