import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

// ── All navigable destinations ────────────────────────────────────
const COMMANDS = [
  // Pages
  { id: 'dashboard',    label: 'Dashboard',     icon: '🏠', to: '/',              group: 'Navigate' },
  { id: 'analytics',   label: 'Analytics',     icon: '📈', to: '/analytics',     group: 'Navigate' },
  { id: 'hero',        label: 'Hero Slider',   icon: '🖼️', to: '/hero',           group: 'Navigate' },
  { id: 'portfolio',   label: 'Projects',      icon: '🗂️', to: '/portfolio',     group: 'Navigate' },
  { id: 'case-studies',label: 'Case Studies',  icon: '📋', to: '/case-studies',  group: 'Navigate' },
  { id: 'blog',        label: 'Blog',          icon: '✍️', to: '/blog',           group: 'Navigate' },
  { id: 'trusted',     label: 'Trusted By',    icon: '🏆', to: '/trusted-brands',group: 'Navigate' },
  { id: 'testimonials',label: 'Testimonials',  icon: '💬', to: '/testimonials',  group: 'Navigate' },
  { id: 'leads',       label: 'Leads',         icon: '📩', to: '/leads',         group: 'Navigate' },
  { id: 'settings',    label: 'Settings',      icon: '⚙️', to: '/settings',      group: 'Navigate' },
  // Quick create
  { id: 'new-project',    label: 'New Project',     icon: '➕', to: '/portfolio?new=1',     group: 'Create' },
  { id: 'new-blog',       label: 'New Blog Post',    icon: '➕', to: '/blog?new=1',          group: 'Create' },
  { id: 'new-hero',       label: 'New Hero Slide',   icon: '➕', to: '/hero?new=1',          group: 'Create' },
  { id: 'new-case-study', label: 'New Case Study',   icon: '➕', to: '/case-studies?new=1',  group: 'Create' },
  { id: 'new-testimonial',label: 'New Testimonial',  icon: '➕', to: '/testimonials?new=1',  group: 'Create' },
  { id: 'new-brand',      label: 'New Partner Brand',icon: '➕', to: '/trusted-brands?new=1',group: 'Create' },
  // Settings shortcuts
  { id: 'settings-seo',     label: 'SEO Settings',     icon: '🔍', to: '/settings?tab=seo',       group: 'Settings' },
  { id: 'settings-social',  label: 'Social Links',     icon: '🔗', to: '/settings?tab=social',    group: 'Settings' },
  { id: 'settings-account', label: 'My Account',       icon: '👤', to: '/settings?tab=account',   group: 'Settings' },
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
                      <span className="text-base w-5 text-center shrink-0">{cmd.icon}</span>
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
