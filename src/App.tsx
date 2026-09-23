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
import { ClientBrandKit, SocialMilestone, SocialPlatform } from './types/brandKit';
import {
  loadStoredClientKits,
  saveClientKits,
  loadActiveClientId,
  saveActiveClientId,
} from './utils/brandKitData';
import { ClientThemeSwitcher } from './components/ClientThemeSwitcher';
import { BrandKitWorkspace } from './components/BrandKitWorkspace';
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
import { Interactive3DFollowerText } from './components/Interactive3DFollowerText';
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
  const [adminTab, setAdminTab] = useState<
    'brand-kit' | 'reels' | 'sheets' | 'calendar' | 'notifications' | 'tasks'
  >('brand-kit');

  // Brand Kits state with LocalStorage persistence - Blank database by default
  const [clientKits, setClientKits] = useState<ClientBrandKit[]>(() => loadStoredClientKits());
  const [activeClientKitId, setActiveClientKitId] = useState<string>(() =>
    loadActiveClientId(loadStoredClientKits())
  );
  const [isHighContrastMode, setIsHighContrastMode] = useState<boolean>(() => {
    return localStorage.getItem('social_brand_kit_contrast_mode') === 'true';
  });

  // Brands and Content state - Zero initial data
  const [brands, setBrands] = useState<Brand[]>(() => loadSavedBrands());
  const [activeBrandId, setActiveBrandId] = useState<string>(() => loadSavedBrands()[0]?.id || '');
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => loadSavedContent());

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modal dialog states
  const [isAddClientKitModalOpen, setIsAddClientKitModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [metricsTargetItem, setMetricsTargetItem] = useState<ContentItem | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingContentItem, setEditingContentItem] = useState<ContentItem | null>(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Delete confirmation modal
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  // Clear legacy mock datasets on first launch
  useEffect(() => {
    try {
      localStorage.removeItem('the_social_brand_kit_clients_v2');
      localStorage.removeItem('the_social_brand_kit_active_client_id');
      localStorage.removeItem('brandpulse_brands_v1');
      localStorage.removeItem('brandpulse_content_v1');
    } catch (e) {
      // ignore
    }
  }, []);

  // LocalStorage persistence effects
  useEffect(() => {
    saveClientKits(clientKits);
  }, [clientKits]);

  useEffect(() => {
    saveActiveClientId(activeClientKitId);
  }, [activeClientKitId]);

  useEffect(() => {
    saveBrandsToStorage(brands);
  }, [brands]);

  useEffect(() => {
    saveContentToStorage(contentItems);
  }, [contentItems]);

  useEffect(() => {
    localStorage.setItem('social_brand_kit_contrast_mode', isHighContrastMode ? 'true' : 'false');
  }, [isHighContrastMode]);

  // Active Client Kit (or null if database is empty)
  const activeClientKit: ClientBrandKit | null =
    clientKits.find((k) => k.id === activeClientKitId) || clientKits[0] || null;

  // Active Brand (synced to active kit, or null)
  const activeBrand: Brand | null =
    brands.find((b) => b.id === activeBrandId) ||
    brands[0] ||
    (activeClientKit
      ? {
          id: activeClientKit.id,
          name: activeClientKit.companyName,
          category: activeClientKit.category,
          clientName: activeClientKit.clientName,
          clientEmail: activeClientKit.footprint?.email || 'client@brand.com',
          currentFollowers: activeClientKit.socialMilestones[0]?.currentCount || 0,
          targetFollowers: activeClientKit.socialMilestones[0]?.targetCount || 10000,
          followerHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              count: activeClientKit.socialMilestones[0]?.currentCount || 0,
              note: 'Initial brand kit creation',
            },
          ],
          primaryColor: activeClientKit.primaryColor,
          accentColor: activeClientKit.accentColor,
          createdAt: activeClientKit.createdAt,
        }
      : null);

  const handleUpdateClientKit = (updatedKit: ClientBrandKit) => {
    setClientKits((prev) =>
      prev.map((k) => (k.id === updatedKit.id ? updatedKit : k))
    );

    // Sync follower count with brand if active
    const activeMilestone = updatedKit.socialMilestones.find(
      (m) => m.platform === updatedKit.activePlatform
    );
    if (activeMilestone) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === activeBrandId
            ? { ...b, currentFollowers: activeMilestone.currentCount }
            : b
        )
      );
    }
  };

  const handleAddNewClientKit = (newKit: ClientBrandKit) => {
    setClientKits((prev) => [newKit, ...prev]);
    setActiveClientKitId(newKit.id);

    // Also add to brands list so content pipeline can use it
    const newBrand: Brand = {
      id: newKit.id,
      name: newKit.companyName,
      category: newKit.category,
      clientName: newKit.clientName,
      clientEmail: newKit.footprint.email || 'client@brand.com',
      currentFollowers: newKit.socialMilestones[0]?.currentCount || 0,
      targetFollowers: newKit.socialMilestones[0]?.targetCount || 10000,
      followerHistory: [
        {
          date: new Date().toISOString().split('T')[0],
          count: newKit.socialMilestones[0]?.currentCount || 0,
          note: 'Initial brand kit creation',
        },
      ],
      primaryColor: newKit.primaryColor,
      accentColor: newKit.accentColor,
      createdAt: new Date().toISOString(),
    };
    setBrands((prev) => [newBrand, ...prev]);
    setActiveBrandId(newKit.id);
  };

  const handleSelectClientKit = (id: string) => {
    setActiveClientKitId(id);
    const matchingBrand = brands.find((b) => b.id === id);
    if (matchingBrand) {
      setActiveBrandId(id);
    }
  };

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

  const brandContentItems = activeBrand
    ? contentItems.filter((i) => i.brandId === activeBrand.id)
    : [];

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
              followersSnapshot: activeBrand ? activeBrand.currentFollowers : 0,
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
    if (!activeBrand) return;
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
      const otherBrands = activeBrand
        ? prev.filter((i) => i.brandId !== activeBrand.id)
        : prev;
      return [...otherBrands, ...newItems];
    });
  };

  const handleUpdateBrandSheetInfo = (sheetId: string, sheetUrl: string) => {
    if (!activeBrand) return;
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
    <div
      className="min-h-screen bg-[#09090b] bg-grid-minimal text-zinc-100 selection:bg-white selection:text-black transition-colors duration-300 relative"
      style={
        {
          '--client-primary': activeClientKit?.primaryColor || '#ffffff',
          '--client-accent': activeClientKit?.accentColor || '#ffffff',
          '--client-glow': activeClientKit?.highlightGlow || 'rgba(255, 255, 255, 0.1)',
        } as React.CSSProperties
      }
    >
      {/* Top Main Navigation Bar - Minimalist Monochrome */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
          {/* Logo & Brand Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black shadow-md font-black transition-transform hover:scale-105">
              <Sparkles className="h-4 w-4 fill-black" />
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-base font-bold tracking-tight text-white truncate">
                  The Social Brand <span className="text-zinc-300 font-light">Kit</span>
                </span>
                <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
                  STUDIO
                </span>
              </div>

              {/* Active Brand Selector */}
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 min-w-0">
                <Building2 className="h-3 w-3 text-zinc-400 shrink-0" />
                <span className="font-medium text-zinc-300 truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-none">
                  {activeClientKit ? activeClientKit.companyName : 'Zero Brands Configured'}
                </span>
                {activeClientKit && (
                  <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline shrink-0">
                    ({activeClientKit.socialMilestones[0]?.handle || '@brand'})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Minimalist Live Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 shrink-0 ml-2">
            <span
              className={`h-2 w-2 rounded-full ${
                activeClientKit ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span className="font-mono text-[11px] text-zinc-300 hidden xs:inline">
              {activeClientKit ? 'Live Kit' : 'Blank Studio'}
            </span>
          </div>
        </div>
      </header>

      {/* Dynamic Client Theme Switcher & Toolbar */}
      <ClientThemeSwitcher
        clients={clientKits}
        activeClient={activeClientKit}
        onSelectClient={handleSelectClientKit}
        onAddNewClient={handleAddNewClientKit}
        isHighContrastMode={isHighContrastMode}
        onToggleHighContrast={() => setIsHighContrastMode(!isHighContrastMode)}
        isAddModalOpen={isAddClientKitModalOpen}
        setIsAddModalOpen={setIsAddClientKitModalOpen}
      />

      {/* Main Content Area - Cohesive CSS Grid Layout with Stacking Isolation */}
      <main className="relative z-0 isolate mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 auto-rows-max items-start">
        {!activeClientKit ? (
          <div className="w-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-zinc-950/60 p-6 sm:p-12 md:p-16 text-center backdrop-blur-xl shadow-2xl relative z-0 isolate">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white shadow-inner">
              <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 stroke-[1.5]" />
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/15">
              Clean Slate Active
            </span>

            <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              Studio Database is Blank
            </h2>

            <p className="mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
              All demo brand kits, sample assets, and follower counts have been deleted. There are zero data records in the database. You can start creating your brand kits now or after publishing the app.
            </p>

            <button
              onClick={() => setIsAddClientKitModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Create First Brand Kit</span>
            </button>
          </div>
        ) : viewMode === 'client' ? (
          <div className="w-full min-w-0 relative z-0 isolate">
            <ClientDashboard
              brand={activeBrand!}
              items={brandContentItems}
              onOpenAdmin={() => setViewMode('admin')}
            />
          </div>
        ) : (
          /* Admin Studio View Mode */
          <div className="w-full min-w-0 grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 relative z-0 isolate">
            {/* Top Quick Actions Bar - Device-adaptive for Mobile, Tablet, and Laptop */}
            {activeBrand && (
              <div className="relative z-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 sm:p-5 lg:px-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
                {/* Left: Brand Identity & Aligned Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-4 sm:gap-6">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                          Active Portfolio
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate max-w-[200px] sm:max-w-xs md:max-w-none">
                          {activeBrand.name}
                        </h2>
                        <button
                          onClick={() => {
                            setEditingBrand(activeBrand);
                            setIsBrandModalOpen(true);
                          }}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-white/10 bg-white/5 transition-colors shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block h-8 w-px bg-white/10 shrink-0" />

                  {/* Metrics: Side-by-side on mobile, aligned on tab & desktop */}
                  <div className="grid grid-cols-2 sm:flex items-center gap-4 sm:gap-6 border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                        Verified Views
                      </span>
                      <span className="font-mono font-bold text-white text-base sm:text-lg tracking-tight mt-0.5">
                        {totalBrandViews.toLocaleString()}
                      </span>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-white/10" />

                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider">
                        Followers
                      </span>
                      <div className="mt-0.5">
                        <Interactive3DFollowerText
                          count={activeBrand.currentFollowers}
                          size="compact"
                          onClick={() => {
                            setMetricsTargetItem(null);
                            setIsMetricsModalOpen(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions - Full width equal grid on mobile, inline row on tab & desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto border-t border-white/10 pt-3 lg:border-t-0 lg:pt-0">
                  <button
                    onClick={() => {
                      setMetricsTargetItem(null);
                      setIsMetricsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-4 py-2.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                  >
                    <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Update Views &amp; Followers</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingContentItem(null);
                      setIsContentModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-white/15 hover:border-white/30 font-medium text-xs px-3.5 py-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Creative</span>
                  </button>
                </div>
              </div>
            )}

            {/* Admin Tool Navigation Tabs - Scrollable on mobile, wrapping cleanly on tab/laptop */}
            <div className="relative z-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap text-xs border-b border-white/10">
              <button
                onClick={() => setAdminTab('brand-kit')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'brand-kit'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Brand Kit Workspace</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                    adminTab === 'brand-kit' ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                  }`}
                >
                  CORE
                </span>
              </button>

              <button
                onClick={() => setAdminTab('reels')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'reels'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                <span>3D Stage &amp; Reels ({brandContentItems.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('sheets')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'sheets'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
                <span>Google Sheets &amp; Analyzer</span>
              </button>

              <button
                onClick={() => setAdminTab('calendar')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'calendar'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Google Calendar</span>
              </button>

              <button
                onClick={() => setAdminTab('notifications')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'notifications'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bell className="h-3.5 w-3.5 shrink-0" />
                <span>Deadline Alerts &amp; Gmail</span>
              </button>

              <button
                onClick={() => setAdminTab('tasks')}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-semibold ${
                  adminTab === 'tasks'
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                <span>Google Tasks</span>
              </button>
            </div>

            {/* Tab 0: Brand Kit Flagship Workspace */}
            {adminTab === 'brand-kit' && (
              <BrandKitWorkspace
                client={activeClientKit}
                onUpdateClient={handleUpdateClientKit}
                isHighContrastMode={isHighContrastMode}
              />
            )}

            {/* Tab 1: 3D Stage & Reel Pipeline Grid */}
            {adminTab === 'reels' && (
              <div className="space-y-6">
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
      {activeBrand && (
        <ManualMetricsModal
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
          brand={activeBrand}
          item={metricsTargetItem}
          onUpdateBrandFollowers={handleUpdateBrandFollowers}
          onUpdateItemMetrics={handleUpdateItemMetrics}
        />
      )}

      {/* Content Form Modal (Add / Edit Reel) */}
      <ContentFormModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        brandId={activeBrand ? activeBrand.id : ''}
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
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
