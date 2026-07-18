import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { trustedBrandService } from '@/services/cms.service';
import { TrustedBrand } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';
import SortableItem from '@/components/ui/SortableItem';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortableList } from '@/hooks/useSortableList';

function BrandForm({ brand, onClose }: { brand?: TrustedBrand; onClose: () => void }) {
  const qc = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: brand
      ? { name: brand.name, website: brand.website, altText: brand.altText, displayOrder: brand.displayOrder, published: brand.published }
      : { published: true, displayOrder: 0 },
  });
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!logoFile);

  const onSubmit = async (data: any) => {
    try {
      if (brand) { await trustedBrandService.update(brand.id, data, logoFile || undefined); toast.success('Brand updated'); }
      else { await trustedBrandService.create(data, logoFile || undefined); toast.success('Brand created'); }
      qc.invalidateQueries({ queryKey: ['trusted-brands'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving brand'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{brand ? 'Edit Brand' : 'New Brand'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Company Logo" currentUrl={brand?.logo} onChange={setLogoFile} accept="image/*" />
          <div><label className="label">Company Name *</label><input {...register('name', { required: true })} className="input" /></div>
          <div><label className="label">Website URL</label><input {...register('website')} className="input" placeholder="https://…" /></div>
          <div><label className="label">Alt Text</label><input {...register('altText')} className="input" /></div>
          <div><label className="label">Display Order</label><input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('published')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-gray-300">Show in marquee</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save Brand'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrustedBrands() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditBrand(undefined); setFormOpen(true); });
  const [editBrand, setEditBrand] = useState<TrustedBrand | undefined>();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  useEffect(() => { document.title = 'Trusted By · Connect Digitals'; }, []);

  const { data: rawBrands = [], isLoading } = useQuery<TrustedBrand[]>({
    queryKey: ['trusted-brands'],
    queryFn: async () => { const res = await trustedBrandService.getAll(); return res.data.data; },
  });

  const onReorder = useCallback(async (items: { id: string; displayOrder: number }[]) => {
    await trustedBrandService.reorder(items);
    qc.invalidateQueries({ queryKey: ['trusted-brands'] });
    toast.success('Order saved');
  }, [qc]);

  const { items, syncItems, handleDragEnd, selected, toggleSelect, selectAll, clearSelection, isSelected, isSaving, selectedCount } = useSortableList<TrustedBrand>(rawBrands, onReorder);
  useEffect(() => { syncItems(rawBrands); }, [rawBrands]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => { for (const id of ids) await trustedBrandService.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trusted-brands'] }); toast.success('Deleted'); setDeleteIds([]); setConfirmBulk(false); clearSelection(); },
    onError: () => toast.error('Failed to delete'),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDndEnd = (e: DragEndEvent) => { if (e.over && e.active.id !== e.over.id) handleDragEnd(String(e.active.id), String(e.over.id)); };

  return (
    <div>
      <PageHeader title="Trusted By" subtitle={`${items.length} brand${items.length !== 1 ? 's' : ''}${isSaving ? ' · Saving…' : ''}`} viewUrl="https://web.bereketfikre.et/#about"
        action={<button onClick={() => { setEditBrand(undefined); setFormOpen(true); }} className="btn-primary">+ Add Brand</button>} />

      <BulkActionBar count={selectedCount} totalCount={items.length} onClear={clearSelection} onSelectAll={selectAll} actions={[
        { label: 'Delete Selected', danger: true, onClick: () => { setDeleteIds(Array.from(selected)); setConfirmBulk(true); } },
        { label: 'Show Selected', onClick: async () => { for (const id of selected) await trustedBrandService.update(id, { published: true }); qc.invalidateQueries({ queryKey: ['trusted-brands'] }); clearSelection(); toast.success('Updated'); } },
        { label: 'Hide Selected', onClick: async () => { for (const id of selected) await trustedBrandService.update(id, { published: false }); qc.invalidateQueries({ queryKey: ['trusted-brands'] }); clearSelection(); toast.success('Updated'); } },
      ]} />

      {isLoading ? <div className="text-gray-500 text-sm">Loading…</div>
      : items.length === 0 ? <EmptyState variant="brands" title="No Partner Brands Yet" description="Add logos of clients and partners." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Brand</button>} />
      : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((brand) => (
                <SortableItem key={brand.id} id={brand.id} selected={isSelected(brand.id)} onSelect={() => toggleSelect(brand.id)}>
                  {(dragProps) => (
                    <div className="card flex items-center gap-3">
                      <button type="button" {...dragProps} className="text-gray-600 hover:text-gray-300 cursor-grab active:cursor-grabbing shrink-0 touch-none">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16"/></svg>
                      </button>
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={brand.logo} alt={brand.altText || brand.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{brand.name}</p>
                        {brand.website && <p className="text-xs text-gray-500 truncate">{brand.website}</p>}
                        <span className={`mt-1 inline-block ${brand.published ? 'badge-published' : 'badge-unpublished'}`}>{brand.published ? 'Visible' : 'Hidden'}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => { setEditBrand(brand); setFormOpen(true); }} className="btn-ghost text-xs px-2.5 py-1">Edit</button>
                        <button onClick={() => { setDeleteIds([brand.id]); setConfirmBulk(true); }} className="btn-danger text-xs px-2.5 py-1">Del</button>
                      </div>
                    </div>
                  )}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {formOpen && <BrandForm brand={editBrand} onClose={() => { setFormOpen(false); setEditBrand(undefined); }} />}
      <ConfirmDialog isOpen={confirmBulk} message={`Delete ${deleteIds.length} brand${deleteIds.length !== 1 ? 's' : ''}?`}
        onConfirm={() => deleteMutation.mutate(deleteIds)} onCancel={() => { setConfirmBulk(false); setDeleteIds([]); }} loading={deleteMutation.isPending} />
    </div>
  );
}
