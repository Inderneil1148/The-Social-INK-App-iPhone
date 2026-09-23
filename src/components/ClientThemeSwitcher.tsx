import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Plus,
  ChevronDown,
  Download,
  Share2,
  Check,
  Palette,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import { ClientBrandKit } from '../types/brandKit';

interface ClientThemeSwitcherProps {
  clients: ClientBrandKit[];
  activeClient?: ClientBrandKit | null;
  onSelectClient: (id: string) => void;
  onAddNewClient: (newClient: ClientBrandKit) => void;
  isHighContrastMode: boolean;
  onToggleHighContrast: () => void;
  isAddModalOpen?: boolean;
  setIsAddModalOpen?: (open: boolean) => void;
}

export const ClientThemeSwitcher: React.FC<ClientThemeSwitcherProps> = ({
  clients,
  activeClient,
  onSelectClient,
  onAddNewClient,
  isHighContrastMode,
  onToggleHighContrast,
  isAddModalOpen: externalIsAddModalOpen,
  setIsAddModalOpen: externalSetIsAddModalOpen,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [internalIsAddModalOpen, setInternalIsAddModalOpen] = useState(false);
  const isAddModalOpen =
    externalIsAddModalOpen !== undefined ? externalIsAddModalOpen : internalIsAddModalOpen;
  const setIsAddModalOpen = externalSetIsAddModalOpen || setInternalIsAddModalOpen;
  const [copiedExport, setCopiedExport] = useState(false);

  // New Client Form State
  const [name, setName] = useState('');
  const [clientOwner, setClientOwner] = useState('');
  const [category, setCategory] = useState('');
  const [tagline, setTagline] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#D97706');
  const [accentColor, setAccentColor] = useState('#06B6D4');
  const [website, setWebsite] = useState('');

  const handleExportJson = () => {
    if (!activeClient) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeClient, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `${activeClient.companyName.toLowerCase().replace(/\s+/g, '-')}-brand-kit.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `brand-${Date.now()}`;
    const newClient: ClientBrandKit = {
      id: newId,
      companyName: name.trim(),
      clientName: clientOwner.trim() || 'Principal Client',
      category: category.trim() || 'General Enterprise',
      tagline: tagline.trim() || 'Visionary Design & Modern Standards',
      primaryColor,
      secondaryColor: '#E2E8F0',
      accentColor,
      highlightGlow: `${primaryColor}40`,
      surfaceBg: '#0b0f17',
      identity: {
        logoUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80',
        iconUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&q=80',
        tagline: tagline.trim() || 'Visionary Design & Modern Standards',
        brandVoiceKeywords: ['Innovative', 'Distinctive', 'Modern'],
        colors: [
          {
            id: `c-1`,
            name: 'Primary Brand Color',
            hex: primaryColor,
            rgb: 'rgb(217, 119, 6)',
            role: 'primary',
            usage: 'Primary CTAs, badges and typography highlights',
            lightText: true,
          },
          {
            id: `c-2`,
            name: 'Accent Electric',
            hex: accentColor,
            rgb: 'rgb(6, 182, 212)',
            role: 'accent',
            usage: 'Secondary highlights and 3D glows',
            lightText: true,
          },
        ],
        typography: [
          {
            id: `t-1`,
            role: 'Primary Headline',
            fontName: 'Plus Jakarta Sans Bold',
            category: 'Sans-serif',
            weights: ['600 SemiBold', '700 Bold'],
            specimen: `${name.trim()} &bull; Modern Brand Identity`,
            usageNote: 'Used across main headlines and title elements.',
          },
        ],
      },
      copyPresets: [
        {
          id: `cp-1`,
          title: 'Official Social Bio',
          category: 'Instagram Bio',
          content: `Official brand workspace for ${name.trim()}.\nCrafted with precision & modern standards.`,
          tags: ['Bio', 'Social'],
        },
      ],
      footprint: {
        websiteUrl: website.trim() || 'https://example.com',
        displayWebsite: website.trim().replace(/^https?:\/\//, '') || 'example.com',
        phone: '+1 (555) 019-2834',
        email: 'hello@brand.com',
        address: 'Downtown Design District',
        mapCoordinates: '37.7749° N, 122.4194° W',
        googleMapsLink: 'https://maps.google.com',
        customLinks: [],
      },
      mediaGallery: [
        {
          id: `m-1`,
          title: 'Brand Hero Asset',
          category: 'Hero',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          dimensions: '3840 x 2160',
          fileFormat: 'PNG',
        },
      ],
      socialMilestones: [
        {
          id: `sm-1`,
          platform: 'Instagram',
          currentCount: 10000,
          targetCount: 25000,
          handle: `@${name.toLowerCase().replace(/\s+/g, '')}`,
          milestoneBadge: '10K Milestone Tier',
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              count: 10000,
              note: 'Initial brand workspace setup',
            },
          ],
        },
      ],
      activePlatform: 'Instagram',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    onAddNewClient(newClient);
    setIsAddModalOpen(false);
    setName('');
    setClientOwner('');
    setCategory('');
    setTagline('');
    setWebsite('');
  };

  return (
    <div className="relative z-40 border-b border-white/10 bg-black/95 px-3 sm:px-6 py-2 sm:py-2.5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Active Client Badge & Switcher Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial min-w-0">
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 sm:gap-2.5 rounded-xl border border-white/15 bg-zinc-950 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:border-white/30 hover:bg-zinc-900"
            >
              {/* Swatch indicator */}
              <span
                className="h-2.5 w-2.5 rounded-full border border-white/40 shadow-sm shrink-0"
                style={{ backgroundColor: activeClient?.primaryColor || '#ffffff' }}
              />
              <span className="max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] truncate text-left">
                {activeClient ? activeClient.companyName : 'Zero Brand Kits (0)'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            </button>

            {/* Dropdown Menu - Device adaptive for mobile, tablet, and laptop */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  className="absolute left-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm rounded-2xl border border-white/20 bg-zinc-950 p-2 sm:p-2.5 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.98)] z-50 animate-fade-in"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Select Brand Kit
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {clients.length} {clients.length === 1 ? 'Kit' : 'Kits'}
                    </span>
                  </div>

                  <div className="mt-1.5 max-h-64 overflow-y-auto space-y-1 pr-0.5">
                    {clients.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-zinc-500">
                        No brand kits configured yet.
                      </div>
                    ) : (
                      clients.map((c) => {
                        const isSelected = activeClient ? c.id === activeClient.id : false;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              onSelectClient(c.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-white text-black font-bold'
                                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span
                                className="h-3 w-3 rounded-full shrink-0 border border-black/20"
                                style={{ backgroundColor: c.primaryColor }}
                              />
                              <div className="flex flex-col items-start truncate">
                                <span className="truncate">{c.companyName}</span>
                                <span
                                  className={`text-[10px] font-normal ${
                                    isSelected ? 'text-zinc-700' : 'text-zinc-500'
                                  }`}
                                >
                                  {c.category}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-black shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>

                  <div className="mt-2 border-t border-white/10 pt-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsAddModalOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-2 text-xs font-bold transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Create New Brand Kit</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Client Theme Palette Visualizer Pills - Hidden on mobile, visible on tablet & laptop */}
          {activeClient && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-zinc-950 px-2.5 py-1.5 border border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mr-1 hidden md:inline">
                Palette:
              </span>
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                title={`Primary: ${activeClient.primaryColor}`}
                style={{ backgroundColor: activeClient.primaryColor }}
              />
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                title={`Secondary: ${activeClient.secondaryColor}`}
                style={{ backgroundColor: activeClient.secondaryColor }}
              />
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                title={`Accent: ${activeClient.accentColor}`}
                style={{ backgroundColor: activeClient.accentColor }}
              />
            </div>
          )}
        </div>

        {/* Right: Controls & Actions (Responsive for mobile, tablet, laptop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Contrast Toggle */}
          <button
            type="button"
            onClick={onToggleHighContrast}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950 px-2.5 sm:px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Toggle High-Contrast Minimal Monochrome"
          >
            {isHighContrastMode ? (
              <>
                <Sun className="h-3.5 w-3.5 text-white" />
                <span className="hidden md:inline">Matte Noir</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-zinc-400" />
                <span className="hidden md:inline">Monochrome</span>
              </>
            )}
          </button>

          {/* Export Brand Kit JSON */}
          {activeClient && (
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950 hover:bg-zinc-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-zinc-200 transition-colors"
              title="Export complete Brand Kit as JSON"
            >
              {copiedExport ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span className="hidden sm:inline">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </button>
          )}

          {/* Add Client Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">New Client</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Add Client Modal - Rendered via createPortal to document.body to ensure zero tab overlap */}
      {isAddModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-white/20 bg-zinc-950 p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Create New Client Brand Kit</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Company / Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Lumina Haute Parfums"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lead Client / Stakeholder
                  </label>
                  <input
                    type="text"
                    value={clientOwner}
                    onChange={(e) => setClientOwner(e.target.value)}
                    placeholder="e.g. Inderneil Kanagali"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Industry Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Fine Jewellery / Tech"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tagline / Brand Vision
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Pure Heritage Craft & 92.5 Hallmark Certifications"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Primary Accent Color
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-xs text-white uppercase focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Secondary Accent Glow
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 font-mono text-xs text-white uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Official Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://brand.com"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
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
                  className="rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2 text-xs font-bold text-slate-950 transition-colors"
                >
                  Create Client Kit
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
