import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      if (item) {
        await testimonialService.update(item.id, data, photoFile || undefined);
        toast.success('Testimonial updated');
      } else {
        await testimonialService.create(data, photoFile || undefined);
        toast.success('Testimonial created');
      }
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{item ? 'Edit Testimonial' : 'New Testimonial'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Client Photo / Logo" currentUrl={item?.clientPhoto} onChange={setPhotoFile} />
          <div>
            <label className="label">Client Name *</label>
            <input {...register('clientName', { required: true })} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Position / Role</label>
              <input {...register('position')} className="input" placeholder="e.g. CEO" />
            </div>
            <div>
              <label className="label">Company</label>
              <input {...register('company')} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Review *</label>
            <textarea {...register('review', { required: true })} className="input" rows={4} placeholder="What did the client say?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rating (1–5)</label>
              <input {...register('rating', { valueAsNumber: true })} type="number" className="input" min={1} max={5} />
            </div>
            <div>
              <label className="label">External Link (optional)</label>
              <input {...register('href')} className="input" placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="label">Display Order</label>
            <input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('published')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-gray-300">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('featured')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : 'Save Testimonial'}
            </button>
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { document.title = 'Testimonials · Connect Digitals'; }, []);

  const { data: items = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => { const res = await testimonialService.getAll(); return res.data.data; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle={`${items.length} testimonial${items.length !== 1 ? 's' : ''}`}
        viewUrl="https://web.bereketfikre.et/#testimonials"
        action={<button onClick={() => { setEditItem(undefined); setFormOpen(true); }} className="btn-primary">+ Add Testimonial</button>}
      />

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState variant="testimonials" title="No Testimonials Yet" description="Add reviews from your clients to build trust on your website." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Testimonial</button>} />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden shrink-0">
                {item.clientPhoto && (
                  <img src={item.clientPhoto} alt={item.clientName} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
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
                <button onClick={() => setDeleteId(item.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && <TestimonialForm item={editItem} onClose={() => { setFormOpen(false); setEditItem(undefined); }} />}
      <ConfirmDialog
        isOpen={!!deleteId}
        message="Delete this testimonial?"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
