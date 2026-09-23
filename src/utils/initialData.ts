import { Brand, ContentItem } from '../types/content';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-ganpati-silver',
    name: 'Kanakali Festive & Silver Jewels',
    category: 'Festive Luxury & Pure Silver Jewellery',
    clientName: 'Inderneil Kanagali',
    clientEmail: 'inderneilkanagali@gmail.com',
    targetFollowers: 25000,
    currentFollowers: 14850,
    followerHistory: [
      { date: '2026-09-01', count: 12200, note: 'Pre-festive season campaign kick-off' },
      { date: '2026-09-10', count: 13400, note: 'Ganpati teaser series launched' },
      { date: '2026-09-18', count: 14100, note: 'Silver pooja collection showcase' },
      { date: '2026-09-22', count: 14850, note: 'Current verified count entered by admin' },
    ],
    primaryColor: '#D97706', // Warm Amber / Gold
    accentColor: '#38BDF8', // Cyan Glow
    connectedSheetUrl: 'https://docs.google.com/spreadsheets/d/your-content-plan-sheet/edit',
    createdAt: '2026-09-01T10:00:00Z',
  },
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'content-1',
    brandId: 'brand-ganpati-silver',
    itemNumber: 1,
    title: 'Aarti set plate silver reel',
    mediaUrl:
      'https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipMN2HU0bLOUvbPZ-VDPzeKWHb9Y8EQCyI-J_LV2?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn',
    notes: 'Highlight 92.5 pure hallmark silver luster, intricate filigree detailing & Ganpati festive pooja plate setup. Add regional audio hook.',
    status: 'scheduled',
    platform: 'Instagram Reel',
    targetDate: '2026-09-24',
    deadlineTime: '18:30',
    views: 18450,
    likes: 1240,
    reach: 22100,
    comments: 98,
    shares: 215,
    inquiries: 34,
    metricHistory: [
      {
        timestamp: '2026-09-22T09:00:00Z',
        views: 18450,
        likes: 1240,
        reach: 22100,
        comments: 98,
        shares: 215,
        inquiries: 34,
        followersSnapshot: 14850,
        note: 'Admin manual count after 48h active boost',
      },
    ],
    createdAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'content-2',
    brandId: 'brand-ganpati-silver',
    itemNumber: 2,
    title: 'Fancy 2 in 1 Tops reel',
    mediaUrl:
      'https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipPWIaSY8m85b1l6J7V9PIpvxx10qDwgrcfQotVQ?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn',
    notes: 'Demonstrate dual convertible wearability (stud to dangling festive drop). Focus on macro sparkle and lightweight comfort.',
    status: 'available',
    platform: 'Instagram Reel',
    targetDate: '2026-09-26',
    deadlineTime: '19:00',
    views: 9230,
    likes: 710,
    reach: 12800,
    comments: 52,
    shares: 88,
    inquiries: 19,
    metricHistory: [
      {
        timestamp: '2026-09-21T15:30:00Z',
        views: 9230,
        likes: 710,
        reach: 12800,
        comments: 52,
        shares: 88,
        inquiries: 19,
        followersSnapshot: 14600,
        note: 'Initial organic reel view audit',
      },
    ],
    createdAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'content-3',
    brandId: 'brand-ganpati-silver',
    itemNumber: 3,
    title: 'Fancy Buggdi 18k reel',
    mediaUrl:
      'https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipPuFiJT9ourvCc8Via05PVABbtsYdT8kP9xqHMJ?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn',
    notes: 'Traditional Maharashtrian Buggdi upper-ear ornament in 18k finish. Target festive heritage styling and bridal accessories.',
    status: 'in_review',
    platform: 'Instagram Reel',
    targetDate: '2026-09-28',
    deadlineTime: '20:00',
    views: 14120,
    likes: 1105,
    reach: 19400,
    comments: 87,
    shares: 164,
    inquiries: 42,
    metricHistory: [
      {
        timestamp: '2026-09-22T10:15:00Z',
        views: 14120,
        likes: 1105,
        reach: 19400,
        comments: 87,
        shares: 164,
        inquiries: 42,
        followersSnapshot: 14850,
        note: 'Admin verified view numbers',
      },
    ],
    createdAt: '2026-09-20T12:00:00Z',
  },
  {
    id: 'content-4',
    brandId: 'brand-ganpati-silver',
    itemNumber: 4,
    title: 'Gold plated necklace for Ganpati reel',
    mediaUrl:
      'https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipN23G8hYV5L9lv8T-Ipt5SMSbwy7RzE3xOkPjWs?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn',
    notes: 'Hero statement necklace for Bappa & deity adornment / festive family wear. Include price on request callout and DM prompt.',
    status: 'published',
    platform: 'Instagram Reel',
    targetDate: '2026-09-21',
    deadlineTime: '17:00',
    views: 32680,
    likes: 2840,
    reach: 48900,
    comments: 210,
    shares: 532,
    inquiries: 118,
    metricHistory: [
      {
        timestamp: '2026-09-22T11:00:00Z',
        views: 32680,
        likes: 2840,
        reach: 48900,
        comments: 210,
        shares: 532,
        inquiries: 118,
        followersSnapshot: 14850,
        note: 'Top trending reel of the festive collection',
      },
    ],
    createdAt: '2026-09-20T12:00:00Z',
  },
];

export const STORAGE_KEY_BRANDS = 'brandpulse_brands_v1';
export const STORAGE_KEY_CONTENT = 'brandpulse_content_v1';

export function loadSavedBrands(): Brand[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BRANDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored brands:', e);
  }
  return INITIAL_BRANDS;
}

export function loadSavedContent(): ContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONTENT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored content:', e);
  }
  return INITIAL_CONTENT_ITEMS;
}

export function saveBrandsToStorage(brands: Brand[]) {
  try {
    localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
  } catch (e) {
    console.error('Error saving brands:', e);
  }
}

export function saveContentToStorage(items: ContentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CONTENT, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving content items:', e);
  }
}
