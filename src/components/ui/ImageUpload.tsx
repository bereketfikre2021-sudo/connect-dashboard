import { useRef, useState } from 'react';

interface Props {
  label?: string;
  currentUrl?: string | null;
  onChange: (file: File) => void;
  accept?: string;
  circle?: boolean;
}

export default function ImageUpload({ label = 'Image', currentUrl, onChange, accept = 'image/*', circle = false }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const displayUrl = preview || currentUrl;

  if (circle) {
    return (
      <div>
        <label className="label">{label}</label>
        <div
          onClick={() => inputRef.current?.click()}
          className="relative cursor-pointer group w-28 h-28"
        >
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-700 hover:border-primary overflow-hidden transition-colors flex items-center justify-center bg-gray-800">
            {displayUrl ? (
              <img src={displayUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl text-gray-600">+</span>
                <span className="text-xs text-gray-600">Upload</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
        </div>
        {displayUrl && (
          <button
            type="button"
            onClick={() => { setPreview(null); onChange(null as any); }}
            className="mt-1 text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 transition-colors overflow-hidden"
        style={{ minHeight: '120px' }}
      >
        {displayUrl ? (
          <img src={displayUrl} alt="preview" className="w-full h-40 object-cover rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <span className="text-3xl mb-2">📁</span>
            <p className="text-sm">Click to upload image</p>
            <p className="text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
      </div>
      {displayUrl && (
        <button
          type="button"
          onClick={() => { setPreview(null); onChange(null as any); }}
          className="mt-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  );
}
