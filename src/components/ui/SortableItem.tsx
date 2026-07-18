import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';

interface Props {
  id: string;
  children: (dragHandleProps: Record<string, any>) => ReactNode;
  selected?: boolean;
  onSelect?: () => void;
}

export default function SortableItem({ id, children, selected, onSelect }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const dragHandleProps = { ...attributes, ...listeners };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${selected ? 'ring-2 ring-indigo-500 rounded-xl' : ''}`}
    >
      {/* Selection checkbox — always visible on mobile (no hover needed), hover on desktop */}
      {onSelect && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded flex items-center justify-center border transition-all
            ${selected
              ? 'bg-indigo-500 border-indigo-500 opacity-100'
              : 'border-gray-500 bg-gray-900/90 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
          aria-label="Select item"
        >
          {selected && (
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
      {children(dragHandleProps)}
    </div>
  );
}
