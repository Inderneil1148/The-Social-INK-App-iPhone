export type ColorRole = 'primary' | 'secondary' | 'accent' | 'neutral' | 'dark' | 'surface';

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  role: ColorRole;
  usage: string;
  lightText?: boolean;
}

export interface TypographyStyle {
  id: string;
  role: string;
  fontName: string;
  category: 'Sans-serif' | 'Serif' | 'Monospace' | 'Display';
  weights: string[];
  specimen: string;
  usageNote: string;
  googleFontName?: string;
}

export interface BrandIdentity {
  logoUrl: string;
  logoDarkUrl?: string;
  logoLightUrl?: string;
  iconUrl: string;
  faviconUrl?: string;
  colors: BrandColor[];
  typography: TypographyStyle[];
  tagline: string;
  brandVoiceKeywords: string[];
}

export type CopyCategory =
  | 'Instagram Bio'
  | 'Elevator Pitch'
  | 'Boilerplate'
  | 'Caption Preset'
  | 'DM Template'
  | 'Hashtag Set'
  | 'Press Notice';

export interface CopyPresetItem {
  id: string;
  title: string;
  category: CopyCategory;
  content: string;
  tags?: string[];
  charLimit?: number;
}

export interface CustomQuickLink {
  id: string;
  title: string;
  url: string;
  iconType: 'drive' | 'deck' | 'press' | 'notion' | 'figma' | 'other';
  badge?: string;
}

export interface DigitalFootprint {
  websiteUrl: string;
  displayWebsite: string;
  phone: string;
  email: string;
  address: string;
  mapCoordinates: string;
  mapEmbedUrl?: string;
  googleMapsLink: string;
  driveLink?: string;
  deckLink?: string;
  pressKitLink?: string;
  customLinks: CustomQuickLink[];
}

export type MediaCategory = 'Mockup' | 'Campaign' | 'Product' | 'Logo Variant' | 'Packaging' | 'Hero';

export interface MediaAssetItem {
  id: string;
  title: string;
  category: MediaCategory;
  imageUrl: string;
  dimensions?: string;
  fileFormat?: string;
  fileSize?: string;
  tags?: string[];
}

export type SocialPlatform = 'Instagram' | 'YouTube' | 'LinkedIn' | 'TikTok' | 'Twitter/X';

export interface MilestoneHistory {
  date: string;
  count: number;
  note: string;
}

export interface SocialMilestone {
  id: string;
  platform: SocialPlatform;
  currentCount: number;
  targetCount: number;
  handle: string;
  profileUrl?: string;
  milestoneBadge: string;
  growthRatePercent?: number;
  history: MilestoneHistory[];
}

export interface ClientBrandKit {
  id: string;
  clientName: string;
  companyName: string;
  category: string;
  tagline: string;
  // Extracted Theme Palettes
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  highlightGlow: string;
  surfaceBg: string;
  // Core Modules
  identity: BrandIdentity;
  copyPresets: CopyPresetItem[];
  footprint: DigitalFootprint;
  mediaGallery: MediaAssetItem[];
  socialMilestones: SocialMilestone[];
  activePlatform: SocialPlatform;
  createdAt: string;
  lastUpdated: string;
}
