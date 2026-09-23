import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brand } from '../types/content';
import { X, Save, Building2, User, Mail, Target, Palette } from 'lucide-react';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: Brand | null;
  onSave: (brand: Brand) => void;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brand,
  onSave,
}) => {
  const [name, setName] = useState(brand?.name || '');
  const [category, setCategory] = useState(brand?.category || '');
  const [clientName, setClientName] = useState(brand?.clientName || '');
  const [clientEmail, setClientEmail] = useState(brand?.clientEmail || '');
  const [targetFollowers, setTargetFollowers] = useState<number>(brand?.targetFollowers || 25000);
  const [currentFollowers, setCurrentFollowers] = useState<number>(brand?.currentFollowers || 10000);
  const [primaryColor, setPrimaryColor] = useState(brand?.primaryColor || '#D97706');
  const [accentColor, setAccentColor] = useState(brand?.accentColor || '#38BDF8');

  useEffect(() => {
    if (!isOpen) return;
    if (brand) {
      setName(brand.name);
      setCategory(brand.category);
      setClientName(brand.clientName);
      setClientEmail(brand.clientEmail);
      setTargetFollowers(brand.targetFollowers);
      setCurrentFollowers(brand.currentFollowers);
      setPrimaryColor(brand.primaryColor || '#D97706');
      setAccentColor(brand.accentColor || '#38BDF8');
    } else {
      setName('');
      setCategory('');
      setClientName('');
      setClientEmail('');
      setTargetFollowers(25000);
      setCurrentFollowers(10000);
      setPrimaryColor('#D97706');
      setAccentColor('#38BDF8');
    }
  }, [isOpen, brand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const savedBrand: Brand = {
      id: brand ? brand.id : `brand-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      targetFollowers: Number(targetFollowers) || 20000,
      currentFollowers: Number(currentFollowers) || 0,
      followerHistory: brand
        ? brand.followerHistory
        : [
            {
              date: new Date().toISOString().split('T')[0],
              count: Number(currentFollowers) || 0,
              note: 'Initial verified baseline',
            },
          ],
      primaryColor,
      accentColor,
      connectedSheetId: brand?.connectedSheetId,
      connectedSheetUrl: brand?.connectedSheetUrl,
      createdAt: brand ? brand.createdAt : new Date().toISOString(),
    };

    onSave(savedBrand);
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl border border-white/20 bg-zinc-950 p-4 sm:p-6 shadow-2xl text-slate-100 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              {brand ? 'Edit Brand Details' : 'Create New Brand Workspace'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-slate-300">Brand Name*</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kanakali Fine Silver & Jewels"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Brand Industry / Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Pure Silver Festive Jewellery & Ornaments"
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Client / Contact Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Inderneil Kanagali"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Client Notification Email*</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="inderneilkanagali@gmail.com"
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300">Current Verified Followers</label>
              <input
                type="number"
                min="0"
                value={currentFollowers}
                onChange={(e) => setCurrentFollowers(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-sm text-amber-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Milestone Target Followers</label>
              <input
                type="number"
                min="0"
                value={targetFollowers}
                onChange={(e) => setTargetFollowers(parseInt(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 font-mono text-sm text-cyan-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Palette className="h-3 w-3 text-amber-400" /> Primary Color (Gold / Accent)
              </label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-800 bg-slate-900 p-1 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Palette className="h-3 w-3 text-cyan-400" /> Neon Glow Color
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-slate-800 bg-slate-900 p-1 cursor-pointer"
              />
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
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs font-semibold text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Save className="h-4 w-4" />
              <span>{brand ? 'Save Brand' : 'Create Brand'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
