import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { dashboardService, analyticsService } from '@/services/cms.service';
import { DashboardStats, ActivityLogEntry } from '@/types';
import { useAuthStore } from '@/store/authStore';

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
function StatCard({ label, icon, total, published, to }: {
  label: string; icon: string; total: number; published: number; to: string;
}) {
  const navigate = useNavigate();
  const pct = total > 0 ? Math.round((published / total) * 100) : 0;
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-150 hover:-translate-y-px"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-lg font-bold text-white tabular-nums">{total}</span>
      </div>
      <p className="text-xs font-medium text-gray-400 mb-2">{label}</p>
      {/* Progress bar */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-gray-600 mt-1">{published} published</p>
    </button>
  );
}

function SimpleCard({ label, icon, total, to, badge, sub }: {
  label: string; icon: string; total: number; to: string; badge?: number; sub?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 hover:bg-gray-800/60 transition-all duration-150 hover:-translate-y-px"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
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
            <StatCard  label="Projects"       icon="🗂️" total={data.counts.portfolioProjects} published={data.published.portfolioProjects} to="/portfolio" />
            <StatCard  label="Blog Posts"     icon="✍️" total={data.counts.blogPosts}          published={data.published.blogPosts}         to="/blog" />
            <StatCard  label="Case Studies"   icon="📋" total={data.counts.caseStudies}        published={data.published.caseStudies}       to="/case-studies" />
            <SimpleCard label="Hero Slides"   icon="🖼️" total={data.counts.heroSlides}         to="/hero" />
            <SimpleCard label="Trusted Brands"icon="🏆" total={data.counts.trustedBrands}      to="/trusted-brands" />
            <SimpleCard label="Testimonials"  icon="💬" total={data.counts.testimonials}        to="/testimonials" />
            <SimpleCard label="New Leads"     icon="📩" total={data.counts.newLeads}            to="/leads" badge={data.counts.newLeads} />
            <SimpleCard label="Analytics"     icon="📈" total={analytics?.totals?.last7 ?? 0}   to="/analytics" sub="views (7d)" />
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
