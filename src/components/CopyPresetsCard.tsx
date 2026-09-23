import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Hash,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { ClientBrandKit, CopyCategory, CopyPresetItem } from '../types/brandKit';

interface CopyPresetsCardProps {
  client: ClientBrandKit;
  onUpdatePresets: (presets: CopyPresetItem[]) => void;
}

export const CopyPresetsCard: React.FC<CopyPresetsCardProps> = ({
  client,
  onUpdatePresets,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CopyPresetItem | null>(null);

  // Form states for Add/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<CopyCategory>('Caption Preset');
  const [formContent, setFormContent] = useState('');
  const [formTags, setFormTags] = useState('');

  const categories: string[] = [
    'All',
    'Instagram Bio',
    'Elevator Pitch',
    'Caption Preset',
    'DM Template',
    'Boilerplate',
  ];

  // Copy handler with feedback
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Caption Preset');
    setFormContent('');
    setFormTags('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CopyPresetItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormContent(item.content);
    setFormTags(item.tags ? item.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this communication preset?')) {
      const updated = client.copyPresets.filter((p) => p.id !== id);
      onUpdatePresets(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingItem) {
      // Update
      const updated = client.copyPresets.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              title: formTitle.trim(),
              category: formCategory,
              content: formContent.trim(),
              tags: tagsArray,
            }
          : p
      );
      onUpdatePresets(updated);
    } else {
      // Add
      const newItem: CopyPresetItem = {
        id: `cp-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        content: formContent.trim(),
        tags: tagsArray,
      };
      onUpdatePresets([newItem, ...client.copyPresets]);
    }

    setIsModalOpen(false);
  };

  const filteredPresets =
    selectedCategory === 'All'
      ? client.copyPresets
      : client.copyPresets.filter((p) => p.category === selectedCategory);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all"
      style={{
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-sm font-bold">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Communication &amp; Copy Presets</span>
              <span className="rounded-full bg-zinc-900 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                1-Click Copy
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Standardized bios, boilerplates, and campaign captions ready for instant deployment.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Copy Preset</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
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
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Presets List */}
      <div className="mt-4 space-y-4">
        {filteredPresets.map((preset) => {
          const isCopied = copiedId === preset.id;
          const charCount = preset.content.length;
          const wordCount = preset.content.trim().split(/\s+/).filter(Boolean).length;

          return (
            <div
              key={preset.id}
              className="group relative rounded-xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-white/25 hover:bg-slate-900/90"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {preset.title}
                  </span>
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                    {preset.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {charCount} chars &bull; {wordCount} words
                  </span>

                  <button
                    onClick={() => handleOpenEditModal(preset)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Edit Preset"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete Preset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Primary 1-Click Copy Button */}
                  <button
                    onClick={() => handleCopy(preset.id, preset.content)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/40'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Text Body Box */}
              <div className="mt-3 rounded-lg border border-white/5 bg-slate-950 p-3.5">
                <pre className="font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                  {preset.content}
                </pre>
              </div>

              {/* Tags */}
              {preset.tags && preset.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {preset.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                    >
                      <Hash className="h-2.5 w-2.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredPresets.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-xs text-slate-400">No communication presets found in this category.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create your first preset</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/20 bg-slate-950 p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-y-auto"
            style={{ boxShadow: `0 0 50px -10px ${client.highlightGlow}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingItem ? 'Edit Copy Preset' : 'Create New Brand Copy Preset'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Preset Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Ganpati Teaser Reel Caption Hook"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as CopyCategory)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Instagram Bio">Instagram Bio</option>
                  <option value="Elevator Pitch">Elevator Pitch</option>
                  <option value="Caption Preset">Caption Preset</option>
                  <option value="DM Template">DM Template</option>
                  <option value="Boilerplate">Boilerplate</option>
                  <option value="Hashtag Set">Hashtag Set</option>
                  <option value="Press Notice">Press Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Preset Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Type or paste the brand copy preset..."
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 font-sans text-xs text-white leading-relaxed focus:outline-none focus:border-amber-400"
                />
                <div className="mt-1 text-right text-[11px] font-mono text-slate-400">
                  {formContent.length} characters
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
                  placeholder="e.g. Social, Festive, Instagram, Pooja"
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-lg"
                  style={{
                    backgroundColor: client.primaryColor,
                  }}
                >
                  <Check className="h-4 w-4" />
                  <span>{editingItem ? 'Save Changes' : 'Create Preset'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
