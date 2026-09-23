import React, { useState, useEffect } from 'react';
import { Brand, ContentItem, GoogleTaskItem } from '../types/content';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import { CheckSquare, Plus, RefreshCw, CheckCircle2, Clock, ListChecks } from 'lucide-react';

interface GoogleTasksIntegrationProps {
  brand: Brand;
  items: ContentItem[];
  accessToken: string | null;
}

export const GoogleTasksIntegration: React.FC<GoogleTasksIntegrationProps> = ({
  brand,
  items,
  accessToken,
}) => {
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      loadTasks();
    }
  }, [accessToken]);

  const loadTasks = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const fetchedTasks = await GoogleWorkspaceService.listTasks(accessToken);
      setTasks(fetchedTasks);
    } catch (err: any) {
      setStatusMsg(`Error loading tasks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToTasks = async (item: ContentItem) => {
    if (!accessToken) {
      setStatusMsg('Please sign in with Google to sync tasks.');
      return;
    }

    setSyncingItemId(item.id);
    setStatusMsg(null);
    try {
      const title = `[Release Deadline] ${item.title} (${brand.name})`;
      const notes = `Reel #${item.itemNumber}\nVideo Link: ${item.mediaUrl}\nNotes: ${item.notes}\nTarget Views: ${item.views}`;
      const dueIso = item.targetDate ? `${item.targetDate}T18:00:00.000Z` : undefined;

      await GoogleWorkspaceService.createTask(accessToken, title, notes, dueIso);
      setStatusMsg(`Added task for "${item.title}" to Google Tasks!`);
      loadTasks();
    } catch (err: any) {
      setStatusMsg(`Failed to add task: ${err.message}`);
    } finally {
      setSyncingItemId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Google Tasks Production To-Do Sync</h3>
            <p className="text-xs text-slate-400">
              Export release milestones and editing deadlines directly into your Google Tasks list
            </p>
          </div>
        </div>

        <button
          onClick={loadTasks}
          disabled={isLoading || !accessToken}
          className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-2 text-xs text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs text-violet-300">
          <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            <span>Creative Deadlines to Sync</span>
          </h4>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-semibold text-slate-200 block truncate">
                    #{item.itemNumber} {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Due: {item.targetDate || 'Flexible'}
                  </span>
                </div>

                <button
                  onClick={() => handlePushToTasks(item)}
                  disabled={syncingItemId === item.id || !accessToken}
                  className="flex items-center gap-1 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 px-2.5 py-1 text-xs font-semibold border border-violet-500/40 shrink-0 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{syncingItemId === item.id ? 'Adding...' : 'Add to Tasks'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-emerald-400" />
              <span>Live Google Tasks</span>
            </span>
            <span className="text-[11px] text-slate-500 font-normal">{tasks.length} tasks</span>
          </h4>

          {!accessToken ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
              Sign in with Google to view live tasks from your account.
            </div>
          ) : isLoading ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
              Loading Google Tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
              No tasks found in your primary task list.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 truncate">{t.title}</span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        t.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  {t.notes && <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
