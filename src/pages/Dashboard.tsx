import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { dashboardService, analyticsService } from '@/services/cms.service';
import { DashboardStats, ActivityLogEntry } from '@/types';
import { useAuthStore } from '@/store/authStore';

// ── Inline icons ──────────────────────────────────────────────────
const IFolder   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const IPen      = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const IDoc      = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IImage    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IStar     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;
const IChat     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const IMail     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IChart    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>;

const ENTITY_LABEL: Record<string, string> = {
  portfolio:       'Projects',
  blog:            'Blog',
  hero:            'Hero',
  'case-study':    'Case Study',
  testimonial:     'Testimonial',
  'trusted-brand': 'Partner',
  settings:        'Settings',
  lead:            'Lead',
};
const ENTITY_ROUTE: Record<string, string> = {
  portfolio:       '/portfolio',
  blog:            '/blog',
  hero:            '/hero',
  'case-study':    '/case-studies',
  testimonial:     '/testimonials',
  'trusted-brand': '/trusted-brands',
  settings:        '/settings',
  lead:            '/leads',
};
// Brighter colors that read well on dark bg
const ACTION_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  created:   { label: 'Added',     color: 'text-emerald-400', dot: 'bg-emerald-400' },
  updated:   { label: 'Updated',   color: 'text-sky-400',     dot: 'bg-sky-400'     },
  published: { label: 'Published', color: 'text-violet-400',  dot: 'bg-violet-400'  },
  deleted:   { label: 'Deleted',   color: 'text-rose-400',    dot: 'bg-rose-400'    },
};

function ActivityRow({ item }: { item: ActivityLogEntry }) {
  const navigate = useNavigate();
  const cfg = ACTION_CONFIG[item.action] ?? { label: item.action, color: 'text-gray-400', dot: 'bg-gray-500' };

  return (
    <div
      onClick={() => navigate(ENTITY_ROUTE[item.entity] || '/')}
      className="flex items-center gap-3 py-2 border-b border-gray-800/60 last:border-0 cursor-pointer hover:bg-white/[0.02] -mx-3 px-3 rounded-lg transition-colors"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className={`text-xs font-semibold shrink-0 ${cfg.color}`}>{cfg.label}</span>
        <span className="text-xs text-gray-500 shrink-0">{ENTITY_LABEL[item.entity]}</span>
        {item.entity !== 'settings' && (
          <span className="text-xs text-gray-400 truncate">· {item.title}</span>
        )}
      </div>
      <span className="text-[11px] text-gray-600 shrink-0">
        {new Date(item.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
}

// ── Compact stat card ─────────────────────────────────────────────
function StatCard({ label, Icon, total, published, to }: {
  label: string; Icon: () => JSX.Element; total: number; published: number; to: string;
}) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((published / total) * 100) : 0;
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-150 hover:-translate-y-px"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 group-hover:text-gray-300 transition-colors"><Icon /></span>
        <span className="text-lg font-bold text-white tabular-nums">{total}</span>
      </div>
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-gray-600 mt-1">{published} published</p>
    </button>
  );
}

function SimpleCard({ label, Icon, total, to, badge, sub }: {
  label: string; Icon: () => JSX.Element; total: number; to: string; badge?: number; sub?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-150 hover:-translate-y-px"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 group-hover:text-gray-300 transition-colors"><Icon /></span>
        <div className="flex items-center gap-1.5">
          {badge !== undefined && badge > 0 && (
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">{badge}</span>
          )}
          <span className="text-lg font-bold text-white tabular-nums">{total}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      {sub && <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>}
    </button>
  );
}

export default function Dashboard() {
  const { admin } = useAuthStore();
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => { const res = await dashboardService.getStats(); return res.data.data; },
  });
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => { const res = await analyticsService.getStats(); return res.data.data; },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => { document.title = 'Dashboard · Connect Digitals'; }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {admin?.name}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard  label="Projects"       Icon={IFolder} total={data.counts.portfolioProjects} published={data.published.portfolioProjects} to="/portfolio" />
            <StatCard  label="Blog Posts"     Icon={IPen}    total={data.counts.blogPosts}          published={data.published.blogPosts}         to="/blog" />
            <StatCard  label="Case Studies"   Icon={IDoc}    total={data.counts.caseStudies}        published={data.published.caseStudies}       to="/case-studies" />
            <SimpleCard label="Hero Slides"    Icon={IImage}  total={data.counts.heroSlides}         to="/hero" />
            <SimpleCard label="Trusted Brands" Icon={IStar}   total={data.counts.trustedBrands}      to="/trusted-brands" />
            <SimpleCard label="Testimonials"   Icon={IChat}   total={data.counts.testimonials}       to="/testimonials" />
            <SimpleCard label="New Leads"      Icon={IMail}   total={data.counts.newLeads}            to="/leads" badge={data.counts.newLeads} />
            <SimpleCard label="Analytics"      Icon={IChart}  total={analytics?.totals?.last7 ?? 0}   to="/analytics" sub="views (7d)" />
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-600 py-4 text-center">No activity yet — changes you make will appear here.</p>
            ) : (
              <div>
                {data.recentActivity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
