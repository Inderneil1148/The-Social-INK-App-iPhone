export type ContentStatus = 'available' | 'scripting' | 'in_review' | 'scheduled' | 'published';

export type PlatformType = 'Instagram Reel' | 'YouTube Shorts' | 'TikTok' | 'Meta Ad' | 'All Platforms';

export interface FollowerRecord {
  date: string;
  count: number;
  note?: string;
}

export interface MetricUpdateRecord {
  timestamp: string;
  views: number;
  likes: number;
  reach: number;
  comments: number;
  shares: number;
  inquiries: number;
  followersSnapshot: number;
  note?: string;
}

export interface ContentItem {
  id: string;
  brandId: string;
  itemNumber: number;
  title: string;
  mediaUrl: string;
  notes: string;
  status: ContentStatus;
  platform: PlatformType;
  targetDate: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  views: number;
  likes: number;
  reach: number;
  comments: number;
  shares: number;
  inquiries: number; // inquiries / sales leads generated
  calendarEventId?: string;
  taskId?: string;
  lastNotifiedAt?: string;
  metricHistory: MetricUpdateRecord[];
  createdAt: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  clientName: string;
  clientEmail: string;
  targetFollowers: number;
  currentFollowers: number;
  followerHistory: FollowerRecord[];
  primaryColor: string;
  accentColor: string;
  connectedSheetId?: string;
  connectedSheetUrl?: string;
  lastSheetSync?: string;
  createdAt: string;
}

export interface SheetAnalysisResult {
  totalRows: number;
  validItems: number;
  detectedColumns: string[];
  totalViews: number;
  avgViews: number;
  highestViewItem?: { title: string; views: number };
  missingLinksCount: number;
  deadlinesCount: number;
  upcomingDeadlines: { title: string; date: string }[];
  summaryInsights: string[];
}

export interface GoogleDriveSheetFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}
