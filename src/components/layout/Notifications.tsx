import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { contactService, blogService } from '@/services/cms.service';

// ── Time ago helper ───────────────────────────────────────────────
function timeAgo(date: string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── SVG icons ─────────────────────────────────────────────────────
const LeadIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Live data — independent query keys so they always fetch ──────
  const { data: leadStats } = useQuery({
    queryKey: ['notif-lead-stats'],
    queryFn: async () => { const res = await contactService.getStats(); return res.data.data; },
    refetchInterval: 30 * 1000, // every 30s
  });

  const { data: recentLeadsData } = useQuery({
    queryKey: ['notif-recent-leads'],
    queryFn: async () => {
      const res = await contactService.getAll({ status: 'new', limit: 5, sortBy: 'submittedAt', sortOrder: 'desc' });
      return res.data?.data ?? [];
    },
    refetchInterval: 30 * 1000,
  });

  const { data: blogData } = useQuery({
    queryKey: ['notif-scheduled-blog'],
    queryFn: async () => {
      const res = await blogService.getAll({ status: 'scheduled', limit: 5 });
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const newLeads: number = leadStats?.new ?? 0;
  const scheduledPosts: number = blogData?.pagination?.total ?? 0;
  const recentLeads: any[] = recentLeadsData ?? [];
  const totalCount = newLeads + scheduledPosts;
  // Badge only shows when there are unread notifications and user hasn't opened panel yet
  const badgeCount = dismissed ? 0 : totalCount;

  // Reset dismissed state when new notifications arrive
  const [prevTotal, setPrevTotal] = useState(0);
  useEffect(() => {
    if (totalCount > prevTotal) {
      setDismissed(false);
    }
    setPrevTotal(totalCount);
  }, [totalCount]);

  // Position dropdown
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    // Mark as read when opened
    if (open) setDismissed(true);
  }, [open]);

  // ── Close on outside click ───────────────────────────────────────
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const go = (route: string) => { setOpen(false); navigate(route); };

  return (
    <>
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        aria-label={`Notifications${totalCount > 0 ? ` (${totalCount} new)` : ''}`}
      >
        <BellIcon />
        {badgeCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none px-1">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {totalCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">{totalCount} new</span>
            )}
          </div>

          {totalCount === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="flex justify-center mb-3 text-gray-700">
                <BellIcon />
              </div>
              <p className="text-sm text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-600 mt-0.5">No new leads or scheduled posts</p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-800/60">

              {/* ── New leads section ── */}
              {newLeads > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      New Leads
                    </p>
                  </div>

                  {recentLeads.length > 0 ? recentLeads.map((lead: any) => (
                    <button
                      key={lead.id}
                      onClick={() => go('/leads')}
                      className="flex items-start gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0 mt-0.5">
                        {lead.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {lead.service ? `Interested in ${lead.service}` : lead.email}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-600 shrink-0 mt-1">
                        {timeAgo(lead.submittedAt)}
                      </span>
                    </button>
                  )) : (
                    /* Fallback if individual leads haven't loaded yet */
                    <button
                      onClick={() => go('/leads')}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                    >
                      <span className="text-blue-400 shrink-0"><LeadIcon /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-400">
                          {newLeads} new {newLeads === 1 ? 'lead' : 'leads'} waiting
                        </p>
                        <p className="text-xs text-gray-600">Click to review</p>
                      </div>
                      <span className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full shrink-0">
                        {newLeads}
                      </span>
                    </button>
                  )}

                  {newLeads > 5 && (
                    <button
                      onClick={() => go('/leads')}
                      className="flex items-center justify-center w-full px-4 py-2.5 text-xs text-gray-500 hover:text-primary hover:bg-gray-800 transition-colors"
                    >
                      View all {newLeads} leads →
                    </button>
                  )}
                </>
              )}

              {/* ── Scheduled posts section ── */}
              {scheduledPosts > 0 && (
                <>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Scheduled Posts
                    </p>
                  </div>
                  <button
                    onClick={() => go('/blog')}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-yellow-400 shrink-0"><ClockIcon /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-yellow-400">
                        {scheduledPosts} {scheduledPosts === 1 ? 'post' : 'posts'} scheduled
                      </p>
                      <p className="text-xs text-gray-600">Click to manage</p>
                    </div>
                    <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full shrink-0">
                      {scheduledPosts}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          {totalCount > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-800">
              <button
                onClick={() => go('/leads')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors w-full text-center"
              >
                View all leads →
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
