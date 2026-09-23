import React from 'react';
import { Brand, ContentItem } from '../types/content';
import {
  Eye,
  Users,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Heart,
  MessageCircle,
  Share2,
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
  const totalViews = items.reduce((acc, curr) => acc + curr.views, 0);
  const totalLikes = items.reduce((acc, curr) => acc + curr.likes, 0);
  const totalComments = items.reduce((acc, curr) => acc + curr.comments, 0);
  const totalShares = items.reduce((acc, curr) => acc + curr.shares, 0);
  const totalInquiries = items.reduce((acc, curr) => acc + curr.inquiries, 0);

  const targetProgress = Math.min(
    100,
    Math.round((brand.currentFollowers / (brand.targetFollowers || 1)) * 100)
  );

  const publishedCount = items.filter((i) => i.status === 'published').length;
  const scheduledCount = items.filter((i) => i.status === 'scheduled').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Client Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Client Performance Portal
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400 font-mono">
                {brand.category}
              </span>
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              {brand.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Prepared for <strong className="text-slate-200">{brand.clientName}</strong> &bull; All views and follower milestones are personally verified by your dedicated content producer.
            </p>
          </div>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <span>Open Admin Studio</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Milestone Bar */}
        <div className="mt-6 rounded-2xl bg-slate-900/90 p-4 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-400" />
              <span className="font-semibold text-slate-200">Milestone Follower Progress:</span>
              <span className="font-mono font-bold text-amber-300">
                {brand.currentFollowers.toLocaleString()}
              </span>
              <span className="text-slate-400">/ {brand.targetFollowers.toLocaleString()} Goal</span>
            </div>

            <span className="font-mono font-bold text-cyan-300">{targetProgress}% Reached</span>
          </div>

          <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 transition-all duration-1000 shadow-lg shadow-amber-500/20"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Level Real Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Verified Views */}
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Verified Views</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-cyan-300">
            {totalViews.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across {items.length} active creative reels
          </p>
        </div>

        {/* Card 2: Current Follower Count */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Audited Followers</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-amber-300">
            {brand.currentFollowers.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            +{ (brand.currentFollowers - (brand.followerHistory[0]?.count || 12000)).toLocaleString() } gained in recent cycle
          </p>
        </div>

        {/* Card 3: Inquiries & Leads */}
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">High-Intent Inquiries</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-emerald-300">
            {totalInquiries.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Direct jewelry purchase DMs &amp; calls</p>
        </div>

        {/* Card 4: Total Social Engagement */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-950/80 p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Total Interactions</span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold text-purple-300">
            {(totalLikes + totalComments + totalShares).toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Likes, comments &amp; reel shares</p>
        </div>
      </div>

      {/* Creative Showcase & Pipeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Brand Content Showcase &amp; Release Cadence</h3>
            <p className="text-xs text-slate-400">
              Overview of all planned creatives, release notes, and verified audited views.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-lg bg-emerald-500/15 text-emerald-300 px-3 py-1 border border-emerald-500/30 font-semibold">
              {publishedCount} Published
            </span>
            <span className="rounded-lg bg-blue-500/15 text-blue-300 px-3 py-1 border border-blue-500/30 font-semibold">
              {scheduledCount} Scheduled
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">REEL #{item.itemNumber}</span>
                  <h4 className="text-base font-bold text-slate-100 mt-0.5">{item.title}</h4>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    item.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'scheduled'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.notes}</p>

              {/* Verified Metrics Strip */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900/90 p-3 border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Verified Reel Views</span>
                  <span className="font-mono text-lg font-bold text-cyan-300">
                    {item.views.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Inquiries Generated</span>
                  <span className="font-mono text-lg font-bold text-amber-300">
                    {item.inquiries} DMs
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Scheduled Date</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {item.targetDate || 'Flexible'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Follower Audit Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          <span>Verified Follower Growth Audit History</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Each record is personally audited and entered by the administrator with historical date verification.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="pb-2">Audit Date</th>
                <th className="pb-2">Verified Count</th>
                <th className="pb-2">Milestone Notes</th>
                <th className="pb-2 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {brand.followerHistory.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-mono text-slate-300">{rec.date}</td>
                  <td className="py-2.5 font-mono font-bold text-amber-300 text-sm">
                    {rec.count.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-slate-400">{rec.note || 'Regular milestone checkpoint'}</td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
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
