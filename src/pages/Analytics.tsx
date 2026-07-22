import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { analyticsService } from '@/services/cms.service';
import { AnalyticsStats } from '@/types';
import PageHeader from '@/components/ui/PageHeader';

// ── Icons ─────────────────────────────────────────────────────────
const IUsers   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IEye     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IClock   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>;
const IGlobe   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IChart   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>;
const IMail    = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IFolder  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const IPen     = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const IPhone   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>;
const IDownload= () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>;

// ── Reusable Components ───────────────────────────────────────────
function StatCard({ label, value, sub, Icon, accent = 'indigo' }: {
  label: string; value: string | number; sub?: string; Icon: () => JSX.Element; accent?: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'text-indigo-400', green: 'text-green-400', orange: 'text-orange-400',
    rose: 'text-rose-400', sky: 'text-sky-400', violet: 'text-violet-400', yellow: 'text-yellow-400',
  };
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <span className={colors[accent] ?? 'text-indigo-400'}><Icon /></span>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function BarList({ title, items, labelKey, valueKey, Icon, color = 'bg-indigo-500' }: {
  title: string; items: any[]; labelKey: string; valueKey: string;
  Icon: () => JSX.Element; color?: string;
}) {
  if (!items?.length) return null;
  const max = Math.max(...items.map(i => i[valueKey]), 1);
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
              <span className="text-xs text-gray-400 truncate max-w-[75%]">{item[labelKey] || '—'}</span>
              <span className="text-xs font-medium text-white tabular-nums">{(item[valueKey] as number).toLocaleString()}</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${(item[valueKey] / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ data, labelKey = 'day', valueKey = 'count' }: {
  data: any[]; labelKey?: string; valueKey?: string;
}) {
  if (!data?.length) return <div className="h-20 flex items-end text-xs text-gray-700">No data yet</div>;
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="group relative flex-1 flex flex-col justify-end" title={`${d[labelKey]}: ${d[valueKey]}`}>
          <div className="bg-indigo-500 group-hover:bg-indigo-400 rounded-sm transition-all"
            style={{ height: `${Math.max(2, (d[valueKey] / max) * 80)}px` }} />
        </div>
      ))}
    </div>
  );
}

function timeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60); const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const TABS = ['Overview', 'Visitors', 'Content', 'Conversions', 'Live'] as const;
type Tab = typeof TABS[number];

// ── GA4 Panel (collapsible) ───────────────────────────────────────
function GA4Panel() {
  const [open, setOpen] = useState(false);
  const { data: ga4Raw, isLoading, error } = useQuery<any>({
    queryKey: ['ga4'],
    queryFn: async () => { const res = await analyticsService.getGA4(); return res.data.data; },
    refetchInterval: 5 * 60 * 1000, retry: 1,
  });
  const ga4 = ga4Raw as any;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-[#F9AB00]/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#F9AB00]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white">Google Analytics 4</span>
          {!isLoading && !error && <span className="flex items-center gap-1 text-xs text-green-400"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>Live</span>}
          {error && <span className="text-xs text-rose-400">Unavailable</span>}
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-800">
          {isLoading ? <div className="py-6 text-center text-sm text-gray-500">Loading GA4 data…</div>
          : error ? <div className="py-6 text-center text-sm text-rose-400">Failed to load. Enable the Analytics Data API in Google Cloud Console.</div>
          : ga4 ? (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[{ label: 'Today', data: ga4.today }, { label: 'This Week', data: ga4.week }, { label: 'This Month', data: ga4.month }].map(({ label, data }) => (
                  <div key={label} className="bg-gray-800/60 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
                    <div className="grid grid-cols-2 gap-y-2">
                      <div><p className="text-lg font-bold text-white">{data?.users?.toLocaleString() ?? '—'}</p><p className="text-xs text-gray-500">Users</p></div>
                      <div><p className="text-lg font-bold text-white">{data?.pageViews?.toLocaleString() ?? '—'}</p><p className="text-xs text-gray-500">Page Views</p></div>
                      <div><p className="text-sm font-bold text-white">{data?.bounceRate != null ? `${(data.bounceRate*100).toFixed(1)}%` : '—'}</p><p className="text-xs text-gray-500">Bounce</p></div>
                      <div><p className="text-sm font-bold text-white">{data?.avgSessionDuration != null ? fmtDuration(data.avgSessionDuration) : '—'}</p><p className="text-xs text-gray-500">Avg Session</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <BarList title="Traffic Sources" items={ga4.trafficSources ?? []} labelKey="source" valueKey="sessions" Icon={IChart} />
                <BarList title="Countries" items={ga4.countries ?? []} labelKey="country" valueKey="users" Icon={IGlobe} />
                <BarList title="Devices" items={ga4.devices ?? []} labelKey="device" valueKey="sessions" Icon={IPhone} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────
function OverviewTab({ d }: { d: any }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Visitors"   value={d.visitors.total.toLocaleString()}            Icon={IUsers}    accent="indigo" />
        <StatCard label="Active Now"       value={d.visitors.active}                            Icon={IEye}      accent="green"  sub="last 5 min" />
        <StatCard label="Bounce Rate"      value={`${d.sessions.bounceRate}%`}                  Icon={IChart}    accent="orange" />
        <StatCard label="Avg Session"      value={fmtDuration(d.sessions.avgDuration)}          Icon={IClock}    accent="sky" />
        <StatCard label="Total Sessions"   value={d.sessions.total.toLocaleString()}            Icon={IChart}    accent="violet" />
        <StatCard label="Returning"        value={`${d.visitors.returningPct}%`}                Icon={IUsers}    accent="yellow" sub={`${d.visitors.returning} returning`} />
        <StatCard label="Contact Forms"    value={d.conversions.contactForm.toLocaleString()}   Icon={IMail}     accent="green"  />
        <StatCard label="CV Downloads"     value={d.conversions.cvDownload.toLocaleString()}    Icon={IDownload} accent="sky"    />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Visitors — Last 30 Days</h3>
          <span className="text-xs text-gray-600">{d.daily.length} days</span>
        </div>
        <Sparkline data={d.daily} labelKey="day" valueKey="count" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <BarList title="Traffic Sources" items={d.sources}  labelKey="name" valueKey="count" Icon={IChart}  color="bg-indigo-500" />
        <BarList title="Devices"         items={d.devices}  labelKey="name" valueKey="count" Icon={IPhone}  color="bg-sky-500" />
        <BarList title="Browsers"        items={d.browsers} labelKey="name" valueKey="count" Icon={IEye}    color="bg-violet-500" />
      </div>
    </div>
  );
}

// ── Visitors Tab ──────────────────────────────────────────────────
function VisitorsTab({ d }: { d: any }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today"      value={d.visitors.today}     Icon={IUsers} accent="green"  />
        <StatCard label="This Week"  value={d.visitors.thisWeek}  Icon={IUsers} accent="indigo" />
        <StatCard label="This Month" value={d.visitors.thisMonth} Icon={IUsers} accent="sky"    />
        <StatCard label="Returning"  value={`${d.visitors.returningPct}%`} Icon={IUsers} accent="yellow" />
      </div>
      <BarList title="Top Countries" items={d.countries} labelKey="name" valueKey="count" Icon={IGlobe} color="bg-emerald-500" />
      <div className="card overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Visitors</h3>
        <table className="w-full text-xs">
          <thead><tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left pb-2">Country</th>
            <th className="text-left pb-2">Device</th>
            <th className="text-left pb-2">Browser</th>
            <th className="text-left pb-2">OS</th>
            <th className="text-right pb-2">Last Seen</th>
          </tr></thead>
          <tbody>
            {d.recentVisitors.map((v: any) => (
              <tr key={v.id} className="border-b border-gray-800/40 last:border-0">
                <td className="py-2 text-gray-300">{v.country || '—'}</td>
                <td className="py-2 text-gray-400">{v.device || '—'}</td>
                <td className="py-2 text-gray-400">{v.browser || '—'}</td>
                <td className="py-2 text-gray-400">{v.os || '—'}</td>
                <td className="py-2 text-gray-600 text-right">{timeAgo(v.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Content Tab ───────────────────────────────────────────────────
function ContentTab({ d }: { d: any }) {
  const sectionMax = Math.max(...(d.sections || []).map((s: any) => s.views), 1);
  return (
    <div className="space-y-5">
      {d.sections?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Section Engagement</h3>
          <div className="space-y-3">
            {d.sections.sort((a: any, b: any) => b.views - a.views).map((s: any) => (
              <div key={s.section} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300 capitalize">{s.section}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{s.views} views</span>
                    <span>{s.uniqueViews} unique</span>
                    {s.avgDuration > 0 && <span>{fmtDuration(s.avgDuration)}</span>}
                    {s.avgScrollPct > 0 && <span>{s.avgScrollPct}% scroll</span>}
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(s.views / sectionMax) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {d.topProjects?.length > 0 && (
          <div className="card overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Projects</h3>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-gray-800"><th className="text-left pb-2">Project</th><th className="text-right pb-2">Clicks</th></tr></thead>
              <tbody>{d.topProjects.map((p: any) => (
                <tr key={p.name} className="border-b border-gray-800/40 last:border-0">
                  <td className="py-2 text-gray-300 truncate max-w-[180px]">{p.name}</td>
                  <td className="py-2 text-white text-right font-medium">{p.clicks}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        {d.topServices?.length > 0 && (
          <div className="card overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Services</h3>
            <table className="w-full text-xs">
              <thead><tr className="text-gray-500 border-b border-gray-800"><th className="text-left pb-2">Service</th><th className="text-right pb-2">Clicks</th></tr></thead>
              <tbody>{d.topServices.map((s: any) => (
                <tr key={s.name} className="border-b border-gray-800/40 last:border-0">
                  <td className="py-2 text-gray-300 truncate max-w-[180px]">{s.name}</td>
                  <td className="py-2 text-white text-right font-medium">{s.clicks}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {d.topBlog?.length > 0 && (
        <BarList title="Top Blog Posts" items={d.topBlog} labelKey="slug" valueKey="views" Icon={IPen} color="bg-violet-500" />
      )}
    </div>
  );
}

// ── Conversions Tab ───────────────────────────────────────────────
function ConversionsTab({ d }: { d: any }) {
  const total = d.visitors.total || 1;
  const items = [
    { label: 'Contact Form Submissions', count: d.conversions.contactForm,    Icon: IMail,     color: 'text-green-400',  bg: 'bg-green-500' },
    { label: 'CV Downloads',             count: d.conversions.cvDownload,     Icon: IDownload, color: 'text-sky-400',    bg: 'bg-sky-500' },
    { label: 'Email Clicks',             count: d.conversions.emailClick,     Icon: IMail,     color: 'text-indigo-400', bg: 'bg-indigo-500' },
    { label: 'Phone / WhatsApp Clicks',  count: d.conversions.phoneClick,     Icon: IPhone,    color: 'text-yellow-400', bg: 'bg-yellow-500' },
    { label: 'Social Media Clicks',      count: d.conversions.socialClick,    Icon: IUsers,    color: 'text-pink-400',   bg: 'bg-pink-500' },
    { label: 'CTA Button Clicks',        count: d.conversions.ctaClick,       Icon: IChart,    color: 'text-violet-400', bg: 'bg-violet-500' },
    { label: 'Portfolio Clicks',         count: d.conversions.portfolioClick, Icon: IFolder,   color: 'text-orange-400', bg: 'bg-orange-500' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ label, count, Icon, color, bg }) => {
        const rate = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        return (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className={color}><Icon /></span>
              <span className="text-xs text-gray-500">{rate}% rate</span>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{count.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden mt-3">
              <div className={`h-full ${bg} rounded-full`} style={{ width: `${Math.min(parseFloat(rate) * 10, 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Live Tab ──────────────────────────────────────────────────────
function LiveTab() {
  const { data: liveRaw, isLoading } = useQuery<any>({
    queryKey: ['analytics-live'],
    queryFn: async () => { const res = await analyticsService.getLive(); return res.data.data; },
    refetchInterval: 10 * 1000,
  });
  const live = liveRaw as any;

  const EVENT_COLORS: Record<string, string> = {
    section_view:    'text-indigo-400',
    project_click:   'text-sky-400',
    service_click:   'text-violet-400',
    cta_click:       'text-yellow-400',
    contact_submit:  'text-green-400',
    cv_download:     'text-emerald-400',
    social_click:    'text-pink-400',
    email_click:     'text-blue-400',
    phone_click:     'text-orange-400',
  };

  return (
    <div className="space-y-5">
      <div className="card text-center py-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
          <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-green-500/20" />
          <span className="relative text-4xl font-bold text-white tabular-nums">
            {isLoading ? '…' : (live?.activeVisitors ?? 0)}
          </span>
        </div>
        <p className="text-sm text-gray-400">Active visitors right now</p>
        <p className="text-xs text-gray-600 mt-1">Updated every 10 seconds</p>
      </div>

      {live?.latestVisitor && (
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Latest Visitor</h3>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <IUsers />
            </div>
            <div>
              <p className="text-sm text-white">{live.latestVisitor.country || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{live.latestVisitor.device} · {live.latestVisitor.browser} · {timeAgo(live.latestVisitor.lastSeen)}</p>
            </div>
          </div>
        </div>
      )}

      {live?.recentEvents?.length > 0 && (
        <div className="card">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {live.recentEvents.map((e: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-800/40 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${(EVENT_COLORS[e.type] || 'text-gray-400').replace('text-', 'bg-')}`} />
                  <span className={`text-xs font-mono ${EVENT_COLORS[e.type] || 'text-gray-400'}`}>{e.type}</span>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-300 truncate max-w-[160px]">{e.name}</span>
                </div>
                <span className="text-xs text-gray-600 shrink-0">{timeAgo(e.recordedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Analytics() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const { data: fullRaw, isLoading: fullLoading, error: fullError } = useQuery<any>({
    queryKey: ['analytics-full'],
    queryFn: async () => { const res = await analyticsService.getFull(); return res.data.data; },
    refetchInterval: 2 * 60 * 1000,
  });

  // Legacy stats (used as fallback when full analytics is empty)
  const { data: backendData } = useQuery<AnalyticsStats>({
    queryKey: ['analytics'],
    queryFn: async () => { const res = await analyticsService.getStats(); return res.data.data; },
    refetchInterval: 60 * 1000,
  });

  useEffect(() => { document.title = 'Analytics · Connect Digitals'; }, []);

  const full = fullRaw as any;
  const hasData = full && full.visitors?.total >= 0;

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Self-hosted visitor & engagement data" viewUrl="https://web.bereketfikre.et" />

      {/* GA4 collapsible panel */}
      <GA4Panel />

      {/* Self-hosted analytics */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Self-Hosted Analytics
          </h2>
          <span className="text-xs text-gray-600">PostgreSQL · real-time</span>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {fullLoading && activeTab !== 'Live' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-24 bg-gray-800/50" />
            ))}
          </div>
        )}

        {/* No data yet */}
        {!fullLoading && !fullError && hasData && full.visitors.total === 0 && activeTab !== 'Live' && (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-sm font-medium">No visitor data yet</p>
            <p className="text-gray-600 text-xs mt-1">Data will appear here once visitors browse your website.</p>
          </div>
        )}

        {/* Tab content */}
        {!fullLoading && hasData && (
          <>
            {activeTab === 'Overview'     && <OverviewTab    d={full} />}
            {activeTab === 'Visitors'     && <VisitorsTab    d={full} />}
            {activeTab === 'Content'      && <ContentTab     d={full} />}
            {activeTab === 'Conversions'  && <ConversionsTab d={full} />}
          </>
        )}
        {activeTab === 'Live' && <LiveTab />}

        {/* Fallback: show legacy stats when full analytics fails */}
        {fullError && backendData && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Showing legacy tracking data</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Total Views"   Icon={IGlobe}  value={backendData.totals.allTime.toLocaleString()} accent="indigo" />
              <StatCard label="Last 30 Days"  Icon={IChart}  value={backendData.totals.last30.toLocaleString()}  accent="sky" />
              <StatCard label="Contact Leads" Icon={IMail}   value={backendData.leads.total.toLocaleString()}    accent="green" sub={`${backendData.leads.new} new`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
