import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Eye,
  Type,
  Palette,
  Layers,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { BrandColor, BrandIdentity, ClientBrandKit, TypographyStyle } from '../types/brandKit';

interface IdentityAssetsCardProps {
  client: ClientBrandKit;
  onUpdateIdentity: (identity: BrandIdentity) => void;
}

export const IdentityAssetsCard: React.FC<IdentityAssetsCardProps> = ({
  client,
  onUpdateIdentity,
}) => {
  const [logoBgMode, setLogoBgMode] = useState<'dark' | 'light' | 'grid'>('dark');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [interactiveSpecimen, setInteractiveSpecimen] = useState<string>(
    'The quick brown fox jumps over the lazy dog &bull; 92.5 Hallmark Certified'
  );
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#F59E0B');

  // Copy to clipboard with instant feedback
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Download mock asset
  const handleDownload = (filename: string, contentUrl: string) => {
    const a = document.createElement('a');
    a.href = contentUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Add new color to client palette
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim() || !newColorHex.trim()) return;

    // Convert hex to rgb
    let r = 0,
      g = 0,
      b = 0;
    const cleanHex = newColorHex.replace('#', '');
    if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    const rgbStr = `rgb(${r}, ${g}, ${b})`;

    const newColor: BrandColor = {
      id: `c-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex.toUpperCase(),
      rgb: rgbStr,
      role: 'accent',
      usage: 'Custom brand accent highlight',
      lightText: r * 0.299 + g * 0.587 + b * 0.114 < 140,
    };

    const updated = {
      ...client.identity,
      colors: [...client.identity.colors, newColor],
    };
    onUpdateIdentity(updated);
    setNewColorName('');
    setIsAddingColor(false);
  };

  const handleDeleteColor = (id: string) => {
    const updated = {
      ...client.identity,
      colors: client.identity.colors.filter((c) => c.id !== id),
    };
    onUpdateIdentity(updated);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all"
      style={{
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Toast Feedback Pill */}
      {copiedCode && (
        <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-2xl">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>Copied {copiedCode} to clipboard!</span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-sm font-bold">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Identity Assets &amp; Guidelines</span>
              <span className="rounded-full bg-zinc-900 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                Core Vectors
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              High-resolution brand marks, dynamic HEX/RGB color tokens &amp; typography rules.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 1. Logos & Marks, 2. Color Palette, 3. Typography */}
      <div className="mt-6 space-y-6">
        {/* Row 1: Primary Logo & App Icon / Favicon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Logo Preview Card */}
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Primary Brand Mark
                </span>
                {/* Backdrop Toggle */}
                <div className="flex items-center rounded-lg bg-slate-900/80 p-0.5 border border-white/10 text-[10px]">
                  <button
                    onClick={() => setLogoBgMode('dark')}
                    className={`rounded px-2 py-0.5 font-medium transition-colors ${
                      logoBgMode === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setLogoBgMode('light')}
                    className={`rounded px-2 py-0.5 font-medium transition-colors ${
                      logoBgMode === 'light' ? 'bg-white text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setLogoBgMode('grid')}
                    className={`rounded px-2 py-0.5 font-medium transition-colors ${
                      logoBgMode === 'grid' ? 'bg-slate-800 text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    Checker
                  </button>
                </div>
              </div>

              {/* Logo Viewport Box */}
              <div
                className={`mt-3 flex h-36 items-center justify-center rounded-lg border border-white/10 p-4 transition-colors ${
                  logoBgMode === 'light'
                    ? 'bg-slate-100'
                    : logoBgMode === 'grid'
                    ? 'bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:12px_12px] bg-slate-950'
                    : 'bg-slate-950'
                }`}
              >
                <img
                  src={client.identity.logoUrl}
                  alt={`${client.companyName} Logo`}
                  className="max-h-24 max-w-full object-contain rounded-md shadow-sm"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="font-mono text-[11px] text-slate-400">SVG / Vector High-Res</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(client.identity.logoUrl, 'Logo URL')}
                  className="flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-1 text-slate-300 border border-white/10 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      `${client.companyName.toLowerCase().replace(/\s+/g, '-')}-logo.png`,
                      client.identity.logoUrl
                    )
                  }
                  className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-1 font-semibold text-white transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* App Icon / Favicon Card */}
          <div className="rounded-xl border border-white/10 bg-black/50 p-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  App Icon &amp; Favicon (512x512)
                </span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/5">
                  Maskable / PNG
                </span>
              </div>

              {/* Icon Viewport Box */}
              <div className="mt-3 flex h-36 items-center justify-center gap-6 rounded-lg border border-white/10 bg-slate-950 p-4">
                <div className="text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 shadow-xl"
                    style={{
                      boxShadow: `0 8px 20px -4px ${client.highlightGlow}`,
                    }}
                  >
                    <img
                      src={client.identity.iconUrl}
                      alt="App Icon"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mt-1 block text-[10px] font-mono text-slate-400">iOS / App</span>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 shadow-md">
                    <img
                      src={client.identity.faviconUrl || client.identity.iconUrl}
                      alt="Favicon"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mt-1 block text-[10px] font-mono text-slate-400">Favicon</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="font-mono text-[11px] text-slate-400">Square 1:1 Aspect</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(client.identity.iconUrl, 'Icon URL')}
                  className="flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-1 text-slate-300 border border-white/10 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>Copy URL</span>
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      `${client.companyName.toLowerCase().replace(/\s+/g, '-')}-icon.png`,
                      client.identity.iconUrl
                    )
                  }
                  className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-1 font-semibold text-white transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Color Palette (HEX, RGB codes with one-click copy) */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Extracted Brand Palette (One-Click Copy HEX &amp; RGB)
              </span>
            </div>

            <button
              onClick={() => setIsAddingColor(!isAddingColor)}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Color</span>
            </button>
          </div>

          {/* Add Color Form */}
          {isAddingColor && (
            <form
              onSubmit={handleAddColor}
              className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-900/90 p-3 border border-white/10 animate-fade-in"
            >
              <input
                type="text"
                required
                placeholder="Color Name (e.g. Royal Emerald)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  required
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 font-mono text-xs text-white uppercase focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingColor(false)}
                className="rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Color Swatch Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {client.identity.colors.map((color) => {
              const isPrimary = color.hex.toLowerCase() === client.primaryColor.toLowerCase();
              return (
                <div
                  key={color.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-slate-900/80 p-3 shadow-lg transition-transform hover:-translate-y-1 hover:border-white/30"
                >
                  {/* Swatch Header & Delete */}
                  <div>
                    <div
                      className="relative h-14 w-full rounded-lg shadow-inner border border-black/20 flex items-center justify-center transition-all group-hover:scale-[1.02]"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isPrimary && (
                        <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white backdrop-blur-xs">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 truncate" title={color.name}>
                          {color.name}
                        </span>
                        {client.identity.colors.length > 2 && (
                          <button
                            onClick={() => handleDeleteColor(color.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-rose-400 hover:text-rose-300 transition-opacity"
                            title="Remove Color"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize block">
                        {color.role} role
                      </span>
                    </div>
                  </div>

                  {/* One-Click Copy Badges */}
                  <div className="mt-3 space-y-1 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleCopy(color.hex, color.hex)}
                      className="flex w-full items-center justify-between rounded bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-200 hover:bg-white/15 transition-colors"
                      title="Click to copy HEX"
                    >
                      <span className="font-bold">{color.hex}</span>
                      <Copy className="h-3 w-3 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(color.rgb, color.rgb)}
                      className="flex w-full items-center justify-between rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] text-slate-400 hover:bg-white/15 hover:text-slate-200 transition-colors truncate"
                      title="Click to copy RGB"
                    >
                      <span className="truncate">{color.rgb}</span>
                      <Copy className="h-2.5 w-2.5 text-slate-400 shrink-0 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Typography & Font Guidelines */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Typography System &amp; Font Hierarchies
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Interactive Preview Text:</span>
              <input
                type="text"
                value={interactiveSpecimen}
                onChange={(e) => setInteractiveSpecimen(e.target.value)}
                className="w-48 sm:w-64 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white focus:outline-none"
                placeholder="Test font rendering..."
              />
            </div>
          </div>

          <div className="space-y-3">
            {client.identity.typography.map((typo) => (
              <div
                key={typo.id}
                className="rounded-xl border border-white/10 bg-slate-900/60 p-4 transition-colors hover:border-white/20"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{typo.role}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                      {typo.fontName}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      {typo.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {typo.weights.map((w, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rendered Specimen Preview */}
                <div className="mt-3 overflow-hidden py-1">
                  <p className="text-lg sm:text-xl font-medium text-slate-100 tracking-tight line-clamp-2">
                    {interactiveSpecimen || typo.specimen}
                  </p>
                </div>

                {/* Usage Note */}
                <p className="mt-2 text-xs text-slate-400 italic leading-relaxed">
                  Usage: {typo.usageNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
