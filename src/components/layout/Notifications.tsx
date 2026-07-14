import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { contactService, blogService } from '@/services/cms.service';

interface Notification {
  id: string;
  icon: string;
  label: string;
  count?: number;
  route: string;
  color: string;
}

function useLiveNotifications() {
  // New leads
  const { data: leadStats } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: async () => { const res = await contactService.getStats(); return res.data.data; },
    refetchInterval: 60 * 1000,
  });

  // Scheduled blog posts
  const { data: blogData } = useQuery({
    queryKey: ['blog-scheduled'],
    queryFn: async () => {
      const res = await blogService.getAll({ status: 'scheduled', limit: 100 });
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const notifications: Notification[] = [];

  const newLeads = leadStats?.new ?? 0;
  if (newLeads > 0) {
    notifications.push({
      id: 'new-leads',
      icon: '📩',
      label: `${newLeads} New Lead${newLeads !== 1 ? 's' : ''}`,
      count: newLeads,
      route: '/leads',
      color: 'text-blue-400',
    });
  }

  const scheduled = blogData?.pagination?.total ?? 0;
  if (scheduled > 0) {
    notifications.push({
      id: 'scheduled-blog',
      icon: '🕐',
      label: `${scheduled} Blog Post${scheduled !== 1 ? 's' : ''} Scheduled`,
      count: scheduled,
      route: '/blog',
      color: 'text-yellow-400',
    });
  }

  return notifications;
}

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const notifications = useLiveNotifications();
  const totalCount = notifications.reduce((sum, n) => sum + (n.count ?? 0), 0);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
  }, [open]);

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

  const go = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {totalCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">{totalCount}</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-2xl mb-2">🔔</p>
              <p className="text-sm text-gray-500">All caught up!</p>
              <p className="text-xs text-gray-600 mt-0.5">No new notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => go(n.route)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800/50 last:border-0"
                >
                  <span className="text-xl shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.color}`}>{n.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Click to view →</p>
                  </div>
                  {n.count && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      n.id === 'new-leads' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {n.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
