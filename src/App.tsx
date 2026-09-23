import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './services/auth';
import { Brand, ContentItem, ContentStatus } from './types/content';
import {
  loadSavedBrands,
  loadSavedContent,
  saveBrandsToStorage,
  saveContentToStorage,
} from './utils/initialData';
import { ThreeScene } from './components/ThreeScene';
import { ContentCard } from './components/ContentCard';
import { ManualMetricsModal } from './components/ManualMetricsModal';
import { ContentFormModal } from './components/ContentFormModal';
import { BrandModal } from './components/BrandModal';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { GoogleCalendarIntegration } from './components/GoogleCalendarIntegration';
import { DeadlineNotificationSystem } from './components/DeadlineNotificationSystem';
import { GoogleTasksIntegration } from './components/GoogleTasksIntegration';
import { ClientDashboard } from './components/ClientDashboard';
import {
  Eye,
  Users,
  TrendingUp,
  Sparkles,
  Plus,
  Calendar,
  FileSpreadsheet,
  Bell,
  CheckSquare,
  LayoutGrid,
  Presentation,
  Sliders,
  LogOut,
  ChevronDown,
  Building2,
  ExternalLink,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // App view mode: Admin Studio vs Client Presentation
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [adminTab, setAdminTab] = useState<'reels' | 'sheets' | 'calendar' | 'notifications' | 'tasks'>('reels');

  // Brands and Content state
  const [brands, setBrands] = useState<Brand[]>(() => loadSavedBrands());
  const [activeBrandId, setActiveBrandId] = useState<string>(() => loadSavedBrands()[0]?.id || '');
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => loadSavedContent());

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modal dialog states
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [metricsTargetItem, setMetricsTargetItem] = useState<ContentItem | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveBrandsToStorage(brands);
  }, [brands]);

  useEffect(() => {
    saveContentToStorage(contentItems);
  }, [contentItems]);

  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0];
  const brandContentItems = contentItems.filter((i) => i.brandId === activeBrand?.id);

  // Filtered items
  const filteredItems = brandContentItems.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // Auth login handler
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setCachedAccessToken(result.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Manual views update handler
  const handleUpdateItemMetrics = (
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
  ) => {
    setContentItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newHistory = [
            ...(item.metricHistory || []),
            {
              timestamp: new Date().toISOString(),
              views: metrics.views,
              likes: metrics.likes,
              reach: metrics.reach,
              comments: metrics.comments,
              shares: metrics.shares,
              inquiries: metrics.inquiries,
              followersSnapshot: activeBrand.currentFollowers,
              note: metrics.note,
            },
          ];

          return {
            ...item,
            views: metrics.views,
            likes: metrics.likes,
            reach: metrics.reach,
            comments: metrics.comments,
            shares: metrics.shares,
            inquiries: metrics.inquiries,
            metricHistory: newHistory,
          };
        }
        return item;
      })
    );
  };

  // Manual brand followers update handler
  const handleUpdateBrandFollowers = (newCount: number, note?: string) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === activeBrand.id) {
          const newHistory = [
            ...b.followerHistory,
            {
              date: new Date().toISOString().split('T')[0],
              count: newCount,
              note: note || 'Admin manual count verification',
            },
          ];
          return {
            ...b,
            currentFollowers: newCount,
            followerHistory: newHistory,
          };
        }
        return b;
      })
    );
  };

  // Content item CRUD
  const handleSaveContentItem = (savedItem: ContentItem) => {
    setContentItems((prev) => {
      const idx = prev.findIndex((i) => i.id === savedItem.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedItem;
        return next;
      }
      return [...prev, savedItem];
    });
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    setContentItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
    setItemToDelete(null);
  };

  // Brand CRUD
  const handleSaveBrand = (savedBrand: Brand) => {
    setBrands((prev) => {
      const idx = prev.findIndex((b) => b.id === savedBrand.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedBrand;
        return next;
      }
      return [...prev, savedBrand];
    });
    setActiveBrandId(savedBrand.id);
  };

  // Import items from Google Sheet
  const handleImportItems = (newItems: ContentItem[]) => {
    setContentItems((prev) => {
      // Merge by item number or id
      const otherBrands = prev.filter((i) => i.brandId !== activeBrand.id);
      return [...otherBrands, ...newItems];
    });
  };

  const handleUpdateBrandSheetInfo = (sheetId: string, sheetUrl: string) => {
    setBrands((prev) =>
      prev.map((b) =>
        b.id === activeBrand.id
          ? {
              ...b,
              connectedSheetId: sheetId,
              connectedSheetUrl: sheetUrl,
              lastSheetSync: new Date().toISOString(),
            }
          : b
      )
    );
  };

  const handleUpdateItemCalendarEvent = (itemId: string, eventId: string) => {
    setContentItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, calendarEventId: eventId } : i))
    );
  };

  const handleMarkNotified = (itemIds: string[]) => {
    setContentItems((prev) =>
      prev.map((i) =>
        itemIds.includes(i.id) ? { ...i, lastNotifiedAt: new Date().toISOString() } : i
      )
    );
  };

  const totalBrandViews = brandContentItems.reduce((acc, curr) => acc + curr.views, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-100">
                  The Social Brand <span className="text-amber-400">Kit</span>
                </span>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
                  STUDIO
                </span>
              </div>

              {/* Active Brand Selector */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building2 className="h-3 w-3 text-amber-400" />
                <select
                  value={activeBrandId}
                  onChange={(e) => setActiveBrandId(e.target.value)}
                  className="bg-transparent font-semibold text-slate-200 focus:outline-none cursor-pointer hover:text-amber-300 transition-colors"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                      {b.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingBrand(null);
                    setIsBrandModalOpen(true);
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] underline pl-1"
                >
                  + Add Brand
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switcher & Google Workspace Auth */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle (Admin vs Client) */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  viewMode === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Admin Studio</span>
              </button>

              <button
                onClick={() => setViewMode('client')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  viewMode === 'client'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Presentation className="h-3.5 w-3.5" />
                <span>Client View</span>
              </button>
            </div>

            {/* Google Workspace Sign-In per skill guidelines */}
            {user ? (
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1.5 border border-slate-800 text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-6 w-6 rounded-full border border-amber-500/40"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-medium text-slate-300 max-w-[140px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-1.5 text-xs font-semibold shadow-md transition-all border border-slate-200"
              >
                <div className="gsi-material-button-icon h-4 w-4">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-4 w-4"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Client View Mode */}
        {viewMode === 'client' ? (
          <ClientDashboard
            brand={activeBrand}
            items={brandContentItems}
            onOpenAdmin={() => setViewMode('admin')}
          />
        ) : (
          /* Admin Studio View Mode */
          <div className="space-y-6">
            {/* Top Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Active Brand Portfolio
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-100">{activeBrand.name}</h2>
                    <button
                      onClick={() => {
                        setEditingBrand(activeBrand);
                        setIsBrandModalOpen(true);
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-slate-800" />

                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Verified Views</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">
                      {totalBrandViews.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Followers</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      {activeBrand.currentFollowers.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Update Views Personally & Add Reel */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setMetricsTargetItem(null);
                    setIsMetricsModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Eye className="h-4 w-4" />
                  <span>Update Views &amp; Followers</span>
                </button>

                <button
                  onClick={() => {
                    setEditingContentItem(null);
                    setIsContentModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Creative</span>
                </button>
              </div>
            </div>

            {/* 3D Holographic Stage */}
            <ThreeScene
              brand={activeBrand}
              items={brandContentItems}
              selectedItemId={selectedItemId}
              onSelectItem={(item) => {
                setSelectedItemId(item.id);
                setMetricsTargetItem(item);
                setIsMetricsModalOpen(true);
              }}
            />

            {/* Admin Tool Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
              <button
                onClick={() => setAdminTab('reels')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                  adminTab === 'reels'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Reel Pipeline ({brandContentItems.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('sheets')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                  adminTab === 'sheets'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Google Sheets &amp; Analyzer</span>
              </button>

              <button
                onClick={() => setAdminTab('calendar')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                  adminTab === 'calendar'
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Google Calendar Releases</span>
              </button>

              <button
                onClick={() => setAdminTab('notifications')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                  adminTab === 'notifications'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Deadline Alerts &amp; Gmail</span>
              </button>

              <button
                onClick={() => setAdminTab('tasks')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all ${
                  adminTab === 'tasks'
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Google Tasks</span>
              </button>
            </div>

            {/* Tab 1: Reel Pipeline Grid */}
            {adminTab === 'reels' && (
              <div className="space-y-4">
                {/* Filter and stats row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-400 font-medium">Filter by Status:</span>
                    {['all', 'available', 'scheduled', 'published', 'in_review'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`rounded-lg px-2.5 py-1 capitalize transition-colors ${
                          statusFilter === st
                            ? 'bg-slate-800 text-amber-300 font-bold border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'All Creatives' : st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-400">
                    Showing {filteredItems.length} of {brandContentItems.length} reels
                  </span>
                </div>

                {/* Content Cards Grid */}
                {filteredItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400">
                    No creatives match this filter. Use the "+ Add Creative" button above to add reels!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        brand={activeBrand}
                        isSelected={selectedItemId === item.id}
                        onSelect={() => setSelectedItemId(item.id)}
                        onEditMetrics={(it) => {
                          setMetricsTargetItem(it);
                          setIsMetricsModalOpen(true);
                        }}
                        onEditContent={(it) => {
                          setEditingContentItem(it);
                          setIsContentModalOpen(true);
                        }}
                        onDeleteContent={(it) => setItemToDelete(it)}
                        onSyncCalendar={() => {
                          setAdminTab('calendar');
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Google Sheets & Analyzer */}
            {adminTab === 'sheets' && (
              <GoogleSheetsIntegration
                brand={activeBrand}
                items={brandContentItems}
                accessToken={accessToken}
                onImportItems={handleImportItems}
                onUpdateBrandSheetInfo={handleUpdateBrandSheetInfo}
              />
            )}

            {/* Tab 3: Google Calendar Integration */}
            {adminTab === 'calendar' && (
              <GoogleCalendarIntegration
                brand={activeBrand}
                items={brandContentItems}
                accessToken={accessToken}
                onUpdateItemCalendarEvent={handleUpdateItemCalendarEvent}
              />
            )}

            {/* Tab 4: Deadline Alerts & Gmail Notification Engine */}
            {adminTab === 'notifications' && (
              <DeadlineNotificationSystem
                brand={activeBrand}
                items={brandContentItems}
                accessToken={accessToken}
                onMarkNotified={handleMarkNotified}
              />
            )}

            {/* Tab 5: Google Tasks */}
            {adminTab === 'tasks' && (
              <GoogleTasksIntegration
                brand={activeBrand}
                items={brandContentItems}
                accessToken={accessToken}
              />
            )}
          </div>
        )}
      </main>

      {/* Manual Metrics & Followers Verification Modal */}
      <ManualMetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        brand={activeBrand}
        item={metricsTargetItem}
        onUpdateBrandFollowers={handleUpdateBrandFollowers}
        onUpdateItemMetrics={handleUpdateItemMetrics}
      />

      {/* Content Form Modal (Add / Edit Reel) */}
      <ContentFormModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        brandId={activeBrand.id}
        item={editingContentItem}
        nextItemNumber={brandContentItems.length + 1}
        onSave={handleSaveContentItem}
      />

      {/* Brand Modal (Add / Edit Brand) */}
      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brand={editingBrand}
        onSave={handleSaveBrand}
      />

      {/* Delete Item Confirmation Modal (MANDATORY for user confirmation) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950 p-6 shadow-2xl text-slate-100">
            <h4 className="text-base font-bold text-slate-100">Delete Content Creative</h4>
            <p className="mt-2 text-xs text-slate-300">
              Are you sure you want to remove <strong>"{itemToDelete.title}"</strong> from your content plan?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Delete Creative
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
