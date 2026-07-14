import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

function BlogForm({ post, onClose }: { post?: BlogPost; onClose: () => void }) {
  const qc = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { register, handleSubmit, watch, formState: { isSubmitting, isDirty } } = useForm({
    defaultValues: post ? {
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      category: post.category, author: post.author, status: post.status,
      published: post.published, displayOrder: post.displayOrder,
      seoTitle: post.seoTitle, seoDescription: post.seoDescription,
      tags: post.tags?.join(', '),
    } : { status: 'draft', published: false, author: 'Connect Digitals', displayOrder: 0 },
  });

  const status = watch('status');
  const guardedClose = useUnsavedWarning(isDirty, onClose, !!imageFile);

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      published: data.status === 'published',
    };
    try {
      if (post) {
        await blogService.update(post.id, payload, imageFile || undefined);
        toast.success('Post updated');
      } else {
        await blogService.create(payload, imageFile || undefined);
        toast.success('Post created');
      }
      qc.invalidateQueries({ queryKey: ['blog'] });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving post');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-white">{post ? 'Edit Post' : 'New Blog Post'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Featured Image" currentUrl={post?.featuredImage} onChange={setImageFile} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title *</label>
              <input {...register('title', { required: true })} className="input" />
            </div>
            <div>
              <label className="label">Slug</label>
              <input {...register('slug')} className="input" placeholder="auto-generated" />
            </div>
          </div>

          <div>
            <label className="label">Excerpt</label>
            <input {...register('excerpt')} className="input" placeholder="Short summary shown in cards" />
          </div>

          <div>
            <label className="label">Content *</label>
            <textarea
              {...register('content', { required: true })}
              className="input font-mono text-xs"
              rows={12}
              placeholder="Write your article here. Use blank lines to separate paragraphs."
            />
            <p className="text-xs text-gray-600 mt-1">Separate paragraphs with a blank line. Reading time is auto-calculated.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <input {...register('category')} className="input" placeholder="e.g. Branding" />
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input {...register('tags')} className="input" placeholder="design, branding, tips" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Author</label>
              <input {...register('author')} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
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

          <div>
            <label className="label">Display Order</label>
            <input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input max-w-xs" min={0} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : status === 'published' ? 'Publish Post' : status === 'scheduled' ? 'Schedule Post' : 'Save Draft'}
            </button>
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { document.title = 'Blog · Connect Digitals'; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['blog', { search, status: statusFilter, page }],
    queryFn: async () => {
      const res = await blogService.getAll({ search, status: statusFilter || undefined, page, limit: 10 });
      return res.data;
    },
  });

  const posts: BlogPost[] = data?.data || [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog'] }); toast.success('Post deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={pagination ? `${pagination.total} post${pagination.total !== 1 ? 's' : ''}` : ''}
        viewUrl="https://web.bereketfikre.et/#portfolio"
        action={<button onClick={() => { setEditPost(undefined); setFormOpen(true); }} className="btn-primary">+ New Post</button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-xs" placeholder="Search posts…" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input max-w-xs">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : posts.length === 0 ? (
        <EmptyState variant="blog" title="No Blog Posts Yet" description="Share your insights, design tips, and agency stories." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Write First Post</button>} />
      ) : (
        <>
          <div className="grid gap-3">
            {posts.map((post) => (
              <div key={post.id} className="card flex flex-col sm:flex-row sm:items-center gap-3">
                {post.featuredImage && (
                  <img src={post.featuredImage} alt={post.title} className="w-full sm:w-16 h-32 sm:h-12 object-cover rounded-lg shrink-0 bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{post.excerpt || '—'}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={post.status === 'published' ? 'badge-published' : post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full' : 'badge-draft'}>
                      {post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                    </span>
                    {post.readingTime && <span className="text-xs text-gray-600">{post.readingTime} min read</span>}
                    {post.publishedAt && <span className="text-xs text-gray-600">{new Date(post.publishedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditPost(post); setFormOpen(true); }} className="btn-ghost text-xs px-3 py-1.5">Edit</button>
                  <button onClick={() => setDeleteId(post.id)} className="btn-danger text-xs px-3 py-1.5">Delete</button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs">← Prev</button>
              <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-ghost px-3 py-1.5 text-xs">Next →</button>
            </div>
          )}
        </>
      )}

      {formOpen && <BlogForm post={editPost} onClose={() => { setFormOpen(false); setEditPost(undefined); }} />}
      <ConfirmDialog
        isOpen={!!deleteId}
        message="Delete this blog post?"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
