import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  '':              'Dashboard',
  'hero':          'Hero Slider',
  'portfolio':     'Projects',
  'case-studies':  'Case Studies',
  'blog':          'Blog',
  'trusted-brands':'Trusted Brands',
  'testimonials':  'Testimonials',
  'leads':         'Leads',
  'analytics':     'Analytics',
  'settings':      'Settings',
};

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  // Build crumbs: always start with Dashboard
  const crumbs = [
    { label: 'Dashboard', to: '/' },
    ...segments.map((seg, i) => ({
      label: ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      to: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  // On the dashboard root, only show "Dashboard" — no separator needed
  if (crumbs.length === 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3.5 h-3.5 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="text-gray-500 hover:text-gray-300 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
