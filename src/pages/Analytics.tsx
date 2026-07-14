import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { analyticsService } from '@/services/cms.service';
import { AnalyticsStats } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

// ── Sparkline bar chart ───────────────────────────────────────────
function Sparkline({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) return <div className="h-24 flex items-end text-xs text-gray-700">No data yet</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((d) => (
        <div key={d.day} className="group relative flex-1 flex flex-col justify-end" title={`${d.day}: ${d.count}`}>
          <div
            className="bg-primary/60 group-hover:bg-primary rounded-sm transition-all duration-150"
            style={{ height: `${Math.max(4, (d.count / max) * 96)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────
function ViewCard({ label, value, icon, sub }: { label: string; value: number; icon: string; sub?: string }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Top list ───────────────────────────────────────────────────────
function TopList({ title, items }: { title: string; items: { slug: string | null; views: number }[] }) {
  if (!items.length) return null;
  const max = items[0]?.views || 1;
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate max-w-[75%]">{item.slug || '—'}</span>
              <span className="text-xs font-medium text-white tabular-nums">{item.views.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full"
                style={{ width: `${(item.views / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['analytics'],
    queryFn: async () => { const res = await analyticsService.getStats(); return res.data.data; },
    refetchInterval: 60 * 1000,
  });

  useEffect(() => { document.title = 'Analytics · Connect Digitals'; }, []);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Live website traffic — last 30 days" viewUrl="https://web.bereketfikre.et" />

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-28 bg-gray-800/50" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">

          {/* Overview strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ViewCard label="Total Views (All Time)" icon="🌐" value={data.totals.allTime} />
            <ViewCard label="Views Last 30 Days"     icon="📅" value={data.totals.last30} />
            <ViewCard label="Views Last 7 Days"      icon="📈" value={data.totals.last7} />
            <ViewCard label="Contact Leads"          icon="📩" value={data.leads.total} sub={`${data.leads.new} new`} />
          </div>

          {/* By page */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Views by Page</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <ViewCard label="Home"         icon="🏠" value={data.byPage.home} />
              <ViewCard label="Portfolio"    icon="🗂️" value={data.byPage.portfolio} />
              <ViewCard label="Blog"         icon="✍️" value={data.byPage.blog} />
              <ViewCard label="Case Studies" icon="📋" value={data.byPage.caseStudies} />
              <ViewCard label="Contact"      icon="📬" value={data.byPage.contact} />
            </div>
          </div>

          {/* Sparkline */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-300">Daily Views (Last 30 Days)</h2>
              <span className="text-xs text-gray-600">{data.daily.length} days tracked</span>
            </div>
            <Sparkline data={data.daily} />
          </div>

          {/* Top content */}
          {(data.topPortfolio.length > 0 || data.topBlog.length > 0 || data.topCaseStudy.length > 0) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Content</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TopList title="🗂️ Top Portfolio Projects" items={data.topPortfolio} />
                <TopList title="✍️ Top Blog Posts"          items={data.topBlog} />
                <TopList title="📋 Top Case Studies"        items={data.topCaseStudy} />
              </div>
            </div>
          )}

          {!data.totals.allTime && (
            <div className="card text-center py-10">
              <p className="text-gray-500 text-sm">No views tracked yet.</p>
              <p className="text-gray-600 text-xs mt-1">Views will appear here once visitors browse your website.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
