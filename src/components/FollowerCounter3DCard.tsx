import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  Edit3,
  Check,
  History,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import { ClientBrandKit, SocialMilestone, SocialPlatform } from '../types/brandKit';
import confetti from 'canvas-confetti';
import { Interactive3DFollowerText } from './Interactive3DFollowerText';

interface FollowerCounter3DCardProps {
  client: ClientBrandKit;
  onUpdateMilestone: (updatedMilestones: SocialMilestone[], activePlatform: SocialPlatform) => void;
}

export const FollowerCounter3DCard: React.FC<FollowerCounter3DCardProps> = ({
  client,
  onUpdateMilestone,
}) => {
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>(
    client.activePlatform || 'Instagram'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Find active milestone
  const currentMilestone =
    client.socialMilestones.find((m) => m.platform === activePlatform) ||
    client.socialMilestones[0] || {
      id: 'sm-default',
      platform: 'Instagram',
      currentCount: 15000,
      targetCount: 25000,
      handle: '@brand',
      milestoneBadge: '15K Creator Tier',
      history: [],
    };

  // Form states inside edit modal
  const [editCount, setEditCount] = useState<number>(currentMilestone.currentCount);
  const [editTarget, setEditTarget] = useState<number>(currentMilestone.targetCount);
  const [editBadge, setEditBadge] = useState<string>(currentMilestone.milestoneBadge);
  const [editHandle, setEditHandle] = useState<string>(currentMilestone.handle);
  const [editNote, setEditNote] = useState<string>('Manual verified audit count');

  // Handle opening modal
  const handleOpenModal = () => {
    setEditCount(currentMilestone.currentCount);
    setEditTarget(currentMilestone.targetCount);
    setEditBadge(currentMilestone.milestoneBadge);
    setEditHandle(currentMilestone.handle);
    setEditNote('Manual verified audit count');
    setIsModalOpen(true);
  };

  // Handle saving updates
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCount = Number(editCount) || 0;
    const newTarget = Number(editTarget) || 0;

    const updatedMilestones = client.socialMilestones.map((m) => {
      if (m.platform === activePlatform) {
        const newHistory = [
          {
            date: new Date().toISOString().split('T')[0],
            count: newCount,
            note: editNote.trim() || 'Manual verified audit count',
          },
          ...(m.history || []),
        ];

        return {
          ...m,
          currentCount: newCount,
          targetCount: newTarget,
          milestoneBadge: editBadge.trim() || `${Math.floor(newCount / 1000)}K Milestone`,
          handle: editHandle.trim() || m.handle,
          history: newHistory,
        };
      }
      return m;
    });

    onUpdateMilestone(updatedMilestones, activePlatform);
    setIsModalOpen(false);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: [client.primaryColor, client.accentColor, '#FFFFFF'],
      });
    } catch {
      // Confetti fallback
    }
  };

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (currentMilestone.currentCount / Math.max(1, currentMilestone.targetCount)) * 100
      )
    )
  );

  // Platform icon helper
  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'Instagram':
        return '📸';
      case 'YouTube':
        return '▶️';
      case 'LinkedIn':
        return '💼';
      case 'TikTok':
        return '🎵';
      case 'Twitter/X':
        return '✖️';
      default:
        return '🌐';
    }
  };

  return (
    <>
      {/* 3D Elevated Card Container - Minimalist Monochrome */}
      <div
        onClick={handleOpenModal}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      >
        {/* Subtle Ambient Depth */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

        {/* Card Header & Platform Tabs */}
        <div className="relative z-10 p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-sm font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Audience Audit Widget
                </span>
                <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>{client.companyName}</span>
                  <span className="text-xs font-mono font-normal text-zinc-400">
                    {currentMilestone.handle}
                  </span>
                </h3>
              </div>
            </div>

            {/* Quick Action Hint */}
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 border border-white/10 transition-colors group-hover:border-white/30 group-hover:text-white">
              <Edit3 className="h-3 w-3 text-zinc-400 group-hover:text-white" />
              <span>Tap to Edit / Audit</span>
            </div>
          </div>

          {/* Platform Switcher Pills - Minimalist White & Black */}
          <div className="mt-4 flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
            {client.socialMilestones.map((sm) => {
              const isActive = sm.platform === activePlatform;
              return (
                <button
                  key={sm.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePlatform(sm.platform);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{getPlatformIcon(sm.platform)}</span>
                  <span>{sm.platform}</span>
                  <span className={`font-mono text-[10px] ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>
                    ({(sm.currentCount / 1000).toFixed(1)}k)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Embossed Hero Counter Area */}
        <div className="relative z-10 px-6 py-4">
          <div className="relative flex flex-col items-start justify-center rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Verified Audience Reach
              </span>
              <div className="flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
                <Award className="h-3.5 w-3.5 text-white" />
                <span>{currentMilestone.milestoneBadge}</span>
              </div>
            </div>

            {/* Extra-large Stylized 3D Embossed Numbers with Interactive Physics */}
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <Interactive3DFollowerText
                count={currentMilestone.currentCount}
                size="hero"
                onClick={() => setIsModalOpen(true)}
              />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                Audited Followers
              </span>
            </div>

            {/* Milestone Progress Bar */}
            <div className="mt-5 w-full">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-white" />
                  Target Milestone: {currentMilestone.targetCount.toLocaleString()}
                </span>
                <span className="font-mono font-bold text-white">
                  {progressPercent}% Complete
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-900 p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out bg-white"
                  style={{
                    width: `${progressPercent}%`,
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                  }}
                />
              </div>
            </div>

            {/* Footer Metrics Row - Perfectly Aligned */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 w-full border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-white">
                    +{currentMilestone.growthRatePercent || 14.2}%
                  </span>{' '}
                  mom growth
                </div>
                <div className="h-3 w-px bg-white/10" />
                <div className="flex items-center gap-1 text-zinc-400">
                  <History className="h-3.5 w-3.5" />
                  <span>
                    Audited {currentMilestone.history?.[0]?.date || 'Today'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-semibold text-white text-xs group-hover:underline">
                <span>Configure Milestones</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Modal for Editing Follower Count & Milestones */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl relative"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-bold text-base">
                  {getPlatformIcon(activePlatform)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Update {activePlatform} Follower Audit
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Real manual count entered by admin for {client.companyName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Current Verified Follower Count
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editCount}
                    onChange={(e) => setEditCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/20 bg-zinc-900 px-4 py-2.5 font-mono text-xl font-bold text-white focus:border-white focus:outline-none"
                  />
                  <div className="absolute right-3 top-2.5 text-xs text-zinc-400">
                    Audited Users
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Next Target Milestone
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={editTarget}
                    onChange={(e) => setEditTarget(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Social Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={editHandle}
                    onChange={(e) => setEditHandle(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-white focus:outline-none"
                    placeholder="@handle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Milestone Badge / Title
                </label>
                <input
                  type="text"
                  required
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-sm text-white focus:border-white focus:outline-none"
                  placeholder="e.g. 15K Silver Club (Next: 25K Gold)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Audit Verification Note
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-white focus:border-white focus:outline-none"
                  placeholder="e.g., Post festive pooja campaign manual check"
                />
              </div>

              {/* Audit History Log */}
              {currentMilestone.history && currentMilestone.history.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Recent Verification Logs
                  </span>
                  <div className="mt-2 max-h-24 space-y-1 overflow-y-auto pr-1 text-xs">
                    {currentMilestone.history.slice(0, 3).map((h, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-zinc-300 py-1 border-b border-white/5 last:border-none"
                      >
                        <span className="font-mono text-zinc-400">{h.date}</span>
                        <span className="font-mono font-bold text-white">
                          {h.count.toLocaleString()}
                        </span>
                        <span className="text-zinc-400 text-[11px] truncate max-w-[150px]">
                          {h.note}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-sm"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Save Verified Count</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
