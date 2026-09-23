import React, { useState } from 'react';
import { ContentItem, Brand, MetricUpdateRecord } from '../types/content';
import {
  Eye,
  Users,
  Heart,
  Share2,
  MessageCircle,
  TrendingUp,
  Save,
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ManualMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand;
  item?: ContentItem | null;
  onUpdateBrandFollowers: (newFollowersCount: number, note?: string) => void;
  onUpdateItemMetrics: (
    itemId: string,
    metrics: {
      views: number;
      likes: number;
      reach: number;
      comments: number;
      shares: number;
      inquiries: number;
      note?: string;
    }
  ) => void;
}

export const ManualMetricsModal: React.FC<ManualMetricsModalProps> = ({
  isOpen,
  onClose,
  brand,
  item,
  onUpdateBrandFollowers,
  onUpdateItemMetrics,
}) => {
  if (!isOpen) return null;

  // Active target can be either this specific item, or brand-wide followers
  const [activeTab, setActiveTab] = useState<'item' | 'brand'>(item ? 'item' : 'brand');

  // Item metrics state
  const [views, setViews] = useState<number>(item?.views || 0);
  const [likes, setLikes] = useState<number>(item?.likes || 0);
  const [reach, setReach] = useState<number>(item?.reach || 0);
  const [comments, setComments] = useState<number>(item?.comments || 0);
  const [shares, setShares] = useState<number>(item?.shares || 0);
  const [inquiries, setInquiries] = useState<number>(item?.inquiries || 0);
  const [itemNote, setItemNote] = useState<string>('');

  // Brand followers state
  const [followers, setFollowers] = useState<number>(brand.currentFollowers || 0);
  const [followerNote, setFollowerNote] = useState<string>('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Engagement calculation
  const totalInteractions = likes + comments + shares + inquiries;
  const engagementRate = views > 0 ? ((totalInteractions / views) * 100).toFixed(2) : '0.00';
  const viewFollowerRatio = brand.currentFollowers > 0 ? ((views / brand.currentFollowers) * 100).toFixed(1) : '0';

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    onUpdateItemMetrics(item.id, {
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      reach: Number(reach) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      inquiries: Number(inquiries) || 0,
      note: itemNote.trim() || undefined,
    });

    // Milestone celebration if views are substantial
    if (views >= 10000) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#38BDF8', '#10B981'],
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleSaveFollowers = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrandFollowers(Number(followers) || 0, followerNote.trim() || undefined);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D97706', '#38BDF8', '#8B5CF6'],
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-zinc-950 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3 sm:pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-slate-100">Manual Metrics Audit & Verification</h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Personal verified numbers for <strong className="text-amber-300">{brand.name}</strong>. No automated third-party scrapers.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="mt-3 sm:mt-4 flex border-b border-slate-800 text-xs sm:text-sm shrink-0 overflow-x-auto">
          {item && (
            <button
              onClick={() => setActiveTab('item')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
                activeTab === 'item'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Update Reel Views #{item.itemNumber}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('brand')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'brand'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Update Brand Follower Count</span>
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400 animate-bounce" />
            <h3 className="mt-3 text-lg font-bold text-slate-100">Metrics Successfully Updated!</h3>
            <p className="text-xs text-slate-400 mt-1">Logged directly to verified records and ready for Google Sheet sync.</p>
          </div>
        ) : activeTab === 'item' && item ? (
          /* Reel item metrics form */
          <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
            <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
              <span className="text-xs text-amber-400 uppercase font-semibold">Editing Reel #{item.itemNumber}</span>
              <p className="text-sm font-semibold text-slate-100">{item.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span>Platform: {item.platform}</span>
                <span>•</span>
                <span>Scheduled/Target Date: {item.targetDate || 'None'}</span>
              </div>
            </div>

            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Real Views Count (Verified by Admin)*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={views}
                  onChange={(e) => setViews(parseInt(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-cyan-500/40 bg-slate-900 px-3.5 py-2.5 font-mono text-lg font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  placeholder="e.g. 18450"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Personally verified view count on video
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  <span>Total Account Reach</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={reach}
                  onChange={(e) => setReach(parseInt(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 font-mono text-base font-semibold text-slate-100 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 25000"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Unique accounts reached
                </span>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  <Heart className="h-3 w-3 text-rose-400" /> Likes
                </label>
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 font-mono text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  <MessageCircle className="h-3 w-3 text-sky-400" /> Comments
                </label>
                <input
                  type="number"
                  min="0"
                  value={comments}
                  onChange={(e) => setComments(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 font-mono text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  <Share2 className="h-3 w-3 text-emerald-400" /> Shares
                </label>
                <input
                  type="number"
                  min="0"
                  value={shares}
                  onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 font-mono text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                  <Sparkles className="h-3 w-3 text-amber-400" /> Inquiries / Leads
                </label>
                <input
                  type="number"
                  min="0"
                  value={inquiries}
                  onChange={(e) => setInquiries(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-2 font-mono text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Calculated Performance Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-amber-950/40 p-3 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Total Interactions:</span>{' '}
                <span className="font-mono font-bold text-slate-200">{totalInteractions.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Engagement Rate:</span>{' '}
                <span className="font-mono font-bold text-cyan-300">{engagementRate}%</span>
              </div>
              <div>
                <span className="text-slate-400">View/Follower Ratio:</span>{' '}
                <span className="font-mono font-bold text-amber-300">{viewFollowerRatio}%</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Update Audit Note (Optional)</label>
              <input
                type="text"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="e.g. Verified after 48 hours festive spike"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder-slate-500"
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
              >
                <Save className="h-4 w-4" />
                <span>Save Verified Reel Views</span>
              </button>
            </div>
          </form>
        ) : (
          /* Brand followers form */
          <form onSubmit={handleSaveFollowers} className="mt-5 space-y-4">
            <div className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800">
              <span className="text-xs text-cyan-400 uppercase font-semibold">Brand Overview</span>
              <p className="text-base font-semibold text-slate-100">{brand.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{brand.category}</p>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Users className="h-4 w-4 text-amber-400" />
                <span>Current Verified Follower Count*</span>
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  min="0"
                  required
                  value={followers}
                  onChange={(e) => setFollowers(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-amber-500/40 bg-slate-900 px-3.5 py-3 font-mono text-xl font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g. 14850"
                />
                <div className="absolute right-3 top-3 text-xs text-slate-400">
                  Target: {brand.targetFollowers.toLocaleString()}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Target Progress:{' '}
                <strong className="text-slate-200 font-mono">
                  {((followers / (brand.targetFollowers || 1)) * 100).toFixed(1)}%
                </strong>{' '}
                of {brand.targetFollowers.toLocaleString()} milestone
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Audit / Update Note</label>
              <input
                type="text"
                value={followerNote}
                onChange={(e) => setFollowerNote(e.target.value)}
                placeholder="e.g. Verified by admin post Ganpati festival campaign"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* Follower history preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-xs font-semibold text-slate-300">Recent Follower Audit Log:</span>
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {brand.followerHistory.slice(-4).reverse().map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>{entry.date}</span>
                    <span className="font-mono font-semibold text-amber-300">
                      {entry.count.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                      {entry.note || 'Manual entry'}
                    </span>
                  </div>
                ))}
              </div>
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/20"
              >
                <Save className="h-4 w-4" />
                <span>Save Verified Follower Count</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
