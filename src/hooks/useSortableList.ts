import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

/**
 * Shared hook for drag-and-drop ordering + bulk selection.
 * Works with any list of items that have an `id` string field.
 */
export function useSortableList<T extends { id: string }>(
  initialItems: T[],
  onReorder: (items: { id: string; displayOrder: number }[]) => Promise<void>
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Sync when parent data changes
  const syncItems = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  // DnD handler — called after a successful drop
  const handleDragEnd = useCallback(async (activeId: string, overId: string) => {
    if (activeId === overId) return;
    const oldIndex = items.findIndex((i) => i.id === activeId);
    const newIndex = items.findIndex((i) => i.id === overId);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    setIsSaving(true);
    try {
      await onReorder(
        reordered.map((item, idx) => ({ id: item.id, displayOrder: idx }))
      );
    } finally {
      setIsSaving(false);
    }
  }, [items, onReorder]);

  // Selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(items.map((i) => i.id)));
  }, [items]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  return {
    items,
    syncItems,
    handleDragEnd,
    selected,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    isSaving,
    selectedCount: selected.size,
  };
}
