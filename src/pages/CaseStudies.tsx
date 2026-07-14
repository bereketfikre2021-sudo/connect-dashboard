import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { caseStudyService } from '@/services/cms.service';
import { CaseStudy } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';

function CaseStudyForm({ item, onClose }: { item?: CaseStudy; onClose: () => void }) {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: item ? {
      title: item.title, slug: item.slug, client: item.client, industry: item.industry,
      overview: item.overview, research: item.research, strategy: item.strategy,
      designProcess: item.designProcess, solution: item.solution, results: item.results,
      conclusion: item.conclusion, published: item.published, displayOrder: item.displayOrder,
      seoTitle: item.seoTitle, seoDescription: item.seoDescription,
      challenge: item.challenge?.join('\n'), role: item.role?.join('\n'),
    } : { published: true, displayOrder: 0 },
  });
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!imageFile);

  const onSubmit = async (data: any) => {
    // Convert newline-separated strings to arrays
    const payload = {
      ...data,
      challenge: data.challenge ? data.challenge.split('\n').filter(Boolean) : [],
      role: data.role ? data.role.split('\n').filter(Boolean) : [],
    };
    try {
      if (item) {
        await caseStudyService.update(item.id, payload, imageFile || undefined);
        toast.success('Case study updated');
      } else {
        await caseStudyService.create(payload, imageFile || undefined);
        toast.success('Case study created');
      }
      qc.invalidateQueries({ queryKey: ['case-studies'] });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{item ? 'Edit Case Study' : 'New Case Study'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Hero Image" currentUrl={item?.heroImage} onChange={setImageFile} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input {...register('title', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input {...register('slug')} className="input" placeholder="auto-generated if empty" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client *</label>
              <input {...register('client', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Industry</label>
              <input {...register('industry')} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Overview</label>
            <textarea {...register('overview')} className="input" rows={3} placeholder="Project overview…" />
          </div>

          <div>
            <label className="label">Challenge (one per line)</label>
            <textarea {...register('challenge')} className="input" rows={3} placeholder="Challenge point 1&#10;Challenge point 2" />
          </div>

          <div>
            <label className="label">Research</label>
            <textarea {...register('research')} className="input" rows={3} />
          </div>

          <div>
            <label className="label">Strategy</label>
            <textarea {...register('strategy')} className="input" rows={3} />
          </div>

          <div>
            <label className="label">Design Process</label>
            <textarea {...register('designProcess')} className="input" rows={3} />
          </div>

          <div>
            <label className="label">Solution</label>
            <textarea {...register('solution')} className="input" rows={3} />
          </div>

          <div>
            <label className="label">Our Role (one per line)</label>
            <textarea {...register('role')} className="input" rows={3} placeholder="Role / deliverable 1&#10;Role / deliverable 2" />
          </div>

          <div>
            <label className="label">Results / Outcome</label>
            <textarea {...register('results')} className="input" rows={3} />
          </div>

          <div>
            <label className="label">Conclusion</label>
            <textarea {...register('conclusion')} className="input" rows={2} />
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">SEO</p>
            <div>
              <label className="label">SEO Title</label>
              <input {...register('seoTitle')} className="input" />
            </div>
            <div className="mt-3">
              <label className="label">SEO Description</label>
              <textarea {...register('seoDescription')} className="input" rows={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="label">Display Order</label>
              <input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input {...register('published')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-gray-300">Published</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : 'Save Case Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditItem(undefined); setFormOpen(true); });
  const [editItem, setEditItem] = useState<CaseStudy | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { document.title = 'Case Studies · Connect Digitals'; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['case-studies'],
    queryFn: async () => {
      const res = await caseStudyService.getAll();
      return res.data;
    },
  });

  const items: CaseStudy[] = data?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => caseStudyService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['case-studies'] }); toast.success('Deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div>
      <PageHeader
        title="Case Studies"
        subtitle={`${items.length} case ${items.length !== 1 ? 'studies' : 'study'}`}
        viewUrl="https://web.bereketfikre.et/#portfolio"
        action={<button onClick={() => { setEditItem(undefined); setFormOpen(true); }} className="btn-primary">+ Add Case Study</button>}
      />

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState variant="case-studies" title="No Case Studies Yet" description="Document your best work and show clients how you solve problems." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Case Study</button>} />
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col sm:flex-row sm:items-center gap-3">
              <img src={item.heroImage} alt={item.title} className="w-full sm:w-24 h-32 sm:h-16 object-cover rounded-lg shrink-0 bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.client}</p>
                <span className={`mt-1.5 inline-block ${item.published ? 'badge-published' : 'badge-unpublished'}`}>
                  {item.published ? 'Published' : 'Hidden'}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                <button onClick={() => setDeleteId(item.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && <CaseStudyForm item={editItem} onClose={() => { setFormOpen(false); setEditItem(undefined); }} />}
      <ConfirmDialog
        isOpen={!!deleteId}
        message="Delete this case study?"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
