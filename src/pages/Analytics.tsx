import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { analyticsService } from '@/services/cms.service';
import { AnalyticsStats } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

// ── Inline SVG icons ──────────────────────────────────────────────
const IGlobe  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ICalendar=() => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const IChart  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
const IMail   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IHome   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const IFolder = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const IPen    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const IDoc    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const IPhone  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;

// ── Sparkline bar chart ───────────────────────────────────────────
function Sparkline({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) return <div className="h-24 flex items-end text-xs text-gray-700">No data yet</div>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((d) => (
        <div key={d.day} className="group relative flex-1 flex flex-col justify-end" title={`${d.day}: ${d.count}`}>
          <div
            className="bg-indigo-500 group-hover:bg-indigo-400 rounded-sm transition-all duration-150"
            style={{ height: `${Math.max(4, (d.count / max) * 96)}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function ViewCard({ label, value, Icon, sub }: {
  label: string; value: number; Icon: () => JSX.Element; sub?: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-gray-500"><Icon /></span>
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// ── Top list ──────────────────────────────────────────────────────
function TopList({ title, Icon, items }: {
  title: string; Icon: () => JSX.Element; items: { slug: string | null; views: number }[];
}) {
  if (!items.length) return null;
  const max = items[0]?.views || 1;
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-gray-500"><Icon /></span>
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 truncate max-w-[75%]">{item.slug || '—'}</span>
              <span className="text-xs font-medium text-white tabular-nums">{item.views.toLocaleString()}</span>
            </div>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(item.views / max) * 100}%` }} />
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
            <ViewCard label="Total Views (All Time)" Icon={IGlobe}    value={data.totals.allTime} />
            <ViewCard label="Views Last 30 Days"     Icon={ICalendar} value={data.totals.last30} />
            <ViewCard label="Views Last 7 Days"      Icon={IChart}    value={data.totals.last7} />
            <ViewCard label="Contact Leads"          Icon={IMail}     value={data.leads.total} sub={`${data.leads.new} new`} />
          </div>

          {/* By page */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Views by Page</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <ViewCard label="Home"         Icon={IHome}   value={data.byPage.home} />
              <ViewCard label="Portfolio"    Icon={IFolder} value={data.byPage.portfolio} />
              <ViewCard label="Blog"         Icon={IPen}    value={data.byPage.blog} />
              <ViewCard label="Case Studies" Icon={IDoc}    value={data.byPage.caseStudies} />
              <ViewCard label="Contact"      Icon={IPhone}  value={data.byPage.contact} />
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
                <TopList title="Top Portfolio Projects" Icon={IFolder} items={data.topPortfolio} />
                <TopList title="Top Blog Posts"         Icon={IPen}    items={data.topBlog} />
                <TopList title="Top Case Studies"       Icon={IDoc}    items={data.topCaseStudy} />
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
