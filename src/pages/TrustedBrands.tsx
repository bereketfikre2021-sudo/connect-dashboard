import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
      if (brand) {
        await trustedBrandService.update(brand.id, data, logoFile || undefined);
        toast.success('Brand updated');
      } else {
        await trustedBrandService.create(data, logoFile || undefined);
        toast.success('Brand created');
      }
      qc.invalidateQueries({ queryKey: ['trusted-brands'] });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error saving brand');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="border-b border-gray-800 px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{brand ? 'Edit Brand' : 'New Brand'}</h2>
          <button onClick={guardedClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <ImageUpload label="Company Logo" currentUrl={brand?.logo} onChange={setLogoFile} accept="image/*" />
          <div>
            <label className="label">Company Name *</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div>
            <label className="label">Website URL</label>
            <input {...register('website')} className="input" placeholder="https://…" />
          </div>
          <div>
            <label className="label">Alt Text</label>
            <input {...register('altText')} className="input" placeholder="Company name for accessibility" />
          </div>
          <div>
            <label className="label">Display Order</label>
            <input {...register('displayOrder', { valueAsNumber: true })} type="number" className="input" min={0} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('published')} type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm text-gray-300">Show in marquee</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={guardedClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : 'Save Brand'}
            </button>
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  useEffect(() => { document.title = 'Trusted By · Connect Digitals'; }, []);

  const { data: brands = [], isLoading } = useQuery<TrustedBrand[]>({
    queryKey: ['trusted-brands'],
    queryFn: async () => { const res = await trustedBrandService.getAll(); return res.data.data; },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trustedBrandService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trusted-brands'] }); toast.success('Brand deleted'); setDeleteId(null); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div>
      <PageHeader
        title="Trusted By"
        subtitle={`${brands.length} brand${brands.length !== 1 ? 's' : ''}`}
        viewUrl="https://web.bereketfikre.et/#about"
        action={<button onClick={() => { setEditBrand(undefined); setFormOpen(true); }} className="btn-primary">+ Add Brand</button>}
      />

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : brands.length === 0 ? (
        <EmptyState variant="brands" title="No Partner Brands Yet" description="Add logos of clients and partners you've worked with." action={<button onClick={() => setFormOpen(true)} className="btn-primary">Add First Brand</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="card flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                <img src={brand.logo} alt={brand.altText || brand.name} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{brand.name}</p>
                {brand.website && <p className="text-xs text-gray-500 truncate">{brand.website}</p>}
                <span className={`mt-1 inline-block ${brand.published ? 'badge-published' : 'badge-unpublished'}`}>
                  {brand.published ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => { setEditBrand(brand); setFormOpen(true); }} className="btn-ghost text-xs px-2.5 py-1">Edit</button>
                <button onClick={() => setDeleteId(brand.id)} className="btn-danger text-xs px-2.5 py-1">Del</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && <BrandForm brand={editBrand} onClose={() => { setFormOpen(false); setEditBrand(undefined); }} />}
      <ConfirmDialog
        isOpen={!!deleteId}
        message="Delete this brand?"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
