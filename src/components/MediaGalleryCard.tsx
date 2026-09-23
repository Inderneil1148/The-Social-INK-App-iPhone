import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Maximize2,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
  Eye,
} from 'lucide-react';
import { ClientBrandKit, MediaAssetItem, MediaCategory } from '../types/brandKit';

interface MediaGalleryCardProps {
  client: ClientBrandKit;
  onUpdateGallery: (gallery: MediaAssetItem[]) => void;
}

export const MediaGalleryCard: React.FC<MediaGalleryCardProps> = ({
  client,
  onUpdateGallery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewItem, setPreviewItem] = useState<MediaAssetItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding asset
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<MediaCategory>('Product');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDimensions, setFormDimensions] = useState('2400 x 2400');
  const [formTags, setFormTags] = useState('');

  const categories: string[] = ['All', 'Product', 'Campaign', 'Mockup', 'Packaging', 'Hero'];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: MediaAssetItem) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `${item.title.toLowerCase().replace(/\s+/g, '-')}.${(item.fileFormat || 'jpg').toLowerCase()}`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this asset from the media gallery?')) {
      const updated = client.mediaGallery.filter((m) => m.id !== id);
      onUpdateGallery(updated);
      if (previewItem?.id === id) setPreviewItem(null);
    }
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formImageUrl.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newAsset: MediaAssetItem = {
      id: `m-${Date.now()}`,
      title: formTitle.trim(),
      category: formCategory,
      imageUrl: formImageUrl.trim(),
      dimensions: formDimensions.trim() || 'High-Res',
      fileFormat: 'JPG',
      fileSize: '3.2 MB',
      tags: tagsArray,
    };

    onUpdateGallery([newAsset, ...client.mediaGallery]);
    setFormTitle('');
    setFormImageUrl('');
    setIsAddModalOpen(false);
  };

  const filteredAssets =
    selectedCategory === 'All'
      ? client.mediaGallery
      : client.mediaGallery.filter((m) => m.category === selectedCategory);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all"
      style={{
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Toast Feedback */}
      {copiedId && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-2xl">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>Asset URL copied to clipboard!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-sm font-bold">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Brand Media Gallery &amp; Campaign Assets</span>
              <span className="rounded-full bg-zinc-900 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                {client.mediaGallery.length} High-Res Assets
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Visual library of approved editorial photography, product packshots &amp; mockups.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="mt-4 flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Visual Asset Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
          >
            {/* Image Viewport */}
            <div
              onClick={() => setPreviewItem(asset)}
              className="relative h-48 w-full cursor-pointer overflow-hidden bg-slate-900"
            >
              <img
                src={asset.imageUrl}
                alt={asset.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                <span className="flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/30 shadow-xl">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Inspect High-Res</span>
                </span>
              </div>

              {/* Badge top left */}
              <div className="absolute top-2.5 left-2.5">
                <span className="rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-200 border border-white/10">
                  {asset.category}
                </span>
              </div>
            </div>

            {/* Content & Details */}
            <div className="p-3.5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs font-bold text-white truncate" title={asset.title}>
                  {asset.title}
                </h4>
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{asset.dimensions || 'High-Res'}</span>
                  <span>{asset.fileFormat || 'JPG'} &bull; {asset.fileSize || '3 MB'}</span>
                </div>
              </div>

              {/* Action Strip */}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                <button
                  onClick={() => handleCopy(asset.id, asset.imageUrl)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy URL</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(asset)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Download Asset"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete Asset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-xs text-slate-400">No media assets in this category.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add brand media asset</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative max-w-4xl w-full rounded-2xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <h3 className="text-sm font-bold text-white">{previewItem.title}</h3>
                <span className="text-xs font-mono text-slate-400">
                  {previewItem.category} &bull; {previewItem.dimensions || 'High-Res'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(previewItem.id, previewItem.imageUrl)}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Asset Link</span>
                </button>
                <button
                  onClick={() => handleDownload(previewItem)}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-950"
                  style={{ backgroundColor: client.primaryColor }}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* High-Res Image Viewport */}
            <div className="max-h-[70vh] flex items-center justify-center bg-black p-4 overflow-auto">
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Media Asset Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-950 p-6 shadow-2xl"
            style={{ boxShadow: `0 0 50px -10px ${client.highlightGlow}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Add Brand Media Asset</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAsset} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Asset Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Aarti Silver Plate Studio Packshot"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Image Direct URL
                </label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MediaCategory)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Product">Product</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Mockup">Mockup</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Hero">Hero</option>
                    <option value="Logo Variant">Logo Variant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formDimensions}
                    onChange={(e) => setFormDimensions(e.target.value)}
                    placeholder="3840 x 2160"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. Silver, Festive, Pooja, Macro"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2 text-xs font-bold text-slate-950"
                  style={{ backgroundColor: client.primaryColor }}
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
