import React from 'react';
import {
  Sparkles,
  Layers,
  Crown,
  Share2,
  ExternalLink,
  Tag,
  CheckCircle2,
  Building,
  Target,
  FileCheck,
} from 'lucide-react';
import {
  BrandIdentity,
  ClientBrandKit,
  CopyPresetItem,
  DigitalFootprint,
  MediaAssetItem,
  SocialMilestone,
  SocialPlatform,
} from '../types/brandKit';
import { FollowerCounter3DCard } from './FollowerCounter3DCard';
import { IdentityAssetsCard } from './IdentityAssetsCard';
import { CopyPresetsCard } from './CopyPresetsCard';
import { ContactFootprintCard } from './ContactFootprintCard';
import { MediaGalleryCard } from './MediaGalleryCard';
import { QuickNotesCard } from './QuickNotesCard';

interface BrandKitWorkspaceProps {
  client: ClientBrandKit;
  onUpdateClient: (updatedClient: ClientBrandKit) => void;
  isHighContrastMode: boolean;
}

export const BrandKitWorkspace: React.FC<BrandKitWorkspaceProps> = ({
  client,
  onUpdateClient,
  isHighContrastMode,
}) => {
  // Update follower milestones
  const handleUpdateMilestone = (
    updatedMilestones: SocialMilestone[],
    activePlatform: SocialPlatform
  ) => {
    onUpdateClient({
      ...client,
      socialMilestones: updatedMilestones,
      activePlatform,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Update identity assets
  const handleUpdateIdentity = (identity: BrandIdentity) => {
    onUpdateClient({
      ...client,
      identity,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Update communication presets
  const handleUpdatePresets = (copyPresets: CopyPresetItem[]) => {
    onUpdateClient({
      ...client,
      copyPresets,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Update digital footprint
  const handleUpdateFootprint = (footprint: DigitalFootprint) => {
    onUpdateClient({
      ...client,
      footprint,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Update media gallery
  const handleUpdateGallery = (mediaGallery: MediaAssetItem[]) => {
    onUpdateClient({
      ...client,
      mediaGallery,
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Client Identity Hero & Brand Summary Card */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-500"
        style={{
          boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 20px 50px -15px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/15 tracking-wide shadow-sm">
                <Crown className="h-3.5 w-3.5 stroke-[2]" />
                <span>Active Client Workspace</span>
              </span>

              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400 border border-white/10">
                {client.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>{client.companyName}</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {client.tagline}
            </p>

            {/* Brand Voice Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-1">
                Tone &amp; Voice:
              </span>
              {client.identity.brandVoiceKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-zinc-900/90 px-2.5 py-1 text-[10px] font-medium text-zinc-300 border border-white/10"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics Badge - Perfectly Aligned */}
          <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-3 rounded-2xl bg-zinc-900/70 p-4 border border-white/10 backdrop-blur-md min-w-[200px]">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Lead Stakeholder
              </span>
              <span className="text-xs font-semibold text-white mt-0.5 block">{client.clientName}</span>
            </div>
            <div className="h-px w-full bg-white/5 hidden md:block" />
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Last Kit Audit
              </span>
              <span className="text-xs font-mono font-medium text-zinc-200 mt-0.5 block">
                {new Date(client.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 3D Follower Counter Card Widget */}
      <FollowerCounter3DCard
        client={client}
        onUpdateMilestone={handleUpdateMilestone}
      />

      {/* 3. Core Identity Assets Card (Logos, Icons, Colors HEX/RGB, Typography) */}
      <IdentityAssetsCard
        client={client}
        onUpdateIdentity={handleUpdateIdentity}
      />

      {/* 4. Communication & Copy Presets Card (1-Click Copy Bios, Captions, Boilerplates) */}
      <CopyPresetsCard
        client={client}
        onUpdatePresets={handleUpdatePresets}
      />

      {/* 5. Quick Notes & Floating Snippets Card (Transient Ideas Scratchpad persisted in localStorage) */}
      <QuickNotesCard client={client} />

      {/* 6. Contact & Digital Footprint Card (Official URLs, Hotlines, Maps Coordinates & Cloud Repositories) */}
      <ContactFootprintCard
        client={client}
        onUpdateFootprint={handleUpdateFootprint}
      />

      {/* 7. Media Gallery Card (High-Priority Editorial Images, Mockups & Packaging Packshots) */}
      <MediaGalleryCard
        client={client}
        onUpdateGallery={handleUpdateGallery}
      />
    </div>
  );
};
