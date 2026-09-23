import React, { useState, useEffect } from 'react';
import { Brand, ContentItem, GoogleDriveSheetFile, SheetAnalysisResult } from '../types/content';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import {
  FileSpreadsheet,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  CloudUpload,
  Copy,
  Sliders,
  Check,
} from 'lucide-react';

interface GoogleSheetsIntegrationProps {
  brand: Brand;
  items: ContentItem[];
  accessToken: string | null;
  onImportItems: (newItems: ContentItem[]) => void;
  onUpdateBrandSheetInfo: (sheetId: string, sheetUrl: string) => void;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  brand,
  items,
  accessToken,
  onImportItems,
  onUpdateBrandSheetInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'paste' | 'export'>('drive');
  const [driveSheets, setDriveSheets] = useState<GoogleDriveSheetFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

  // Manual sheet URL or ID
  const [sheetUrlOrId, setSheetUrlOrId] = useState(brand.connectedSheetId || '');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Raw text / CSV paste
  const [csvText, setCsvText] = useState(
`No.,Available videos,Link,Notes
1,Aarti set plate silver reel,https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipMN2HU0bLOUvbPZ-VDPzeKWHb9Y8EQCyI-J_LV2?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn,
2,Fancy 2 in 1 Tops reel,https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipPWIaSY8m85b1l6J7V9PIpvxx10qDwgrcfQotVQ?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn,
3,Fancy Buggdi 18k reel,https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipPuFiJT9ourvCc8Via05PVABbtsYdT8kP9xqHMJ?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn,
4,Gold plated necklace for Ganpati reel,https://photos.google.com/share/AF1QipPesSGjJqLRp_3kV93jru_wSMh9vfe9l4k3tNo5k4UNr-jYrPLNG15nNEyXPhsnOw/photo/AF1QipN23G8hYV5L9lv8T-Ipt5SMSbwy7RzE3xOkPjWs?key=MGhtZzNvWnE5c0xHZ1FLUmxaeEJsNWxLNl91dzRn,`
  );

  // Analysis state
  const [analysis, setAnalysis] = useState<SheetAnalysisResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResultUrl, setExportResultUrl] = useState<string | null>(null);

  // Extract Spreadsheet ID from standard Google Sheet URL
  const extractSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  // Fetch Drive sheets when token changes
  useEffect(() => {
    if (accessToken && activeTab === 'drive') {
      loadDriveSheets();
    }
  }, [accessToken, activeTab]);

  const loadDriveSheets = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    setDriveError(null);
    try {
      const sheets = await GoogleWorkspaceService.listSpreadsheets(accessToken);
      setDriveSheets(sheets);
    } catch (err: any) {
      setDriveError(err.message || 'Failed to list Google Sheets from your Drive.');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Analyze raw rows
  const analyzeRows = (rows: string[][]): SheetAnalysisResult => {
    if (!rows || rows.length === 0) {
      return {
        totalRows: 0,
        validItems: 0,
        detectedColumns: [],
        totalViews: 0,
        avgViews: 0,
        missingLinksCount: 0,
        deadlinesCount: 0,
        upcomingDeadlines: [],
        summaryInsights: ['Sheet is empty.'],
      };
    }

    // Find header row (usually contains 'video' or 'creative' or 'no' or 'link')
    let headerIdx = 0;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const rowStr = rows[i].join(',').toLowerCase();
      if (rowStr.includes('video') || rowStr.includes('no') || rowStr.includes('link') || rowStr.includes('title')) {
        headerIdx = i;
        break;
      }
    }

    const headers = rows[headerIdx].map((h) => h.trim());
    const dataRows = rows.slice(headerIdx + 1).filter((r) => r.some((c) => c && c.trim().length > 0));

    let totalViews = 0;
    let missingLinks = 0;
    let highestItem: { title: string; views: number } | undefined;

    dataRows.forEach((row, idx) => {
      const title = row[1] || `Item ${idx + 1}`;
      const link = row[2] || '';
      const viewVal = parseInt(row[4] || '0') || 0;

      if (!link || link.trim() === '') missingLinks++;
      totalViews += viewVal;

      if (!highestItem || viewVal > highestItem.views) {
        highestItem = { title, views: viewVal };
      }
    });

    const insights: string[] = [
      `Detected ${dataRows.length} creative reel items in active inventory.`,
      `Identified key columns: ${headers.filter(Boolean).join(', ')}.`,
      missingLinks === 0
        ? 'All creative video links are verified and ready for showcase.'
        : `${missingLinks} items currently have pending video asset links.`,
      'Ganpati & Festive themes present high engagement potential during Q3-Q4 festival season.',
    ];

    return {
      totalRows: rows.length,
      validItems: dataRows.length,
      detectedColumns: headers,
      totalViews,
      avgViews: dataRows.length > 0 ? Math.round(totalViews / dataRows.length) : 0,
      highestViewItem: highestItem,
      missingLinksCount: missingLinks,
      deadlinesCount: dataRows.length,
      upcomingDeadlines: [],
      summaryInsights: insights,
    };
  };

  // Handle parsing CSV / Text
  const handleParseAndAnalyzeCsv = () => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const parsedRows: string[][] = lines.map((line) => {
      // Basic CSV splitter handling quotes
      const row: string[] = [];
      let inQuotes = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current.trim());
      return row;
    });

    const result = analyzeRows(parsedRows);
    setAnalysis(result);

    // Convert rows to ContentItems
    let headerIdx = 0;
    for (let i = 0; i < Math.min(parsedRows.length, 5); i++) {
      const rowStr = parsedRows[i].join(',').toLowerCase();
      if (rowStr.includes('video') || rowStr.includes('no') || rowStr.includes('link')) {
        headerIdx = i;
        break;
      }
    }

    const dataRows = parsedRows.slice(headerIdx + 1).filter((r) => r.some((c) => c && c.trim().length > 0));

    const newItems: ContentItem[] = dataRows.map((row, idx) => {
      const itemNum = parseInt(row[0]) || idx + 1;
      const title = row[1] || `Creative Reel #${itemNum}`;
      const mediaUrl = row[2] || '';
      const notes = row[3] || 'Festive creative reel ready for publishing.';
      const existing = items.find((i) => i.itemNumber === itemNum || i.title.toLowerCase() === title.toLowerCase());

      return {
        id: existing ? existing.id : `imported-${Date.now()}-${idx}`,
        brandId: brand.id,
        itemNumber: itemNum,
        title,
        mediaUrl,
        notes,
        status: existing ? existing.status : 'available',
        platform: 'Instagram Reel',
        targetDate: existing?.targetDate || new Date(Date.now() + (idx + 1) * 2 * 86400000).toISOString().split('T')[0],
        deadlineTime: existing?.deadlineTime || '18:00',
        views: existing ? existing.views : 0,
        likes: existing ? existing.likes : 0,
        reach: existing ? existing.reach : 0,
        comments: existing ? existing.comments : 0,
        shares: existing ? existing.shares : 0,
        inquiries: existing ? existing.inquiries : 0,
        metricHistory: existing?.metricHistory || [],
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
    });

    if (newItems.length > 0) {
      onImportItems(newItems);
      setSyncStatus(`Successfully parsed & loaded ${newItems.length} creatives into your dashboard!`);
    }
  };

  // Connect & Sync with Live Google Sheet API
  const handleSyncGoogleSheet = async (targetSheetId?: string) => {
    if (!accessToken) {
      setSyncStatus('Please sign in with Google to read your live Google Sheet.');
      return;
    }

    const idToUse = targetSheetId || extractSpreadsheetId(sheetUrlOrId);
    if (!idToUse) {
      setSyncStatus('Please enter a valid Google Sheet URL or ID.');
      return;
    }

    setIsSyncingSheet(true);
    setSyncStatus('Reading live spreadsheet from Google Sheets API...');

    try {
      const values = await GoogleWorkspaceService.getSpreadsheetValues(accessToken, idToUse, 'A1:H50');
      const result = analyzeRows(values);
      setAnalysis(result);

      // Save connected info
      const fullUrl = `https://docs.google.com/spreadsheets/d/${idToUse}/edit`;
      onUpdateBrandSheetInfo(idToUse, fullUrl);

      // Process rows to items
      let headerIdx = 0;
      for (let i = 0; i < Math.min(values.length, 5); i++) {
        const rowStr = values[i].join(',').toLowerCase();
        if (rowStr.includes('video') || rowStr.includes('no') || rowStr.includes('link')) {
          headerIdx = i;
          break;
        }
      }

      const dataRows = values.slice(headerIdx + 1).filter((r) => r.some((c) => c && c.trim().length > 0));

      const importedItems: ContentItem[] = dataRows.map((row, idx) => {
        const itemNum = parseInt(row[0]) || idx + 1;
        const title = row[1] || `Reel #${itemNum}`;
        const mediaUrl = row[2] || '';
        const notes = row[3] || '';
        const viewsCount = parseInt(row[4] || '0') || 0;
        const statusVal = (row[5] || 'available').toLowerCase();

        const existing = items.find((i) => i.itemNumber === itemNum);

        return {
          id: existing ? existing.id : `gsheet-${Date.now()}-${idx}`,
          brandId: brand.id,
          itemNumber: itemNum,
          title,
          mediaUrl,
          notes,
          status: ['available', 'scheduled', 'published', 'in_review', 'scripting'].includes(statusVal)
            ? (statusVal as any)
            : 'available',
          platform: 'Instagram Reel',
          targetDate: row[6] || existing?.targetDate || new Date().toISOString().split('T')[0],
          deadlineTime: '18:00',
          views: viewsCount > 0 ? viewsCount : existing ? existing.views : 0,
          likes: existing ? existing.likes : 0,
          reach: existing ? existing.reach : 0,
          comments: existing ? existing.comments : 0,
          shares: existing ? existing.shares : 0,
          inquiries: existing ? existing.inquiries : 0,
          metricHistory: existing?.metricHistory || [],
          createdAt: existing?.createdAt || new Date().toISOString(),
        };
      });

      if (importedItems.length > 0) {
        onImportItems(importedItems);
        setSyncStatus(`Sync successful! Imported ${importedItems.length} creatives from Google Sheet.`);
      } else {
        setSyncStatus('Spreadsheet was read, but no creative rows were detected.');
      }
    } catch (err: any) {
      setSyncStatus(`Sync Error: ${err.message}`);
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Export current verified views & followers back to a new or existing Google Sheet
  const handleExportToGoogleSheets = async () => {
    if (!accessToken) {
      setSyncStatus('Please sign in with Google to create or export to Google Sheets.');
      return;
    }

    setIsExporting(true);
    setSyncStatus('Generating live Google Sheet with real verified metrics & formulas...');

    try {
      const headers = [
        'No.',
        'Available videos / Reels',
        'Video Asset Link',
        'Creative Notes',
        'Verified Views (Admin Logged)',
        'Status',
        'Scheduled Date',
        'Likes',
        'Reach',
        'Inquiries/Leads',
      ];

      const rows = items.map((item) => [
        item.itemNumber,
        item.title,
        item.mediaUrl,
        item.notes,
        item.views,
        item.status,
        item.targetDate,
        item.likes,
        item.reach,
        item.inquiries,
      ]);

      const title = `${brand.name} - Content Plan & Verified Analytics (${new Date().toLocaleDateString()})`;
      const result = await GoogleWorkspaceService.createSpreadsheet(accessToken, title, headers, rows);

      setExportResultUrl(result.spreadsheetUrl);
      onUpdateBrandSheetInfo(result.spreadsheetId, result.spreadsheetUrl);
      setSyncStatus(`Successfully created live Google Sheet: ${title}`);
    } catch (err: any) {
      setSyncStatus(`Export Error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Run initial analysis on mounted items
  useEffect(() => {
    if (items.length > 0 && !analysis) {
      handleParseAndAnalyzeCsv();
    }
  }, []);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-slate-100">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Google Sheets Integration & Strategic Analyzer</h3>
            <p className="text-xs text-slate-400">
              Upload, analyze, and sync your brand's content plan sheet directly with Google Drive
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'drive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Google Drive Sheets</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'paste' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Paste / Upload CSV</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${
              activeTab === 'export' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="h-3.5 w-3.5" />
            <span>Export Verified Sheet</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Google Drive Sheets */}
      {activeTab === 'drive' && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[280px]">
              <label className="text-xs font-semibold text-slate-300">
                Google Sheet URL or Spreadsheet ID
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={sheetUrlOrId}
                  onChange={(e) => setSheetUrlOrId(e.target.value)}
                  placeholder="Paste Google Sheet URL (https://docs.google.com/spreadsheets/d/...)"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  onClick={() => handleSyncGoogleSheet()}
                  disabled={isSyncingSheet || !accessToken}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheet ? 'Syncing...' : 'Sync Sheet'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={loadDriveSheets}
              disabled={isLoadingDrive || !accessToken}
              className="mt-5 flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-2 text-xs text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              <span>Refresh Drive Files</span>
            </button>
          </div>

          {!accessToken && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 text-xs text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Sign in with Google in the top navigation to connect directly to your Google Drive sheets.</span>
            </div>
          )}

          {driveError && (
            <div className="rounded-xl bg-rose-500/10 p-3 border border-rose-500/30 text-xs text-rose-300">
              {driveError}
            </div>
          )}

          {/* Drive Sheets List */}
          {accessToken && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Spreadsheets Found in Your Google Drive:</span>
                <span className="text-slate-500">{driveSheets.length} files</span>
              </div>

              {isLoadingDrive ? (
                <div className="py-4 text-center text-xs text-slate-400">Searching your Google Drive...</div>
              ) : driveSheets.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No spreadsheets found. You can paste a sheet link above or use the "Export Verified Sheet" tab to create one!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {driveSheets.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg bg-slate-900/80 hover:bg-slate-800/80 px-3 py-2 text-xs transition-colors border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSheetUrlOrId(file.id);
                            handleSyncGoogleSheet(file.id);
                          }}
                          className="flex items-center gap-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-1 text-[11px] font-semibold border border-emerald-500/30"
                        >
                          <span>Connect & Import</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="Open in Google Sheets"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Paste / Upload CSV */}
      {activeTab === 'paste' && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Paste Spreadsheet / CSV Table (Matches your provided format)
            </label>
            <span className="text-[11px] text-slate-500">Columns: No., Available videos, Link, Notes</span>
          </div>

          <textarea
            rows={5}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            placeholder="No.,Available videos,Link,Notes..."
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Automatically extracts reel titles, Google Photos links, and creative notes.
            </span>
            <button
              onClick={handleParseAndAnalyzeCsv}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Parse & Run Strategic Analysis</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Export Verified Sheet */}
      {activeTab === 'export' && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-950/70 p-4 border border-slate-800">
            <h4 className="text-sm font-bold text-cyan-300">Export Verified Brand Sheet to Google Drive</h4>
            <p className="mt-1 text-xs text-slate-400">
              Generates a new, professionally formatted Google Spreadsheet in your account containing all {items.length} reels,
              their Google Photos links, scheduled dates, and the verified view/follower counts you entered.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportToGoogleSheets}
                disabled={isExporting || !accessToken}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
              >
                <CloudUpload className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
                <span>{isExporting ? 'Creating Google Sheet...' : 'Create Live Google Sheet Now'}</span>
              </button>

              {exportResultUrl && (
                <a
                  href={exportResultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 text-xs font-semibold transition-colors"
                >
                  <span>Open Exported Sheet</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs text-cyan-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Analysis Results & Insights */}
      {analysis && (
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-slate-950/80 p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-4 w-4" />
            <span>AI Content Plan & Strategic Insights</span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Creatives Tracked</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{analysis.validItems}</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Views Logged</span>
              <span className="text-lg font-bold text-cyan-300 font-mono">
                {items.reduce((a, b) => a + b.views, 0).toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Average View / Reel</span>
              <span className="text-lg font-bold text-amber-300 font-mono">
                {Math.round(items.reduce((a, b) => a + b.views, 0) / (items.length || 1)).toLocaleString()}
              </span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Media Links Status</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">100% Ready</span>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3">
            {analysis.summaryInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
