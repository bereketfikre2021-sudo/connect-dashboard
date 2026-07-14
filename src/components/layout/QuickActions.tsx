import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const ACTIONS = [
  { label: 'New Project',    icon: '🗂️', to: '/portfolio' },
  { label: 'New Blog Post',  icon: '✍️', to: '/blog' },
  { label: 'New Hero Slide', icon: '🖼️', to: '/hero' },
  { label: 'New Case Study', icon: '📋', to: '/case-studies' },
  { label: 'New Testimonial',icon: '💬', to: '/testimonials' },
  { label: 'New Partner',    icon: '🏆', to: '/trusted-brands' },
];

export default function QuickActions() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Position the dropdown under the button
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    navigate(`${to}?new=1`);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors shadow-lg shadow-primary/20"
      >
        <span className="text-base leading-none">+</span>
        New
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div
          ref={ref}
          style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
          className="w-52 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {ACTIONS.map((action) => (
            <button
              key={action.to}
              onClick={() => go(action.to)}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-left"
            >
              <span className="text-base">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
