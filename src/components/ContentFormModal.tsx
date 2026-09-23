import React, { useState, useEffect } from 'react';
import { ContentItem, ContentStatus, PlatformType } from '../types/content';
import { X, Save, Video, Calendar, Sparkles } from 'lucide-react';

interface ContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  item?: ContentItem | null;
  nextItemNumber: number;
  onSave: (item: ContentItem) => void;
}

export const ContentFormModal: React.FC<ContentFormModalProps> = ({
  isOpen,
  onClose,
  brandId,
  item,
  nextItemNumber,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(item?.title || '');
  const [mediaUrl, setMediaUrl] = useState(item?.mediaUrl || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [status, setStatus] = useState<ContentStatus>(item?.status || 'available');
  const [platform, setPlatform] = useState<PlatformType>(item?.platform || 'Instagram Reel');
  const [targetDate, setTargetDate] = useState(
    item?.targetDate || new Date().toISOString().split('T')[0]
  );
  const [deadlineTime, setDeadlineTime] = useState(item?.deadlineTime || '18:00');
  const [views, setViews] = useState<number>(item?.views || 0);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setMediaUrl(item.mediaUrl);
      setNotes(item.notes);
      setStatus(item.status);
      setPlatform(item.platform);
      setTargetDate(item.targetDate);
      setDeadlineTime(item.deadlineTime || '18:00');
      setViews(item.views);
    } else {
      setTitle('');
      setMediaUrl('');
      setNotes('');
      setStatus('available');
      setPlatform('Instagram Reel');
      setTargetDate(new Date().toISOString().split('T')[0]);
      setDeadlineTime('18:00');
      setViews(0);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedItem: ContentItem = {
      id: item ? item.id : `reel-${Date.now()}`,
      brandId,
      itemNumber: item ? item.itemNumber : nextItemNumber,
      title: title.trim(),
      mediaUrl: mediaUrl.trim(),
      notes: notes.trim(),
      status,
      platform,
      targetDate,
      deadlineTime,
      views: Number(views) || 0,
      likes: item ? item.likes : 0,
      reach: item ? item.reach : 0,
      comments: item ? item.comments : 0,
      shares: item ? item.shares : 0,
      inquiries: item ? item.inquiries : 0,
      calendarEventId: item?.calendarEventId,
      taskId: item?.taskId,
      lastNotifiedAt: item?.lastNotifiedAt,
      metricHistory: item ? item.metricHistory : [],
      createdAt: item ? item.createdAt : new Date().toISOString(),
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl sm:rounded-3xl border border-white/20 bg-zinc-950 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
              #{item ? item.itemNumber : nextItemNumber}
            </span>
            <h3 className="text-base font-bold text-slate-100">
              {item ? 'Edit Content Creative' : 'Add New Content Creative'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-slate-300">Creative Title / Video Name*</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Aarti set plate silver reel"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Creative Asset Link (Google Photos, Drive, Reel)*
            </label>
            <input
              type="url"
              required
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://photos.google.com/..."
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              >
                <option value="available">Available Creative</option>
                <option value="scripting">Scripting / Pre-prod</option>
                <option value="in_review">In Client Review</option>
                <option value="scheduled">Scheduled for Release</option>
                <option value="published">Published Live</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              >
                <option value="Instagram Reel">Instagram Reel</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="TikTok">TikTok</option>
                <option value="Meta Ad">Meta Ad / Dark Post</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Target Release Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              >
              </input>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Preferred Publish Time</label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">
              Verified Views (Personally Verified &amp; Updated by Admin)
            </label>
            <input
              type="number"
              min="0"
              value={views}
              onChange={(e) => setViews(parseInt(e.target.value) || 0)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-sm text-cyan-300 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Creative Strategy Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key talking points, audio hook, festive Ganpati context, or jewelry specs..."
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Save className="h-4 w-4" />
              <span>Save Creative</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
