import { NavLink } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/cms.service';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/', label: 'Dashboard',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
  { to: '/analytics', label: 'Analytics',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/hero',      label: 'Hero Slider',  icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/portfolio', label: 'Projects',     icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { to: '/case-studies', label: 'Case Studies', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/blog',      label: 'Blog',         icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { to: '/trusted-brands', label: 'Trusted By', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { to: '/testimonials', label: 'Testimonials', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { to: '/leads',     label: 'Leads',        icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { to: '/settings',  label: 'Settings',     icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const res = await settingsService.get(); return res.data.data; },
    staleTime: 5 * 60 * 1000,
  });

  const logoUrl = settings?.logo;

  const handleLogoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await settingsService.update({}, file);
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Logo updated');
    } catch {
      toast.error('Failed to update logo');
    }
    e.target.value = '';
  };

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const sidebarContent = (
    <aside className="w-60 flex flex-col h-full bg-gray-950 border-r border-gray-800/60">
      {/* Logo area */}
      <div
        className="px-4 py-5 border-b border-gray-800/60 cursor-pointer group"
        onClick={handleLogoClick}
        title="Click to change logo"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-700 group-hover:ring-primary transition-all"
                />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                  </svg>
                </div>
              </>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 ring-1 ring-dashed ring-primary/40 flex items-center justify-center text-primary text-xs font-bold group-hover:ring-primary transition-all">
                +
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">Connect Digitals</p>
            <p className="text-[11px] text-gray-500 truncate">Creative Agency CMS</p>
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleFileChange} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-gray-800 text-white font-medium border-l-2 border-indigo-500 pl-[10px]'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] font-normal'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-400'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — version */}
      <div className="px-2 pb-3 border-t border-gray-800/60 pt-2">
        <p className="text-[11px] text-gray-700 px-3 pt-2">v1.0 · Connect Digitals CMS</p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide in from left */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
