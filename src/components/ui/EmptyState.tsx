import React from 'react';

// ── Inline SVG illustrations ───────────────────────────────────────
const illustrations: Record<string, React.ReactNode> = {
  blog: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="12" width="60" height="56" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="20" y="24" width="28" height="4" rx="2" fill="#4b5563"/>
      <rect x="20" y="34" width="40" height="3" rx="1.5" fill="#374151"/>
      <rect x="20" y="41" width="36" height="3" rx="1.5" fill="#374151"/>
      <rect x="20" y="48" width="32" height="3" rx="1.5" fill="#374151"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  portfolio: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="30" height="24" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="42" y="20" width="30" height="24" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="8" y="50" width="30" height="10" rx="2" fill="#374151"/>
      <rect x="42" y="50" width="30" height="10" rx="2" fill="#374151"/>
      <path d="M16 32l6 6 4-4 6 6" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  hero: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="18" width="64" height="40" rx="5" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <path d="M8 50l18-14 12 10 10-8 24 14H8z" fill="#374151"/>
      <circle cx="26" cy="30" r="5" fill="#4b5563"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  'case-studies': (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="10" width="52" height="60" rx="5" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="22" y="22" width="20" height="3" rx="1.5" fill="#4b5563"/>
      <rect x="22" y="30" width="36" height="2.5" rx="1.25" fill="#374151"/>
      <rect x="22" y="36" width="32" height="2.5" rx="1.25" fill="#374151"/>
      <rect x="22" y="42" width="36" height="2.5" rx="1.25" fill="#374151"/>
      <rect x="22" y="52" width="14" height="6" rx="3" fill="#374151"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  testimonials: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="16" width="60" height="38" rx="8" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <path d="M28 54l-8 10v-10" fill="#1f2937" stroke="#374151" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="22" y="28" width="36" height="3" rx="1.5" fill="#374151"/>
      <rect x="26" y="35" width="28" height="3" rx="1.5" fill="#374151"/>
      <circle cx="25" cy="22" r="4" fill="#374151"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  brands: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="24" width="22" height="14" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="36" y="24" width="22" height="14" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="10" y="44" width="22" height="14" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <rect x="36" y="44" width="22" height="14" rx="3" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <circle cx="58" cy="56" r="12" fill="#e63946"/>
      <path d="M54 56h8M58 52v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  leads: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="20" width="60" height="42" rx="6" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <path d="M10 30l30 18 30-18" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="40" cy="20" r="10" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <path d="M36 20l3 3 5-6" stroke="#e63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  default: (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="48" height="48" rx="8" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
      <path d="M30 40h20M40 30v20" stroke="#4b5563" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

interface Props {
  variant?: keyof typeof illustrations;
  title?: string;
  description?: string;
  message?: string; // legacy support
  action?: React.ReactNode;
}

export default function EmptyState({
  variant = 'default',
  title,
  description,
  message,
  action,
}: Props) {
  const illustration = illustrations[variant] || illustrations.default;
  const displayTitle = title || message || 'Nothing here yet';

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {/* Illustration */}
      <div className="mb-5 opacity-80">
        {illustration}
      </div>

      {/* Text */}
      <p className="text-base font-semibold text-gray-300 mb-1">{displayTitle}</p>
      {description && (
        <p className="text-sm text-gray-500 max-w-xs">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
