import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

// ── SVG path map — one path per command icon ──────────────────────
const ICON_PATHS: Record<string, string> = {
  home:      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  chart:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  image:     'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  folder:    'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  doc:       'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  pen:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  star:      'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  chat:      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  mail:      'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  cog:       'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  plus:      'M12 4v16m8-8H4',
  search:    'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  link:      'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  user:      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
};

function CmdIcon({ icon }: { icon: string }) {
  const d = ICON_PATHS[icon] || ICON_PATHS.doc;
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// ── All navigable destinations ────────────────────────────────────
const COMMANDS = [
  { id: 'dashboard',    label: 'Dashboard',     icon: 'home',   to: '/',              group: 'Navigate' },
  { id: 'analytics',   label: 'Analytics',     icon: 'chart',  to: '/analytics',     group: 'Navigate' },
  { id: 'hero',        label: 'Hero Slider',   icon: 'image',  to: '/hero',          group: 'Navigate' },
  { id: 'portfolio',   label: 'Projects',      icon: 'folder', to: '/portfolio',     group: 'Navigate' },
  { id: 'case-studies',label: 'Case Studies',  icon: 'doc',    to: '/case-studies',  group: 'Navigate' },
  { id: 'blog',        label: 'Blog',          icon: 'pen',    to: '/blog',          group: 'Navigate' },
  { id: 'trusted',     label: 'Trusted By',    icon: 'star',   to: '/trusted-brands',group: 'Navigate' },
  { id: 'testimonials',label: 'Testimonials',  icon: 'chat',   to: '/testimonials',  group: 'Navigate' },
  { id: 'leads',       label: 'Leads',         icon: 'mail',   to: '/leads',         group: 'Navigate' },
  { id: 'settings',    label: 'Settings',      icon: 'cog',    to: '/settings',      group: 'Navigate' },
  { id: 'new-project',    label: 'New Project',      icon: 'plus', to: '/portfolio?new=1',     group: 'Create' },
  { id: 'new-blog',       label: 'New Blog Post',     icon: 'plus', to: '/blog?new=1',          group: 'Create' },
  { id: 'new-hero',       label: 'New Hero Slide',    icon: 'plus', to: '/hero?new=1',          group: 'Create' },
  { id: 'new-case-study', label: 'New Case Study',    icon: 'plus', to: '/case-studies?new=1',  group: 'Create' },
  { id: 'new-testimonial',label: 'New Testimonial',   icon: 'plus', to: '/testimonials?new=1',  group: 'Create' },
  { id: 'new-brand',      label: 'New Partner Brand', icon: 'plus', to: '/trusted-brands?new=1',group: 'Create' },
  { id: 'settings-seo',     label: 'SEO Settings',  icon: 'search', to: '/settings?tab=seo',     group: 'Settings' },
  { id: 'settings-social',  label: 'Social Links',  icon: 'link',   to: '/settings?tab=social',  group: 'Settings' },
  { id: 'settings-account', label: 'My Account',    icon: 'user',   to: '/settings?tab=account', group: 'Settings' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = query.trim()
    ? COMMANDS.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.group.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  // Reset selection when query changes
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const execute = useCallback((cmd: typeof COMMANDS[0]) => {
    onClose();
    navigate(cmd.to);
  }, [navigate, onClose]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) execute(filtered[activeIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  // Group visible results
  const groups: Record<string, typeof COMMANDS> = {};
  filtered.forEach(cmd => {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group].push(cmd);
  });

  // Flat index map for keyboard nav
  let flatIdx = 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/70 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages, actions…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <kbd className="hidden sm:inline text-[11px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No results for "{query}"</p>
          ) : (
            Object.entries(groups).map(([group, cmds]) => (
              <div key={group}>
                <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider px-4 pt-3 pb-1">
                  {group}
                </p>
                {cmds.map(cmd => {
                  const idx = flatIdx++;
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                        isActive ? 'bg-primary/15 text-white' : 'text-gray-300 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="w-5 shrink-0 text-gray-500 flex items-center justify-center">
                        <CmdIcon icon={cmd.icon} />
                      </span>
                      <span className="flex-1">{cmd.label}</span>
                      {isActive && (
                        <kbd className="text-[11px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded font-mono shrink-0">↵</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-800 text-[11px] text-gray-600">
          <span><kbd className="bg-gray-800 px-1 rounded font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="bg-gray-800 px-1 rounded font-mono">↵</kbd> open</span>
          <span><kbd className="bg-gray-800 px-1 rounded font-mono">ESC</kbd> close</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
