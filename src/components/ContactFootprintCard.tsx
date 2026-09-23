import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  FolderGit2,
  Presentation,
  FileCode,
  Compass,
  ArrowUpRight,
  Edit2,
  Plus,
  Navigation,
} from 'lucide-react';
import { ClientBrandKit, CustomQuickLink, DigitalFootprint } from '../types/brandKit';

interface ContactFootprintCardProps {
  client: ClientBrandKit;
  onUpdateFootprint: (footprint: DigitalFootprint) => void;
}

export const ContactFootprintCard: React.FC<ContactFootprintCardProps> = ({
  client,
  onUpdateFootprint,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for editing footprint
  const [formWebsite, setFormWebsite] = useState(client.footprint.websiteUrl);
  const [formPhone, setFormPhone] = useState(client.footprint.phone);
  const [formEmail, setFormEmail] = useState(client.footprint.email);
  const [formAddress, setFormAddress] = useState(client.footprint.address);
  const [formCoords, setFormCoords] = useState(client.footprint.mapCoordinates);
  const [formMapsLink, setFormMapsLink] = useState(client.footprint.googleMapsLink);
  const [formDriveLink, setFormDriveLink] = useState(client.footprint.driveLink || '');
  const [formDeckLink, setFormDeckLink] = useState(client.footprint.deckLink || '');
  const [formPressLink, setFormPressLink] = useState(client.footprint.pressKitLink || '');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DigitalFootprint = {
      ...client.footprint,
      websiteUrl: formWebsite.trim(),
      displayWebsite: formWebsite.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      mapCoordinates: formCoords.trim(),
      googleMapsLink:
        formMapsLink.trim() ||
        `https://maps.google.com/?q=${encodeURIComponent(formAddress.trim())}`,
      driveLink: formDriveLink.trim() || undefined,
      deckLink: formDeckLink.trim() || undefined,
      pressKitLink: formPressLink.trim() || undefined,
    };
    onUpdateFootprint(updated);
    setIsEditModalOpen(false);
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all"
      style={{
        boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.1) inset, 0 20px 40px -15px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Toast Feedback */}
      {copiedKey && typeof document !== 'undefined' && createPortal(
        <div className="animate-fade-in fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black shadow-2xl">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>Copied to clipboard!</span>
        </div>,
        document.body
      )}

      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-sm font-bold">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Contact &amp; Digital Footprint</span>
              <span className="rounded-full bg-zinc-900 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">
                Verified Channels
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Official portals, hotline numbers, physical headquarters radar &amp; repository assets.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormWebsite(client.footprint.websiteUrl);
            setFormPhone(client.footprint.phone);
            setFormEmail(client.footprint.email);
            setFormAddress(client.footprint.address);
            setFormCoords(client.footprint.mapCoordinates);
            setFormMapsLink(client.footprint.googleMapsLink);
            setFormDriveLink(client.footprint.driveLink || '');
            setFormDeckLink(client.footprint.deckLink || '');
            setFormPressLink(client.footprint.pressKitLink || '');
            setIsEditModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold bg-white hover:bg-zinc-200 text-black transition-all shadow-sm"
        >
          <Edit2 className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Edit Channels</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Official Website, Phone, Email & Quick Cloud Links */}
        <div className="space-y-4">
          {/* Website Card */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 transition-colors hover:border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Globe className="h-4 w-4 text-cyan-400" />
                <span>Official Web Domain</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(client.footprint.websiteUrl, 'website')}
                  className="rounded p-1 text-slate-400 hover:text-white"
                  title="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <a
                  href={client.footprint.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-1 text-xs font-semibold text-white transition-colors"
                >
                  <span>Visit Domain</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="mt-2 font-mono text-sm font-bold text-white tracking-wide">
              {client.footprint.displayWebsite || client.footprint.websiteUrl}
            </div>
          </div>

          {/* Phone & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Direct Hotline</span>
                </span>
                <button
                  onClick={() => handleCopy(client.footprint.phone, 'phone')}
                  className="rounded p-1 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <a
                href={`tel:${client.footprint.phone}`}
                className="mt-1.5 block font-mono text-xs font-bold text-white hover:text-amber-300 transition-colors"
              >
                {client.footprint.phone}
              </a>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5 text-amber-400" />
                  <span>Client Inquiries</span>
                </span>
                <button
                  onClick={() => handleCopy(client.footprint.email, 'email')}
                  className="rounded p-1 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <a
                href={`mailto:${client.footprint.email}`}
                className="mt-1.5 block truncate font-mono text-xs font-bold text-white hover:text-amber-300 transition-colors"
                title={client.footprint.email}
              >
                {client.footprint.email}
              </a>
            </div>
          </div>

          {/* Quick Access Client Cloud Drives, Decks & Press Kits */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Master Cloud Assets &amp; Repositories
            </span>

            <div className="space-y-2">
              {client.footprint.customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/60 p-2.5 transition-all hover:border-white/20 hover:bg-slate-900/90"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-cyan-400">
                      <FolderGit2 className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{link.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 truncate block max-w-[200px]">
                        {link.url}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {link.badge && (
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                        {link.badge}
                      </span>
                    )}
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Maps Coordinates & Location Card */}
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/50 p-5">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <MapPin className="h-4 w-4 text-rose-400" />
                <span>Client Physical Presence &amp; Coordinates</span>
              </div>

              <span className="font-mono text-xs font-bold text-amber-400">
                {client.footprint.mapCoordinates}
              </span>
            </div>

            {/* Stylized Tactical Map Graphic / Viewport */}
            <div className="relative mt-4 h-44 w-full overflow-hidden rounded-xl border border-white/15 bg-slate-950">
              {/* Map grid lines simulation */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

              {/* Glowing radar circles */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="absolute h-32 w-32 animate-ping rounded-full bg-rose-500/10" />
                <div className="absolute h-20 w-20 rounded-full border border-rose-500/40 bg-rose-500/20" />
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 shadow-xl shadow-rose-600/50 text-white">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>

              {/* Coordinates Pill overlay */}
              <div className="absolute bottom-3 left-3 rounded-lg bg-black/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 border border-white/10 backdrop-blur-md">
                GPS: {client.footprint.mapCoordinates}
              </div>
            </div>

            {/* Address Details */}
            <div className="mt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Registered Atelier / Office Address
              </span>
              <p className="mt-1 text-xs text-slate-200 leading-relaxed font-medium">
                {client.footprint.address}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={() => handleCopy(client.footprint.address, 'address')}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-slate-300 transition-colors"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Full Address</span>
            </button>

            <a
              href={client.footprint.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-950 transition-all shadow-lg"
              style={{
                backgroundColor: client.primaryColor,
              }}
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Edit Footprint Modal */}
      {isEditModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/20 bg-slate-950 p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-y-auto"
            style={{ boxShadow: `0 0 50px -10px ${client.highlightGlow}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Edit Digital Footprint Channels</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Official Website URL
                </label>
                <input
                  type="url"
                  required
                  value={formWebsite}
                  onChange={(e) => setFormWebsite(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Direct Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Map GPS Coordinates
                  </label>
                  <input
                    type="text"
                    value={formCoords}
                    onChange={(e) => setFormCoords(e.target.value)}
                    placeholder="12.9822° N, 77.6083° E"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={formMapsLink}
                    onChange={(e) => setFormMapsLink(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Google Drive Brand Folder URL
                </label>
                <input
                  type="url"
                  value={formDriveLink}
                  onChange={(e) => setFormDriveLink(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl px-5 py-2 text-xs font-bold text-slate-950"
                  style={{ backgroundColor: client.primaryColor }}
                >
                  Save Footprint
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
