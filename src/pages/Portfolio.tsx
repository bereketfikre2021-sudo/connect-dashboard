import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { portfolioService } from '@/services/cms.service';
import { PortfolioProject } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';
import SortableItem from '@/components/ui/SortableItem';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortableList } from '@/hooks/useSortableList';

const CATEGORIES = [
  { value: 'brand-design', label: 'Brand Design' },
  { value: 'social-media-design', label: 'Social Media Design' },
  { value: 'packaging-environmental-design', label: 'Packaging & Environmental' },
  { value: 'print-layout', label: 'Print & Layout' },
  { value: 'web-ui-design', label: 'Web & UI Design' },
];

function ProjectForm({ project, onClose }: { project?: PortfolioProject; onClose: () => void }) {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: project ? {
      title: project.title, slug: project.slug, category: project.category,
      client: project.client, industry: project.industry, year: project.year,
      shortDescription: project.shortDescription, fullDescription: project.fullDescription,
      projectUrl: project.projectUrl, altText: project.altText,
      caseStudyChallenge: project.caseStudyChallenge, caseStudySolution: project.caseStudySolution,
      featured: project.featured, status: (project as any).status || (project.published ? 'published' : 'draft'),
      displayOrder: project.displayOrder, seoTitle: project.seoTitle, seoDescription: project.seoDescription,
    } : { category: 'brand-design', status: 'published', featured: false, displayOrder: 0 },
  });
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!imageFile);

  const onSubmit = async (data: any) => {
    try {
      if (project) { await portfolioService.update(project.id, data, imageFile || undefined); toast.success('Project updated'); }
      else { await portfolioService.create(data, imageFile || undefined); toast.success('Project created'); }
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving project'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Thumbnail" currentUrl={project?.thumbnail} onChange={setImageFile} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" /></div>
            <div><label className="label">Slug</label><input {...register('slug')} className="input" placeholder="auto-generated" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category *</label><select {...register('category', { required: true })} className="input">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
            <div><label className="label">Client</label><input {...register('client')} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Industry</label><input {...register('industry')} className="input" /></div>
            <div><label className="label">Year</label><input {...register('year', { valueAsNumber: true })} type="number" className="input" /></div>
          </div>
          <div><label className="label">Short Description</label><input {...register('shortDescription')} className="input" /></div>
          <div><label className="label">Full Description</label><textarea {...register('fullDescription')} className="input" rows={4} /></div>
          <div><label className="label">Project URL</label><input {...register('projectUrl')} className="input" /></div>
          <div><label className="label">Alt Text</label><input {...register('altText')} className="input" /></div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Case Study</p>
            <div><label className="label">Challenge</label><textarea {...register('caseStudyChallenge')} className="input" rows={3} /></div>
            <div className="mt-3"><label className="label">Solution</label><textarea {...register('caseStudySolution')} className="input" rows={3} /></div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">SEO</p>
            <div><label className="label">SEO Title</label><input {...register('seoTitle')} className="input" /></div>
            <div className="mt-3"><label className="label">SEO Description</label><textarea {...register('seoDescription')} className="input" rows={2} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div><label className="label">Display Order</label><input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} /></div>
            <div><label className="label">Status</label><select {...register('status')} className="input"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input {...register('featured')} type="checkbox" className="w-4 h-4 rounded accent-primary" /><span className="text-sm text-gray-300">Featured</span></label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : 'Save Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditProject(undefined); setFormOpen(true); });
  const [editProject, setEditProject] = useState<PortfolioProject | undefined>();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { document.title = 'Projects · Connect Digitals'; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio', { search, category, page }],
    queryFn: async () => { const res = await portfolioService.getAll({ search, category, page, limit: 12 }); return res.data; },
  });
  const projects: PortfolioProject[] = data?.data || [];
  const pagination = data?.pagination;
  const canDrag = !search && !category && page === 1;

  const onReorder = useCallback(async (items: { id: string; displayOrder: number }[]) => {
    await portfolioService.reorder(items);
    qc.invalidateQueries({ queryKey: ['portfolio'] });
    toast.success('Order saved');
  }, [qc]);

  const { items, syncItems, handleDragEnd, selected, toggleSelect, selectAll, clearSelection, isSelected, isSaving, selectedCount } = useSortableList<PortfolioProject>(projects, onReorder);
  useEffect(() => { syncItems(projects); }, [projects]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => { for (const id of ids) await portfolioService.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['portfolio'] }); toast.success('Deleted'); setDeleteIds([]); setConfirmBulk(false); clearSelection(); },
    onError: () => toast.error('Failed to delete'),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDndEnd = (e: DragEndEvent) => { if (e.over && e.active.id !== e.over.id) handleDragEnd(String(e.active.id), String(e.over.id)); };

  const grid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((project) => (
        <SortableItem key={project.id} id={project.id} selected={isSelected(project.id)} onSelect={() => toggleSelect(project.id)}>
          {(dragProps) => (
            <div className="card flex flex-col gap-3">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                <img src={project.thumbnail} alt={project.altText || project.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                {canDrag && (
                  <button type="button" {...dragProps} className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-lg text-white cursor-grab active:cursor-grabbing touch-none">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16"/></svg>
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{project.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{project.client || '—'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {(() => { const s = (project as any).status || (project.published ? 'published' : 'draft'); const colors: Record<string, string> = { published: 'badge-published', draft: 'badge-draft', archived: 'bg-gray-700/50 text-gray-400 border border-gray-600/30 text-xs px-2 py-0.5 rounded-full' }; return <span className={colors[s] || 'badge-draft'}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>; })()}
                  <span className="text-xs text-gray-600 capitalize">{project.category.replace(/-/g, ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditProject(project); setFormOpen(true); }} className="btn-ghost text-xs flex-1">Edit</button>
                <button onClick={() => { setDeleteIds([project.id]); setConfirmBulk(true); }} className="btn-danger text-xs flex-1">Delete</button>
              </div>
            </div>
          )}
        </SortableItem>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader title="Projects" subtitle={`${pagination?.total ?? items.length} project${(pagination?.total ?? items.length) !== 1 ? 's' : ''}${isSaving ? ' · Saving…' : ''}`} viewUrl="https://web.bereketfikre.et/#portfolio"
        action={<button onClick={() => { setEditProject(undefined); setFormOpen(true); }} className="btn-primary">+ Add Project</button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-xs" placeholder="Search projects…" />
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <BulkActionBar count={selectedCount} totalCount={items.length} onClear={clearSelection} onSelectAll={selectAll} actions={[
        { label: 'Delete Selected', danger: true, onClick: () => { setDeleteIds(Array.from(selected)); setConfirmBulk(true); } },
        { label: 'Publish Selected', onClick: async () => { for (const id of selected) await portfolioService.update(id, { status: 'published', published: true }); qc.invalidateQueries({ queryKey: ['portfolio'] }); clearSelection(); toast.success('Published'); } },
        { label: 'Draft Selected', onClick: async () => { for (const id of selected) await portfolioService.update(id, { status: 'draft', published: false }); qc.invalidateQueries({ queryKey: ['portfolio'] }); clearSelection(); toast.success('Set to draft'); } },
        { label: 'Archive Selected', onClick: async () => { for (const id of selected) await portfolioService.update(id, { status: 'archived', published: false }); qc.invalidateQueries({ queryKey: ['portfolio'] }); clearSelection(); toast.success('Archived'); } },
        { label: 'Feature Selected', onClick: async () => { for (const id of selected) await portfolioService.update(id, { featured: true }); qc.invalidateQueries({ queryKey: ['portfolio'] }); clearSelection(); toast.success('Featured'); } },
      ]} />

      {isLoading ? <div className="text-gray-500 text-sm">Loading…</div>
      : items.length === 0 ? <EmptyState variant="portfolio" title="No Portfolio Projects Yet" description="Add your first project." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Project</button>} />
      : canDrag ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>{grid}</SortableContext>
        </DndContext>
      ) : grid}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs">← Prev</button>
          <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs">Next →</button>
        </div>
      )}

      {formOpen && <ProjectForm project={editProject} onClose={() => { setFormOpen(false); setEditProject(undefined); }} />}
      <ConfirmDialog isOpen={confirmBulk} message={`Delete ${deleteIds.length} project${deleteIds.length !== 1 ? 's' : ''}? Images will be removed from Cloudinary.`}
        onConfirm={() => deleteMutation.mutate(deleteIds)} onCancel={() => { setConfirmBulk(false); setDeleteIds([]); }} loading={deleteMutation.isPending} />
    </div>
  );
}
