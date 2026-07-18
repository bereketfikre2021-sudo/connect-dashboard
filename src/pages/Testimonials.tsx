import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { testimonialService } from '@/services/cms.service';
import { Testimonial } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';
import SortableItem from '@/components/ui/SortableItem';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortableList } from '@/hooks/useSortableList';

function TestimonialForm({ item, onClose }: { item?: Testimonial; onClose: () => void }) {
  const qc = useQueryClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: item
      ? { clientName: item.clientName, position: item.position, company: item.company, review: item.review, rating: item.rating, href: item.href, featured: item.featured, displayOrder: item.displayOrder, published: item.published }
      : { rating: 5, published: true, featured: false, displayOrder: 0 },
  });
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!photoFile);

  const onSubmit = async (data: any) => {
    try {
      if (item) { await testimonialService.update(item.id, data, photoFile || undefined); toast.success('Updated'); }
      else { await testimonialService.create(data, photoFile || undefined); toast.success('Created'); }
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{item ? 'Edit Testimonial' : 'New Testimonial'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Client Photo / Logo" currentUrl={item?.clientPhoto} onChange={setPhotoFile} />
          <div><label className="label">Client Name *</label><input {...register('clientName', { required: true })} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Position</label><input {...register('position')} className="input" /></div>
            <div><label className="label">Company</label><input {...register('company')} className="input" /></div>
          </div>
          <div><label className="label">Review *</label><textarea {...register('review', { required: true })} className="input" rows={4} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Rating (1–5)</label><input {...register('rating', { valueAsNumber: true })} type="number" className="input" min={1} max={5} /></div>
            <div><label className="label">External Link</label><input {...register('href')} className="input" placeholder="https://…" /></div>
          </div>
          <div><label className="label">Display Order</label><input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input {...register('published')} type="checkbox" className="w-4 h-4 rounded accent-primary" /><span className="text-sm text-gray-300">Published</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input {...register('featured')} type="checkbox" className="w-4 h-4 rounded accent-primary" /><span className="text-sm text-gray-300">Featured</span></label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditItem(undefined); setFormOpen(true); });
  const [editItem, setEditItem] = useState<Testimonial | undefined>();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  useEffect(() => { document.title = 'Testimonials · Connect Digitals'; }, []);

  const { data: rawItems = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => { const res = await testimonialService.getAll(); return res.data.data; },
  });

  const onReorder = useCallback(async (items: { id: string; displayOrder: number }[]) => {
    await testimonialService.reorder(items);
    qc.invalidateQueries({ queryKey: ['testimonials'] });
    toast.success('Order saved');
  }, [qc]);

  const { items, syncItems, handleDragEnd, selected, toggleSelect, selectAll, clearSelection, isSelected, isSaving, selectedCount } = useSortableList<Testimonial>(rawItems, onReorder);
  useEffect(() => { syncItems(rawItems); }, [rawItems]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => { for (const id of ids) await testimonialService.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Deleted'); setDeleteIds([]); setConfirmBulk(false); clearSelection(); },
    onError: () => toast.error('Failed to delete'),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDndEnd = (e: DragEndEvent) => { if (e.over && e.active.id !== e.over.id) handleDragEnd(String(e.active.id), String(e.over.id)); };

  return (
    <div>
      <PageHeader title="Testimonials" subtitle={`${items.length} testimonial${items.length !== 1 ? 's' : ''}${isSaving ? ' · Saving…' : ''}`} viewUrl="https://web.bereketfikre.et/#testimonials"
        action={<button onClick={() => { setEditItem(undefined); setFormOpen(true); }} className="btn-primary">+ Add Testimonial</button>} />

      <BulkActionBar count={selectedCount} totalCount={items.length} onClear={clearSelection} onSelectAll={selectAll} actions={[
        { label: 'Delete Selected', danger: true, onClick: () => { setDeleteIds(Array.from(selected)); setConfirmBulk(true); } },
        { label: 'Publish Selected', onClick: async () => { for (const id of selected) await testimonialService.update(id, { published: true }); qc.invalidateQueries({ queryKey: ['testimonials'] }); clearSelection(); toast.success('Published'); } },
        { label: 'Unpublish Selected', onClick: async () => { for (const id of selected) await testimonialService.update(id, { published: false }); qc.invalidateQueries({ queryKey: ['testimonials'] }); clearSelection(); toast.success('Unpublished'); } },
        { label: 'Feature Selected', onClick: async () => { for (const id of selected) await testimonialService.update(id, { featured: true }); qc.invalidateQueries({ queryKey: ['testimonials'] }); clearSelection(); toast.success('Featured'); } },
      ]} />

      {isLoading ? <div className="text-gray-500 text-sm">Loading…</div>
      : items.length === 0 ? <EmptyState variant="testimonials" title="No Testimonials Yet" description="Add reviews from your clients." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First</button>} />
      : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-3">
              {items.map((item) => (
                <SortableItem key={item.id} id={item.id} selected={isSelected(item.id)} onSelect={() => toggleSelect(item.id)}>
                  {(dragProps) => (
                    <div className="card flex flex-col sm:flex-row sm:items-start gap-3">
                      <button type="button" {...dragProps} className="hidden sm:flex items-center justify-center w-5 text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0 touch-none mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16"/></svg>
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0">
                        {item.clientPhoto && <img src={item.clientPhoto} alt={item.clientName} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white">{item.clientName}</p>
                          {item.position && <span className="text-xs text-gray-500">· {item.position}</span>}
                          <span className="text-xs text-yellow-400">{'★'.repeat(item.rating)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">"{item.review}"</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={item.published ? 'badge-published' : 'badge-unpublished'}>{item.published ? 'Published' : 'Hidden'}</span>
                          {item.featured && <span className="badge-draft">Featured</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                        <button onClick={() => { setDeleteIds([item.id]); setConfirmBulk(true); }} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {formOpen && <TestimonialForm item={editItem} onClose={() => { setFormOpen(false); setEditItem(undefined); }} />}
      <ConfirmDialog isOpen={confirmBulk} message={`Delete ${deleteIds.length} testimonial${deleteIds.length !== 1 ? 's' : ''}?`}
        onConfirm={() => deleteMutation.mutate(deleteIds)} onCancel={() => { setConfirmBulk(false); setDeleteIds([]); }} loading={deleteMutation.isPending} />
    </div>
  );
}
