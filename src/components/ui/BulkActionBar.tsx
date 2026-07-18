interface Props {
  count: number;
  onClear: () => void;
  onSelectAll: () => void;
  totalCount: number;
  actions: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }[];
}

export default function BulkActionBar({ count, onClear, onSelectAll, totalCount, actions }: Props) {
  if (count === 0) return null;
  return (
    <div className="sticky top-[60px] z-30 flex items-center gap-3 px-4 py-2.5 mb-4 bg-indigo-600/90 backdrop-blur-sm rounded-xl border border-indigo-500/50 shadow-lg shadow-indigo-900/40 text-white">
      <span className="text-sm font-semibold shrink-0">{count} selected</span>
      <div className="flex items-center gap-2 flex-1 flex-wrap">
        {count < totalCount && (
          <button onClick={onSelectAll} className="text-xs text-indigo-200 hover:text-white underline underline-offset-2 transition-colors">
            Select all {totalCount}
          </button>
        )}
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            disabled={a.disabled}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              a.danger
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <button onClick={onClear} className="text-indigo-200 hover:text-white transition-colors shrink-0" aria-label="Clear selection">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
