import React from 'react';
import { ContentItem, Brand } from '../types/content';
import {
  Calendar,
  Eye,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Share2,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface ContentCardProps {
  item: ContentItem;
  brand: Brand;
  isSelected?: boolean;
  onSelect: () => void;
  onEditMetrics: (item: ContentItem) => void;
  onEditContent: (item: ContentItem) => void;
  onDeleteContent: (item: ContentItem) => void;
  onSyncCalendar?: (item: ContentItem) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  brand,
  isSelected,
  onSelect,
  onEditMetrics,
  onEditContent,
  onDeleteContent,
  onSyncCalendar,
}) => {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'published':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          label: 'Published',
        };
      case 'scheduled':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          label: 'Scheduled',
        };
      case 'in_review':
        return {
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          label: 'In Client Review',
        };
      case 'scripting':
        return {
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          label: 'Scripting',
        };
      default:
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          label: 'Available Asset',
        };
    }
  };

  const badge = getStatusBadge();
  const interactions = item.likes + item.comments + item.shares + item.inquiries;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-amber-500/80 bg-slate-900/90 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/50'
          : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Top Header: Number, Status & Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
            #{item.itemNumber}
          </span>
          <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditContent(item);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
            title="Edit Details"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteContent(item);
            }}
            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
            title="Delete Item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-amber-300 transition-colors">
        {item.title}
      </h3>

      {/* Creative Notes */}
      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {item.notes || 'No specific creative notes added.'}
      </p>

      {/* Verified Views & Follower impact banner */}
      <div className="mt-4 rounded-xl border border-slate-800/90 bg-slate-900/80 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400">Verified Views (Admin Logged)</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditMetrics(item);
            }}
            className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
          >
            Update Views
          </button>
        </div>

        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-mono text-xl font-extrabold text-cyan-300">
            {item.views.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {interactions > 0 ? `${interactions.toLocaleString()} interactions` : '0 int.'}
          </span>
        </div>

        {/* Small stats strip */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Heart className="h-2.5 w-2.5 text-rose-400" /> {item.likes.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-2.5 w-2.5 text-sky-400" /> {item.comments}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-2.5 w-2.5 text-emerald-400" /> {item.shares}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            {item.inquiries} leads
          </span>
        </div>
      </div>

      {/* Footer: Date & Calendar indicator */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 font-mono text-slate-300">
          <Calendar className="h-3 w-3 text-blue-400" />
          {item.targetDate || 'Flexible'} {item.deadlineTime ? `@ ${item.deadlineTime}` : ''}
        </span>

        {item.calendarEventId ? (
          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            Calendar Synced
          </span>
        ) : onSyncCalendar ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSyncCalendar(item);
            }}
            className="text-[10px] font-semibold text-blue-400 hover:text-blue-300"
          >
            + Add to Calendar
          </button>
        ) : null}
      </div>
    </div>
  );
};
