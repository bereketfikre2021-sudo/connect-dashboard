import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

// ── SVG icon helper ───────────────────────────────────────────────
function Icon({ d, className = 'w-4 h-4' }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const ICONS = {
  person:   'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  chevron:  'M19 9l-7 7-7-7',
};

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { admin, logout } = useAuthStore();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    setOpen(false);
    try { await authService.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
      >
        {/* Avatar circle — solid bg so icon is always visible */}
        <div className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center shrink-0">
          <Icon d={ICONS.person} className="w-4 h-4 text-gray-200" />
        </div>
        <span className="text-sm text-gray-300 font-medium hidden sm:block max-w-[100px] truncate">{admin?.name}</span>
        <Icon d={ICONS.chevron} className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/40">
            <p className="text-sm font-semibold text-white truncate">{admin?.name}</p>
            <p className="text-xs text-gray-500 truncate">{admin?.email}</p>
          </div>

          {/* Profile */}
          <button
            onClick={() => { setOpen(false); navigate('/settings?tab=account'); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
          >
            <Icon d={ICONS.person} className="w-4 h-4 text-gray-400 shrink-0" />
            Profile
          </button>

          {/* Settings */}
          <button
            onClick={() => { setOpen(false); navigate('/settings'); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-colors text-left"
          >
            <Icon d={ICONS.settings} className="w-4 h-4 text-gray-400 shrink-0" />
            Settings
          </button>

          {/* Logout */}
          <div className="border-t border-gray-800 mt-0.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
            >
              <Icon d={ICONS.logout} className="w-4 h-4 text-rose-400 shrink-0" />
              Sign out
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
