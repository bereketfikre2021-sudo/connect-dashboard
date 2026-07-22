import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { settingsService } from '@/services/cms.service';
import { Settings as SettingsType } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ImageUpload from '@/components/ui/ImageUpload';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const AVATAR_KEY = 'cd-admin-avatar';

const TABS = [
  { id: 'general',    label: 'General',    icon: 'globe'    },
  { id: 'seo',        label: 'SEO',        icon: 'search'   },
  { id: 'social',     label: 'Social',     icon: 'share'    },
  { id: 'cloudinary', label: 'Cloudinary', icon: 'cloud'    },
  { id: 'security',   label: 'Security',   icon: 'lock'     },
  { id: 'account',    label: 'Account',    icon: 'user'     },
  { id: 'appearance', label: 'Appearance', icon: 'swatch'   },
] as const;

type TabId = typeof TABS[number]['id'];

const TAB_ICON_PATHS: Record<string, string> = {
  globe:  'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  search: 'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  share:  'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  cloud:  'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
  lock:   'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  user:   'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  swatch: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
};

export default function Settings() {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const { admin, setAuth, accessToken } = useAuthStore();
  const [avatarUrl, setAvatarUrl] = useState<string>(() => localStorage.getItem(AVATAR_KEY) || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const getInitialTab = (): TabId => {
    const t = searchParams.get('tab');
    if (t === 'profile') return 'account';
    return (TABS.find(tab => tab.id === t)?.id) || 'general';
  };
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab());

  const { data: settings, isLoading } = useQuery<SettingsType>({
    queryKey: ['settings'],
    queryFn: async () => { const res = await settingsService.get(); return res.data.data; },
  });

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<any>({ values: settings || {} });
  const { register: regAccount, handleSubmit: handleAccount, formState: { isSubmitting: accountSaving } } = useForm<any>({
    defaultValues: {
      name:  admin?.name  || '',
      email: admin?.email || '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => settingsService.update(data, logoFile || undefined, faviconFile || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
      setLogoFile(null);
      setFaviconFile(null);
    },
    onError: () => toast.error('Failed to save'),
  });

  const onSubmit = (data: any) => saveMutation.mutate(data);

  const onAccountSubmit = async (data: any) => {
    try {
      // Only send fields that have values — don't send empty password
      const payload: any = {};
      if (data.name?.trim())     payload.name     = data.name.trim();
      if (data.email?.trim())    payload.email    = data.email.trim();
      if (data.password?.trim()) payload.password = data.password.trim();

      // Nothing changed — skip the API call
      if (Object.keys(payload).length === 0) {
        toast.success('Nothing to update');
        return;
      }

      const updated = await authService.updateProfile(payload);
      if (admin && accessToken) setAuth({ ...admin, ...updated.data?.data }, accessToken);
      toast.success('Account updated');
    } catch {
      toast.error('Failed to update account');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2 MB'); return; }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setAvatarUrl(url);
      localStorage.setItem(AVATAR_KEY, url);
      // Notify UserMenu in the same tab
      window.dispatchEvent(new Event('storage'));
      toast.success('Profile photo updated');
      setAvatarUploading(false);
    };
    reader.onerror = () => { toast.error('Failed to read file'); setAvatarUploading(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAvatar = () => {
    setAvatarUrl('');
    localStorage.removeItem(AVATAR_KEY);
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => { document.title = 'Settings · Connect Digitals'; }, []);

  if (isLoading) return <div className="text-gray-500 text-sm">Loading settings…</div>;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your website and account configuration" viewUrl="https://web.bereketfikre.et" />

      {/* Tab nav — horizontal scroll on mobile, vertical sidebar on desktop */}
      <div className="flex gap-6 flex-col sm:flex-row">
        <nav className="sm:w-44 sm:shrink-0">
          <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-2.5 w-auto sm:w-full px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 text-left shrink-0 sm:shrink ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-white border border-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICON_PATHS[tab.icon]} />
                </svg>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-2xl">

          {/* ── General ── */}
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">General Settings</h2>
                <div>
                  <label className="label">Website Name</label>
                  <input {...register('websiteName')} className="input" placeholder="Connect Digitals" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Email</label>
                    <input {...register('contactEmail')} type="email" className="input" />
                  </div>
                  <div>
                    <label className="label">Contact Phone</label>
                    <input {...register('contactPhone')} className="input" placeholder="+251 9xx xxx xxx" />
                  </div>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ImageUpload label="Logo" currentUrl={settings?.logo} onChange={setLogoFile} circle />
                  <ImageUpload label="Favicon" currentUrl={settings?.favicon} onChange={setFaviconFile} accept="image/png,image/ico,image/x-icon,image/svg+xml" circle />
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Brand Copy</p>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Tagline</label>
                      <input {...register('tagline')} className="input" placeholder="Connect. Create. Captivate." />
                      <p className="text-xs text-gray-600 mt-1">Shown as the hero headline on your website</p>
                    </div>
                    <div>
                      <label className="label">Slogan</label>
                      <textarea {...register('slogan')} className="input" rows={2} placeholder="We connect your vision, create powerful brands, and captivate your audience." />
                      <p className="text-xs text-gray-600 mt-1">Shown as the sub-heading below the tagline</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Hero Stats</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Projects Completed</label>
                      <input {...register('statProjects', { valueAsNumber: true })} type="number" className="input" placeholder="150" min={0} />
                    </div>
                    <div>
                      <label className="label">Client Satisfaction %</label>
                      <input {...register('statSatisfaction', { valueAsNumber: true })} type="number" className="input" placeholder="98" min={0} max={100} />
                    </div>
                    <div>
                      <label className="label">Years Experience</label>
                      <input {...register('statExperience', { valueAsNumber: true })} type="number" className="input" placeholder="5" min={0} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">These numbers animate on your homepage hero section</p>
                </div>
              </div>
              <SaveButton saving={isSubmitting || saveMutation.isPending} />
            </form>
          )}

          {/* ── SEO ── */}
          {activeTab === 'seo' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Search Engine Optimisation</h2>
                <div>
                  <label className="label">SEO Title</label>
                  <input {...register('seoTitle')} className="input" placeholder="Connect Digitals | Creative Design Agency" />
                  <p className="text-xs text-gray-600 mt-1">Shown in browser tabs and search results</p>
                </div>
                <div>
                  <label className="label">SEO Description</label>
                  <textarea {...register('seoDescription')} className="input" rows={3} placeholder="Brief description of your agency…" />
                  <p className="text-xs text-gray-600 mt-1">160 characters recommended</p>
                </div>
                <div>
                  <label className="label">SEO Keywords</label>
                  <input {...register('seoKeywords')} className="input" placeholder="graphic design, branding, Ethiopia, logo design" />
                  <p className="text-xs text-gray-600 mt-1">Comma separated</p>
                </div>
              </div>

              {/* Sitemap & Robots card */}
              <div className="card space-y-1">
                <h3 className="text-sm font-semibold text-white mb-0.5">Sitemap &amp; Robots</h3>
                <p className="text-xs text-gray-500 mb-3">Static files are deployed with the frontend build.</p>
                {[
                  {
                    label: 'Sitemap',
                    value: '/sitemap.xml',
                    href: 'https://web.bereketfikre.et/sitemap.xml',
                    mono: true,
                  },
                  {
                    label: 'Robots.txt',
                    value: '/robots.txt',
                    href: 'https://web.bereketfikre.et/robots.txt',
                    mono: true,
                  },
                  {
                    label: 'OG Image',
                    value: '/og-image.png (auto-generated on build)',
                    href: 'https://web.bereketfikre.et/og-image.png',
                    mono: false,
                  },
                ].map(({ label, value, href, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs text-gray-300 hover:text-primary transition-colors ${mono ? 'font-mono' : 'font-semibold'}`}
                    >
                      {value}
                    </a>
                  </div>
                ))}
              </div>

              {/* Google Analytics card */}
              <div className="card space-y-1">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-semibold text-white">Google Analytics 4</h3>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Active in production
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Tracking is enabled only in production builds. No data is collected during local development.</p>
                {[
                  { label: 'Measurement ID',   value: 'G-QJLP3X6KT3', mono: true  },
                  { label: 'Integration',      value: 'react-ga4 v2.1.0', mono: true  },
                  { label: 'Page Views',       value: 'Auto-tracked on every route', mono: false },
                  { label: 'Custom Events',    value: 'Portfolio, Services, Contact, CTA', mono: false },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className={`text-xs text-gray-300 ${mono ? 'font-mono' : ''}`}>{value}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-3">
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    Open GA4 Dashboard
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span className="text-gray-700">·</span>
                  <a
                    href="https://analytics.google.com/analytics/web/#/p/debugView"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary hover:underline transition-colors"
                  >
                    DebugView
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              <SaveButton saving={isSubmitting || saveMutation.isPending} />
            </form>
          )}

          {/* ── Social ── */}
          {activeTab === 'social' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Social Media Links</h2>
                {[
                  { key: 'socialFacebook',  label: 'Facebook',  placeholder: 'https://facebook.com/yourpage' },
                  { key: 'socialInstagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
                  { key: 'socialTwitter',   label: 'X / Twitter', placeholder: 'https://x.com/yourhandle' },
                  { key: 'socialLinkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/company/yourcompany' },
                  { key: 'socialWhatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/251923988838' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input {...register(key as any)} className="input" placeholder={placeholder} />
                  </div>
                ))}
              </div>
              <SaveButton saving={isSubmitting || saveMutation.isPending} />
            </form>
          )}

          {/* ── Cloudinary ── */}
          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Cloudinary — Image Storage</h2>
                <p className="text-sm text-gray-400">Your Cloudinary credentials are stored as environment variables on the server. To update them, change the values in your Render environment settings.</p>
                <div className="bg-gray-800/60 rounded-lg p-4 space-y-3">
                  {[
                    { label: 'CLOUDINARY_CLOUD_NAME', value: 'gmkts6ct' },
                    { label: 'CLOUDINARY_API_KEY',    value: '851193657133282' },
                    { label: 'CLOUDINARY_API_SECRET', value: '••••••••••••••••••••••' },
                    { label: 'CLOUDINARY_FOLDER',     value: 'connect-digitals' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-gray-500">{label}</span>
                      <span className="text-xs font-mono text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="https://console.cloudinary.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Open Cloudinary Console →
                </a>
              </div>

              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-white">Storage Tips</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  {[
                    'Images are auto-optimised on upload',
                    'Old images are deleted when replaced',
                    'Max file size: 10 MB',
                    'Supported: JPG, PNG, WebP, SVG, ICO',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Security Overview</h2>
                <div className="space-y-3">
                  {[
                    { label: 'JWT Access Token Expiry',  value: '15 minutes',  ok: true },
                    { label: 'JWT Refresh Token Expiry', value: '7 days',      ok: true },
                    { label: 'Auth Rate Limit',          value: '10 attempts / 15 min', ok: true },
                    { label: 'Global Rate Limit',        value: '100 req / 15 min',     ok: true },
                    { label: 'CORS Restriction',         value: 'Allowed origins only', ok: true },
                    { label: 'Helmet Security Headers',  value: 'Enabled',     ok: true },
                    { label: 'Input Validation',         value: 'All endpoints', ok: true },
                    { label: 'XSS Protection',           value: 'Enabled',     ok: true },
                  ].map(({ label, value, ok }) => (
                    <div key={label} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-800 last:border-0">
                      <span className="text-sm text-gray-400">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{value}</span>
                        {ok && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Environment Variables</h3>
                <p className="text-sm text-gray-400 mb-3">Security-sensitive values (JWT secrets, API keys) are stored as Render environment variables — not in the codebase.</p>
                <a
                  href="https://dashboard.render.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Manage on Render →
                </a>
              </div>
            </div>
          )}

          {/* ── Account ── */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccount(onAccountSubmit)} className="space-y-6">
              {/* Profile photo */}
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Profile Photo</h2>
                <div className="flex items-center gap-5">
                  {/* Avatar preview */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    {avatarUploading && (
                      <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
                    <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}
                      className="btn-ghost text-xs px-3 py-1.5">
                      {avatarUploading ? 'Uploading…' : 'Upload photo'}
                    </button>
                    {avatarUrl && (
                      <button type="button" onClick={removeAvatar} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
                        Remove photo
                      </button>
                    )}
                    <p className="text-xs text-gray-600">PNG, JPG or WebP. Max 5 MB.</p>
                  </div>
                </div>
              </div>

              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Admin Account</h2>
                <div>
                  <label className="label">Name</label>
                  <input {...regAccount('name')} className="input" placeholder="Your name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input {...regAccount('email')} type="email" className="input" placeholder="admin@example.com" />
                </div>
              </div>

              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Change Password</h2>
                <div>
                  <label className="label">New Password</label>
                  <input {...regAccount('password')} type="password" className="input" placeholder="Min. 8 characters" />
                  <p className="text-xs text-gray-600 mt-1">Leave blank to keep your current password</p>
                </div>
              </div>

              <button type="submit" disabled={accountSaving} className="btn-primary px-8">
                {accountSaving ? 'Saving…' : 'Update Account'}
              </button>
            </form>
          )}

          {/* ── Appearance ── */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="card space-y-4">
                <h2 className="text-sm font-semibold text-white mb-1">Appearance</h2>
                <p className="text-sm text-gray-400">The dashboard uses a dark theme by default. Additional theme options are planned for a future update.</p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Dark',   active: true,  preview: 'bg-gray-950 border-primary' },
                    { label: 'Light',  active: false, preview: 'bg-gray-100 border-gray-300 opacity-40' },
                    { label: 'System', active: false, preview: 'bg-gradient-to-br from-gray-950 to-gray-100 border-gray-500 opacity-40' },
                  ].map(({ label, active, preview }) => (
                    <div key={label} className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${active ? 'border-primary' : 'border-gray-700'}`}>
                      <div className={`h-16 ${preview}`} />
                      <div className="px-3 py-2 bg-gray-900 border-t border-gray-800">
                        <p className="text-xs font-medium text-gray-300">{label}</p>
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {!active && <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs text-gray-500 bg-gray-900/80 px-2 py-1 rounded">Soon</span></div>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-white">Brand Color</h3>
                <p className="text-sm text-gray-400">The primary accent color used throughout the dashboard.</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary border border-primary/50" />
                  <span className="text-sm font-mono text-gray-400">#e63946 — Connect Red</span>
                </div>
                <p className="text-xs text-gray-600">To change the brand color, update the <code className="bg-gray-800 px-1 rounded text-xs">primary</code> value in <code className="bg-gray-800 px-1 rounded text-xs">tailwind.config.ts</code></p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function SaveButton({ saving }: { saving: boolean }) {
  return (
    <button type="submit" disabled={saving} className="btn-primary px-8">
      {saving ? 'Saving…' : 'Save Changes'}
    </button>
  );
}
