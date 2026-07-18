import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndSensors } from '@/hooks/useDndSensors';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { heroService } from '@/services/cms.service';
import { HeroSlide } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';
import SortableItem from '@/components/ui/SortableItem';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortableList } from '@/hooks/useSortableList';

type FormData = Omit<HeroSlide, 'id' | 'imagePublicId' | 'createdAt' | 'updatedAt'>;

function SlideForm({ slide, onClose }: { slide?: HeroSlide; onClose: () => void }) {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<FormData>({
    defaultValues: slide
      ? { headline: slide.headline, subheadline: slide.subheadline, buttonText: slide.buttonText, buttonUrl: slide.buttonUrl, altText: slide.altText, autoSlideDelay: slide.autoSlideDelay, displayOrder: slide.displayOrder, status: slide.status || 'active', published: slide.published }
      : { autoSlideDelay: 4000, displayOrder: 0, status: 'active' },
  });
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!imageFile);

  const onSubmit = async (data: FormData) => {
    try {
      if (slide) { await heroService.update(slide.id, data, imageFile || undefined); toast.success('Slide updated'); }
      else { await heroService.create(data, imageFile || undefined); toast.success('Slide created'); }
      qc.invalidateQueries({ queryKey: ['hero'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving slide'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{slide ? 'Edit Slide' : 'New Slide'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Background Image" currentUrl={slide?.backgroundImage} onChange={setImageFile} />
          <div><label className="label">Headline</label><input {...register('headline')} className="input" /></div>
          <div><label className="label">Subheadline</label><input {...register('subheadline')} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Button Text</label><input {...register('buttonText')} className="input" /></div>
            <div><label className="label">Button URL</label><input {...register('buttonUrl')} className="input" /></div>
          </div>
          <div><label className="label">Alt Text</label><input {...register('altText')} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Auto Slide Delay (ms)</label><input {...register('autoSlideDelay', { valueAsNumber: true })} type="number" className="input" /></div>
            <div><label className="label">Display Order</label><input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" /></div>
          </div>
          <div><label className="label">Status</label><select {...register('status')} className="input"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save Slide'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HeroSlider() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditSlide(undefined); setFormOpen(true); });
  const [editSlide, setEditSlide] = useState<HeroSlide | undefined>();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  useEffect(() => { document.title = 'Hero Slider · Connect Digitals'; }, []);

  const { data: rawSlides = [], isLoading } = useQuery<HeroSlide[]>({
    queryKey: ['hero'],
    queryFn: async () => { const res = await heroService.getAll(); return res.data.data; },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) => heroService.reorder(items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hero'] }); toast.success('Order saved'); },
    onError: () => toast.error('Failed to save order'),
  });

  const onReorder = useCallback(async (items: { id: string; displayOrder: number }[]) => {
    await reorderMutation.mutateAsync(items);
  }, []);

  const { items: slides, syncItems, handleDragEnd, selected, toggleSelect, selectAll, clearSelection, isSelected, isSaving, selectedCount } = useSortableList<HeroSlide>(rawSlides, onReorder);

  useEffect(() => { syncItems(rawSlides); }, [rawSlides]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => { for (const id of ids) await heroService.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hero'] }); toast.success('Deleted'); setDeleteIds([]); setConfirmBulk(false); clearSelection(); },
    onError: () => toast.error('Failed to delete'),
  });

  const sensors = useDndSensors();

  const handleDndEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) handleDragEnd(String(active.id), String(over.id));
  };

  return (
    <div>
      <PageHeader
        title="Hero Slider"
        subtitle={`${slides.length} slide${slides.length !== 1 ? 's' : ''}${isSaving ? ' · Saving…' : ''}`}
        viewUrl="https://web.bereketfikre.et/#hero"
        action={<button onClick={() => { setEditSlide(undefined); setFormOpen(true); }} className="btn-primary">+ Add Slide</button>}
      />

      <BulkActionBar
        count={selectedCount}
        totalCount={slides.length}
        onClear={clearSelection}
        onSelectAll={selectAll}
        actions={[
          { label: 'Delete Selected', danger: true, onClick: () => { setDeleteIds(Array.from(selected)); setConfirmBulk(true); } },
          { label: 'Publish Selected', onClick: async () => { for (const id of selected) await heroService.update(id, { status: 'active', published: true }); qc.invalidateQueries({ queryKey: ['hero'] }); clearSelection(); toast.success('Published'); } },
          { label: 'Unpublish Selected', onClick: async () => { for (const id of selected) await heroService.update(id, { status: 'inactive', published: false }); qc.invalidateQueries({ queryKey: ['hero'] }); clearSelection(); toast.success('Unpublished'); } },
        ]}
      />

      {isLoading ? <div className="text-gray-500 text-sm">Loading…</div>
      : slides.length === 0 ? (
        <EmptyState variant="hero" title="No Hero Slides Yet" description="Add your first slide." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Slide</button>} />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {slides.map((slide) => (
                <SortableItem key={slide.id} id={slide.id} selected={isSelected(slide.id)} onSelect={() => toggleSelect(slide.id)}>
                  {(dragProps) => (
                    <div className="card flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Drag handle */}
                      <button type="button" {...dragProps} className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-200 cursor-grab active:cursor-grabbing shrink-0 touch-none rounded-lg hover:bg-gray-700/50 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16"/></svg>
                      </button>
                      <img src={slide.backgroundImage} alt={slide.altText || ''} className="w-full sm:w-24 h-20 sm:h-14 object-cover rounded-lg shrink-0 bg-gray-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{slide.headline || '(No headline)'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={slide.published ? 'badge-published' : 'badge-unpublished'}>{slide.published ? 'Active' : 'Inactive'}</span>
                          <span className="text-xs text-gray-600">Order: {slide.displayOrder}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditSlide(slide); setFormOpen(true); }} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                        <button onClick={() => { setDeleteIds([slide.id]); setConfirmBulk(true); }} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {formOpen && <SlideForm slide={editSlide} onClose={() => { setFormOpen(false); setEditSlide(undefined); }} />}
      <ConfirmDialog
        isOpen={confirmBulk}
        message={`Delete ${deleteIds.length} slide${deleteIds.length !== 1 ? 's' : ''}? This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate(deleteIds)}
        onCancel={() => { setConfirmBulk(false); setDeleteIds([]); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
