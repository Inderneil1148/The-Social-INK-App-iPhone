import React from 'react';
import { Brand, ContentItem } from '../types/content';
import {
  Eye,
  Users,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface ClientDashboardProps {
  brand: Brand;
  items: ContentItem[];
  onOpenAdmin: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  brand,
  items,
  onOpenAdmin,
}) => {
  const safeBrand = brand || {
    id: 'default',
    name: 'Brand Studio',
    clientName: 'Client',
    category: 'Brand Kit',
    currentFollowers: 0,
    targetFollowers: 10000,
    followerHistory: [],
    primaryColor: '#ffffff',
    accentColor: '#ffffff',
    createdAt: new Date().toISOString(),
  };

  const totalViews = items.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = items.reduce((acc, curr) => acc + curr.likes, 0);
  const totalComments = items.reduce((acc, curr) => acc + curr.comments, 0);
  const totalShares = items.reduce((acc, curr) => acc + curr.shares, 0);
  const totalInquiries = items.reduce((acc, curr) => acc + curr.inquiries, 0);

  const targetProgress = Math.min(
    100,
    Math.round((safeBrand.currentFollowers / (safeBrand.targetFollowers || 1)) * 100)
  );

  const publishedCount = items.filter((i) => i.status === 'published').length;
  const scheduledCount = items.filter((i) => i.status === 'scheduled').length;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Client Executive Header Banner - Minimalist Monochrome */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
                Verified Client Portal
              </span>
              <span className="rounded-full bg-zinc-900 border border-white/10 px-3 py-1 text-xs text-zinc-400 font-mono">
                {safeBrand.category}
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {safeBrand.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400">
              Prepared for <strong className="text-zinc-200">{safeBrand.clientName}</strong> &bull; All views and follower counts are verified by your executive producer.
            </p>
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
          >
            <span>Open Admin Studio</span>
            <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Milestone Bar */}
        <div className="mt-6 rounded-xl bg-black/60 p-4 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-300" />
              <span className="font-semibold text-zinc-300">Milestone Follower Progress:</span>
              <span className="font-mono font-bold text-white">
                {safeBrand.currentFollowers.toLocaleString()}
              </span>
              <span className="text-zinc-500 font-mono">/ {safeBrand.targetFollowers.toLocaleString()} Goal</span>
            </div>

            <span className="font-mono font-bold text-white">{targetProgress}% Reached</span>
          </div>

          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-zinc-900 border border-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000 shadow-sm"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Level Real Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Verified Views */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-mono text-[10px]">Verified Views</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {totalViews.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            Across {items.length} active creative reels
          </p>
        </div>

        {/* Card 2: Current Follower Count */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-mono text-[10px]">Audited Followers</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {safeBrand.currentFollowers.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">
            +{ (safeBrand.currentFollowers - (safeBrand.followerHistory[0]?.count || 0)).toLocaleString() } in recent cycle
          </p>
        </div>

        {/* Card 3: Inquiries & Leads */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-mono text-[10px]">High-Intent Inquiries</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {totalInquiries.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Direct purchase DMs &amp; bookings</p>
        </div>

        {/* Card 4: Total Social Engagement */}
        <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="uppercase tracking-wider font-mono text-[10px]">Total Interactions</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {(totalLikes + totalComments + totalShares).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Likes, comments &amp; shares</p>
        </div>
      </div>

      {/* Creative Showcase & Pipeline */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Brand Content Showcase &amp; Release Cadence</h3>
            <p className="text-xs text-zinc-400">
              Overview of all planned creatives, release notes, and verified audited views.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-xl bg-white/10 text-white px-3 py-1 border border-white/15 font-semibold">
              {publishedCount} Published
            </span>
            <span className="rounded-xl bg-zinc-900 text-zinc-300 px-3 py-1 border border-white/10 font-semibold">
              {scheduledCount} Scheduled
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-black/40 p-5 hover:border-white/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-zinc-400">REEL #{item.itemNumber}</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{item.title}</h4>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize border ${
                    item.status === 'published'
                      ? 'bg-white text-black border-white'
                      : item.status === 'scheduled'
                      ? 'bg-zinc-800 text-zinc-200 border-white/20'
                      : 'bg-zinc-900 text-zinc-400 border-white/10'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{item.notes}</p>

              {/* Verified Metrics Strip */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-900/80 p-3 border border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Verified Views</span>
                  <span className="font-mono text-base font-bold text-white">
                    {item.views.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Inquiries</span>
                  <span className="font-mono text-base font-bold text-white">
                    {item.inquiries}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">Target Date</span>
                  <span className="font-mono text-xs font-semibold text-zinc-300">
                    {item.targetDate || 'Flexible'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Follower Audit Log */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-white" />
          <span>Verified Follower Growth Audit History</span>
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Each record is personally audited and entered by the administrator with historical date verification.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px] font-mono">
                <th className="pb-2">Audit Date</th>
                <th className="pb-2">Verified Count</th>
                <th className="pb-2">Milestone Notes</th>
                <th className="pb-2 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {brand.followerHistory.map((rec, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 font-mono text-zinc-300">{rec.date}</td>
                  <td className="py-2.5 font-mono font-bold text-white text-sm">
                    {rec.count.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-zinc-400">{rec.note || 'Regular milestone checkpoint'}</td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-white font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      Admin Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
