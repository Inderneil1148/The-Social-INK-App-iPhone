import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brand, ContentItem, GoogleCalendarEventItem } from '../types/content';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Clock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Video,
  Sparkles,
} from 'lucide-react';

interface GoogleCalendarIntegrationProps {
  brand: Brand;
  items: ContentItem[];
  accessToken: string | null;
  onUpdateItemCalendarEvent: (itemId: string, eventId: string) => void;
}

export const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({
  brand,
  items,
  accessToken,
  onUpdateItemCalendarEvent,
}) => {
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Destructive confirmation state
  const [eventToDelete, setEventToDelete] = useState<{ id: string; summary: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch events when access token is available
  useEffect(() => {
    if (accessToken) {
      loadCalendarEvents();
    }
  }, [accessToken]);

  const loadCalendarEvents = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const events = await GoogleWorkspaceService.listCalendarEvents(accessToken);
      setCalendarEvents(events);
    } catch (err: any) {
      setStatusMessage(`Error loading Calendar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync a specific creative release to Google Calendar
  const handleSyncItemToCalendar = async (item: ContentItem) => {
    if (!accessToken) {
      setStatusMessage('Please sign in with Google to create Google Calendar events.');
      return;
    }

    setSyncingItemId(item.id);
    setStatusMessage(null);

    try {
      const targetDate = item.targetDate || new Date().toISOString().split('T')[0];
      const timeStr = item.deadlineTime || '18:00';
      const startDateTime = new Date(`${targetDate}T${timeStr}:00`).toISOString();
      const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

      const summary = `[Content Release] ${item.title} (${brand.name})`;
      const description = `Brand: ${brand.name}\nCreative Reel #${item.itemNumber}\nPlatform: ${item.platform}\nCreative Asset Link: ${item.mediaUrl}\n\nNotes:\n${item.notes}\n\nVerified Views Milestone Target: ${item.views.toLocaleString()} views\nManaged via The Social Brand Kit Studio.`;

      const newEvent = await GoogleWorkspaceService.createCalendarEvent(accessToken, {
        summary,
        description,
        startDateTime,
        endDateTime,
        location: 'Instagram & Social Feeds',
      });

      onUpdateItemCalendarEvent(item.id, newEvent.id);
      setStatusMessage(`Event scheduled: "${summary}" added to Google Calendar!`);
      loadCalendarEvents();
    } catch (err: any) {
      setStatusMessage(`Failed to create Calendar event: ${err.message}`);
    } finally {
      setSyncingItemId(null);
    }
  };

  // Batch sync all items that don't have a calendar event yet
  const handleBatchSync = async () => {
    if (!accessToken) {
      setStatusMessage('Please sign in with Google first.');
      return;
    }

    const unsyncedItems = items.filter((i) => !i.calendarEventId);
    if (unsyncedItems.length === 0) {
      setStatusMessage('All scheduled items are already synchronized with your Google Calendar.');
      return;
    }

    setIsLoading(true);
    let count = 0;
    for (const item of unsyncedItems) {
      try {
        await handleSyncItemToCalendar(item);
        count++;
      } catch (e) {
        console.error('Error syncing item:', item.title, e);
      }
    }
    setIsLoading(false);
    setStatusMessage(`Successfully synchronized ${count} content releases to Google Calendar.`);
    loadCalendarEvents();
  };

  // Confirm and execute event deletion (Workspace Skill requirement)
  const confirmDeleteEvent = async () => {
    if (!eventToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await GoogleWorkspaceService.deleteCalendarEvent(accessToken, eventToDelete.id);
      setStatusMessage(`Calendar event "${eventToDelete.summary}" removed successfully.`);
      setCalendarEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err: any) {
      setStatusMessage(`Error deleting event: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Google Calendar Schedule & Release Planner</h3>
            <p className="text-xs text-slate-400">
              Synchronize reel releases, shoot deadlines, and review dates with your primary Google Calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCalendarEvents}
            disabled={isLoading || !accessToken}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-2 text-xs text-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Calendar</span>
          </button>

          <button
            onClick={handleBatchSync}
            disabled={isLoading || !accessToken}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Batch Push All Releases</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs text-blue-300">
          <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Content Release Schedule List */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Brand's Active Content Pipeline to Sync */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Brand Release Schedule ({items.length} Creatives)</span>
          </h4>

          <div className="space-y-2.5">
            {items.map((item) => {
              const isSyncing = syncingItemId === item.id;
              const hasCalendarEvent = Boolean(item.calendarEventId);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-400">#{item.itemNumber}</span>
                        <span className="text-xs font-semibold text-slate-100">{item.title}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-blue-300 font-mono">
                          <Clock className="h-3 w-3" />
                          {item.targetDate || 'No date set'} {item.deadlineTime ? `@ ${item.deadlineTime}` : ''}
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-300">{item.status}</span>
                      </div>
                    </div>

                    <div>
                      {hasCalendarEvent ? (
                        <div className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Synced</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSyncItemToCalendar(item)}
                          disabled={isSyncing || !accessToken}
                          className="flex items-center gap-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 disabled:opacity-40 px-2.5 py-1 text-xs font-semibold border border-blue-500/40 transition-colors"
                        >
                          <Plus className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Scheduling...' : 'Add to Calendar'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real Google Calendar Events Preview */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>Live Google Calendar Events</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              {calendarEvents.length} events retrieved
            </span>
          </h4>

          {!accessToken ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
              Sign in with Google to view live schedule events from your primary Google Calendar.
            </div>
          ) : isLoading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
              Loading calendar events from Google API...
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
              No upcoming events found on this calendar. Use "Add to Calendar" on the left to schedule releases!
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {calendarEvents.map((evt) => {
                const isContentRelease = evt.summary?.includes('[Content Release]');
                const dateText = evt.start?.dateTime
                  ? new Date(evt.start.dateTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : evt.start?.date || 'All Day';

                return (
                  <div
                    key={evt.id}
                    className={`rounded-xl border p-2.5 text-xs transition-colors ${
                      isContentRelease
                        ? 'border-blue-500/40 bg-blue-950/20'
                        : 'border-slate-800 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-200 block truncate">{evt.summary}</span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{dateText}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setEventToDelete({ id: evt.id, summary: evt.summary })}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                          title="Delete from Google Calendar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Destructive Calendar Deletion (MANDATORY per skill) */}
      {eventToDelete && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-slate-950 p-6 shadow-2xl text-slate-100 my-auto">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-100">Confirm Event Deletion</h4>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to delete this event from your primary Google Calendar?
            </p>
            <div className="mt-2 rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-xs font-semibold text-slate-200">
              "{eventToDelete.summary}"
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              This action mutates your Google Calendar data.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={isDeleting}
                className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Confirm & Delete Event'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
