import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import QuickActions from './QuickActions';
import UserMenu from './UserMenu';
import Notifications from './Notifications';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CommandPalette from '@/components/ui/CommandPalette';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 lg:ml-60 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white shrink-0"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search trigger — Netlify style full bar */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-3 flex-1 max-w-sm px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700/60 hover:border-gray-500 hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-all duration-150 text-sm group"
            aria-label="Open command palette"
          >
            <svg className="w-3.5 h-3.5 shrink-0 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="hidden sm:inline text-xs flex-1 text-left">Search pages, actions…</span>
            <span className="hidden sm:flex items-center gap-1 shrink-0">
              <kbd className="text-[10px] bg-gray-700 border border-gray-600 text-gray-400 px-1.5 py-0.5 rounded font-mono leading-none">⌘</kbd>
              <kbd className="text-[10px] bg-gray-700 border border-gray-600 text-gray-400 px-1.5 py-0.5 rounded font-mono leading-none">K</kbd>
            </span>
          </button>

          {/* Brand name — mobile only, fills the gap */}
          <span className="lg:hidden text-sm font-semibold text-white flex-1 truncate">Connect Digitals</span>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            <QuickActions />
            <div className="w-px h-5 bg-gray-800 hidden sm:block" />
            <Notifications />
            <div className="w-px h-5 bg-gray-800 hidden sm:block" />
            <UserMenu />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
