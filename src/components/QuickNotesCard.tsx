import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Copy,
  Check,
  Pin,
  Sparkles,
  Tag,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { ClientBrandKit } from '../types/brandKit';

export interface QuickNoteSnippet {
  id: string;
  text: string;
  category: 'Idea' | 'Copy' | 'Asset' | 'General';
  isPinned?: boolean;
  createdAt: string;
}

interface QuickNotesCardProps {
  client: ClientBrandKit;
}

const DEFAULT_SNIPPETS: QuickNoteSnippet[] = [];

export const QuickNotesCard: React.FC<QuickNotesCardProps> = ({ client }) => {
  const storageKey = `brand_quick_notes_${client.id}`;

  const [notes, setNotes] = useState<QuickNoteSnippet[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return DEFAULT_SNIPPETS;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'Idea' | 'Copy' | 'Asset' | 'General'>('Idea');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Sync to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes, storageKey]);

  // When active client changes, reload client-specific notes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`brand_quick_notes_${client.id}`);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        setNotes(DEFAULT_SNIPPETS);
      }
    } catch (e) {
      console.error('Failed to reload notes for client', e);
    }
  }, [client.id]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newSnippet: QuickNoteSnippet = {
      id: `snippet-${Date.now()}`,
      text: newText.trim(),
      category: newCategory,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [newSnippet, ...prev]);
    setNewText('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleCopyNote = (snippet: QuickNoteSnippet) => {
    navigator.clipboard.writeText(snippet.text);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort notes: pinned first, then newest
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredNotes =
    selectedFilter === 'All'
      ? sortedNotes
      : sortedNotes.filter((n) => n.category === selectedFilter);

  const categories: Array<'All' | 'Idea' | 'Copy' | 'Asset' | 'General'> = [
    'All',
    'Idea',
    'Copy',
    'Asset',
    'General',
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Header with Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black shadow-md">
            <StickyNote className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Quick Notes &amp; Floating Snippets
              </h2>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-300">
                {notes.length} {notes.length === 1 ? 'idea' : 'ideas'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Transient creative scratchpad for {client.companyName} &bull; Persisted automatically to local storage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black px-3.5 py-2 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Snippet</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isActive = selectedFilter === cat;
            const count =
              cat === 'All'
                ? notes.length
                : notes.filter((n) => n.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive ? 'bg-black text-white' : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {notes.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Clear all quick notes for this brand?')) {
                setNotes([]);
              }
            }}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Inline Snippet Composer */}
      {isAdding && (
        <form
          onSubmit={handleAddNote}
          className="mt-4 rounded-2xl border border-white/20 bg-black/60 p-4 backdrop-blur-md shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              Capture Transient Idea
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <textarea
            autoFocus
            rows={3}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddNote(e);
              }
            }}
            placeholder="Type a fleeting brand idea, copy snippet, asset reminder, or campaign note..."
            className="mt-3 w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-xs text-white placeholder-zinc-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Category:</span>
              <div className="flex items-center gap-1">
                {(['Idea', 'Copy', 'Asset', 'General'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      newCategory === cat
                        ? 'bg-white text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-1.5 text-xs font-bold disabled:opacity-50 transition-all shadow-sm"
              >
                <Send className="h-3 w-3 stroke-[2.5]" />
                <span>Save Snippet</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Floating Snippets Grid */}
      <div className="mt-5">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-zinc-400">
              <StickyNote className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">No transient snippets</h3>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              Capture quick thoughts, copy variations, or visual asset reminders without cluttering formal presets.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-2 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Create First Snippet</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const isCopied = copiedId === note.id;
              const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={note.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    note.isPinned
                      ? 'border-white/30 shadow-[0_8px_25px_rgba(255,255,255,0.06)]'
                      : 'border-white/10 hover:border-white/25 shadow-md'
                  }`}
                  style={{
                    boxShadow: note.isPinned
                      ? '0 10px 30px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.15)'
                      : '0 8px 20px -8px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* Top Bar: Category Pill & Pin/Delete/Copy Actions */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-300 border border-white/10">
                      <Tag className="h-2.5 w-2.5" />
                      {note.category}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Pin Toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePin(note.id)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          note.isPinned
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={note.isPinned ? 'Unpin snippet' : 'Pin snippet to top'}
                      >
                        <Pin className="h-3 w-3 fill-current" />
                      </button>

                      {/* Copy to Clipboard */}
                      <button
                        type="button"
                        onClick={() => handleCopyNote(note)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isCopied
                            ? 'bg-emerald-400 text-black'
                            : 'text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Copy snippet"
                      >
                        {isCopied ? <Check className="h-3 w-3 stroke-[3]" /> : <Copy className="h-3 w-3" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="rounded-lg p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete snippet"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="my-2.5 text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-white selection:text-black">
                    {note.text}
                  </p>

                  {/* Footer Meta */}
                  <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] font-mono text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formattedDate}</span>
                    </div>
                    <span>{note.text.length} chars</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
