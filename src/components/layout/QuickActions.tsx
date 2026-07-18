import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const FolderIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>;
const PenIcon    = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>;
const ImageIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const DocIcon    = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>;
const ChatIcon   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>;
const StarIcon   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>;

const ACTIONS = [
  { label: 'New Project',    Icon: FolderIcon, to: '/portfolio' },
  { label: 'New Blog Post',  Icon: PenIcon,    to: '/blog' },
  { label: 'New Hero Slide', Icon: ImageIcon,  to: '/hero' },
  { label: 'New Case Study', Icon: DocIcon,    to: '/case-studies' },
  { label: 'New Testimonial',Icon: ChatIcon,   to: '/testimonials' },
  { label: 'New Partner',    Icon: StarIcon,   to: '/trusted-brands' },
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
              <span className="text-gray-400"><action.Icon /></span>
              {action.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
