import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDndSensors } from '@/hooks/useDndSensors';
import { useAutoOpen } from '@/hooks/useAutoOpen';
import { useUnsavedWarning } from '@/hooks/useUnsavedWarning';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { blogService } from '@/services/cms.service';
import { BlogPost } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ImageUpload from '@/components/ui/ImageUpload';
import EmptyState from '@/components/ui/EmptyState';
import SortableItem from '@/components/ui/SortableItem';
import BulkActionBar from '@/components/ui/BulkActionBar';
import { useSortableList } from '@/hooks/useSortableList';

function BlogForm({ post, onClose }: { post?: BlogPost; onClose: () => void }) {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { register, handleSubmit, watch, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: post ? {
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      category: post.category, author: post.author, status: post.status,
      published: post.published, displayOrder: post.displayOrder,
      seoTitle: post.seoTitle, seoDescription: post.seoDescription, tags: post.tags?.join(', '),
    } : { status: 'draft', published: false, author: 'Connect Digitals', displayOrder: 0 },
  });
  const status = watch('status');
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!imageFile);

  const onSubmit = async (data: any) => {
    const payload = { ...data, tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [], published: data.status === 'published' };
    try {
      if (post) { await blogService.update(post.id, payload, imageFile || undefined); toast.success('Post updated'); }
      else { await blogService.create(payload, imageFile || undefined); toast.success('Post created'); }
      qc.invalidateQueries({ queryKey: ['blog'] });
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error saving post'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{post ? 'Edit Post' : 'New Blog Post'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Featured Image" currentUrl={post?.featuredImage} onChange={setImageFile} />
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Title *</label><input {...register('title', { required: true })} className="input" /></div>
            <div><label className="label">Slug</label><input {...register('slug')} className="input" placeholder="auto-generated" /></div>
          </div>
          <div><label className="label">Excerpt</label><input {...register('excerpt')} className="input" /></div>
          <div><label className="label">Content *</label><textarea {...register('content', { required: true })} className="input font-mono text-xs" rows={12} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Category</label><input {...register('category')} className="input" /></div>
            <div><label className="label">Tags (comma separated)</label><input {...register('tags')} className="input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Author</label><input {...register('author')} className="input" /></div>
            <div><label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">SEO</p>
            <div><label className="label">SEO Title</label><input {...register('seoTitle')} className="input" /></div>
            <div className="mt-3"><label className="label">SEO Description</label><textarea {...register('seoDescription')} className="input" rows={2} /></div>
          </div>
          <div><label className="label">Display Order</label><input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input max-w-xs" min={0} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">{isSubmitting ? 'Saving…' : status === 'published' ? 'Publish' : status === 'scheduled' ? 'Schedule' : 'Save Draft'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Blog() {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  useAutoOpen(() => { setEditPost(undefined); setFormOpen(true); });
  const [editPost, setEditPost] = useState<BlogPost | undefined>();
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { document.title = 'Blog · Connect Digitals'; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['blog', { search, status: statusFilter, page }],
    queryFn: async () => { const res = await blogService.getAll({ search, status: statusFilter || undefined, page, limit: 10 }); return res.data; },
  });
  const posts: BlogPost[] = data?.data || [];
  const pagination = data?.pagination;
  const canDrag = !search && !statusFilter && page === 1;

  const onReorder = useCallback(async (items: { id: string; displayOrder: number }[]) => {
    await blogService.reorder(items);
    qc.invalidateQueries({ queryKey: ['blog'] });
    toast.success('Order saved');
  }, [qc]);

  const { items, syncItems, handleDragEnd, selected, toggleSelect, selectAll, clearSelection, isSelected, isSaving, selectedCount } = useSortableList<BlogPost>(posts, onReorder);
  useEffect(() => { syncItems(posts); }, [posts]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => { for (const id of ids) await blogService.delete(id); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog'] }); toast.success('Deleted'); setDeleteIds([]); setConfirmBulk(false); clearSelection(); },
    onError: () => toast.error('Failed to delete'),
  });

  const sensors = useDndSensors();
  const handleDndEnd = (e: DragEndEvent) => { if (e.over && e.active.id !== e.over.id) handleDragEnd(String(e.active.id), String(e.over.id)); };

  const list = (
    <div className="grid gap-3">
      {items.map((post) => (
        <SortableItem key={post.id} id={post.id} selected={isSelected(post.id)} onSelect={() => toggleSelect(post.id)}>
          {(dragProps) => (
            <div className="card flex flex-col sm:flex-row sm:items-center gap-3">
              {canDrag && (
                <button type="button" {...dragProps} className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-200 cursor-grab active:cursor-grabbing shrink-0 touch-none rounded-lg hover:bg-gray-700/50 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16"/></svg>
                </button>
              )}
              {post.featuredImage && <img src={post.featuredImage} alt={post.title} className="w-full sm:w-16 h-20 sm:h-12 object-cover rounded-lg shrink-0 bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{post.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{post.excerpt || '—'}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={post.status === 'published' ? 'badge-published' : post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full' : 'badge-draft'}>
                    {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                  </span>
                  {post.readingTime && <span className="text-xs text-gray-600">{post.readingTime} min read</span>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => { setEditPost(post); setFormOpen(true); }} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                <button onClick={() => { setDeleteIds([post.id]); setConfirmBulk(true); }} className="btn-danger text-xs px-3 py-1.5">Delete</button>
              </div>
            </div>
          )}
        </SortableItem>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader title="Blog" subtitle={`${pagination?.total ?? items.length} post${(pagination?.total ?? items.length) !== 1 ? 's' : ''}${isSaving ? ' · Saving…' : ''}`} viewUrl="https://web.bereketfikre.et/#portfolio"
        action={<button onClick={() => { setEditPost(undefined); setFormOpen(true); }} className="btn-primary">+ New Post</button>} />

      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-xs" placeholder="Search posts…" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      <BulkActionBar count={selectedCount} totalCount={items.length} onClear={clearSelection} onSelectAll={selectAll} actions={[
        { label: 'Delete Selected', danger: true, onClick: () => { setDeleteIds(Array.from(selected)); setConfirmBulk(true); } },
        { label: 'Publish Selected', onClick: async () => { for (const id of selected) await blogService.update(id, { status: 'published', published: true }); qc.invalidateQueries({ queryKey: ['blog'] }); clearSelection(); toast.success('Published'); } },
        { label: 'Draft Selected', onClick: async () => { for (const id of selected) await blogService.update(id, { status: 'draft', published: false }); qc.invalidateQueries({ queryKey: ['blog'] }); clearSelection(); toast.success('Set to draft'); } },
      ]} />

      {isLoading ? <div className="text-gray-500 text-sm">Loading…</div>
      : items.length === 0 ? <EmptyState variant="blog" title="No Blog Posts Yet" description="Share your insights." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Write First Post</button>} />
      : canDrag ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDndEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>{list}</SortableContext>
        </DndContext>
      ) : list}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs">← Prev</button>
          <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs">Next →</button>
        </div>
      )}

      {formOpen && <BlogForm post={editPost} onClose={() => { setFormOpen(false); setEditPost(undefined); }} />}
      <ConfirmDialog isOpen={confirmBulk} message={`Delete ${deleteIds.length} post${deleteIds.length !== 1 ? 's' : ''}?`}
        onConfirm={() => deleteMutation.mutate(deleteIds)} onCancel={() => { setConfirmBulk(false); setDeleteIds([]); }} loading={deleteMutation.isPending} />
    </div>
  );
}
