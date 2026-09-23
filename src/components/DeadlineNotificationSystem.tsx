import React, { useState } from 'react';
import { Brand, ContentItem } from '../types/content';
import { GoogleWorkspaceService } from '../services/googleWorkspace';
import {
  Bell,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface DeadlineNotificationSystemProps {
  brand: Brand;
  items: ContentItem[];
  accessToken: string | null;
  onMarkNotified: (itemIds: string[]) => void;
}

export const DeadlineNotificationSystem: React.FC<DeadlineNotificationSystemProps> = ({
  brand,
  items,
  accessToken,
  onMarkNotified,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(brand.clientEmail || 'inderneilkanagali@gmail.com');
  const [customSubject, setCustomSubject] = useState(
    `[Urgent Content Plan Digest] Upcoming Reel Deadlines for ${brand.name}`
  );
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User confirmation dialog state (MANDATORY per Workspace Skill for sending email)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [itemsToNotify, setItemsToNotify] = useState<ContentItem[]>([]);

  // Categorize deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgent24h: ContentItem[] = [];
  const upcoming48h: ContentItem[] = [];
  const next7Days: ContentItem[] = [];
  const overdue: ContentItem[] = [];

  items.forEach((item) => {
    if (item.status === 'published') return;
    if (!item.targetDate) return;

    const target = new Date(`${item.targetDate}T00:00:00`);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      overdue.push(item);
    } else if (diffDays <= 1) {
      urgent24h.push(item);
    } else if (diffDays <= 2) {
      upcoming48h.push(item);
    } else if (diffDays <= 7) {
      next7Days.push(item);
    }
  });

  const totalUrgentCount = overdue.length + urgent24h.length + upcoming48h.length;

  // Build high-end HTML email template
  const generateEmailHtml = (selectedItems: ContentItem[]): string => {
    const itemsHtml = selectedItems
      .map(
        (i) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #1e293b;">#${i.itemNumber}</td>
          <td style="padding: 12px; color: #0f172a;">
            <strong>${i.title}</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${i.notes || 'No notes specified.'}</span>
          </td>
          <td style="padding: 12px; font-family: monospace; font-size: 13px; color: #dc2626; font-weight: bold;">
            ${i.targetDate} ${i.deadlineTime || ''}
          </td>
          <td style="padding: 12px; font-size: 12px; text-transform: uppercase; color: #d97706; font-weight: 600;">
            ${i.status}
          </td>
          <td style="padding: 12px; font-weight: 600; color: #0284c7;">
            ${i.views.toLocaleString()} views target
          </td>
        </tr>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a; margin: 0;">
        <div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; color: #ffffff;">
            <span style="background: #f59e0b; color: #0f172a; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; letter-spacing: 0.05em;">Brand Content Deadline Alert</span>
            <h1 style="margin: 12px 0 6px 0; font-size: 24px; font-weight: 800; color: #ffffff;">${brand.name}</h1>
            <p style="margin: 0; font-size: 14px; color: #94a3b8;">Client: ${brand.clientName} &bull; Verified Follower Target: ${brand.currentFollowers.toLocaleString()} / ${brand.targetFollowers.toLocaleString()}</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 0;">
              Hello ${brand.clientName || 'Team'},<br/>
              This is an automated priority dispatch from your <strong>The Social Brand Kit Studio</strong>. You have <strong>${selectedItems.length} content creative(s)</strong> with impending deadlines requiring shoot, review, or publishing action.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; font-size: 13px;">
              <thead>
                <tr style="background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                  <th style="padding: 10px 12px;">No.</th>
                  <th style="padding: 10px 12px;">Creative / Reel</th>
                  <th style="padding: 10px 12px;">Target Deadline</th>
                  <th style="padding: 10px 12px;">Status</th>
                  <th style="padding: 10px 12px;">Target Milestone</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; border-radius: 6px; margin: 24px 0;">
              <strong style="color: #1e40af; font-size: 13px;">Next Steps:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 18px; font-size: 13px; color: #1e3a8a; line-height: 1.5;">
                <li>Ensure reels are scheduled or released per planned calendar timing.</li>
                <li>Your admin will personally record and audit all real views and follower gains once live.</li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            Sent automatically on behalf of ${brand.clientEmail} via Gmail Integration &bull; Powered by The Social Brand Kit Studio.
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Open confirmation modal (Workspace Skill MANDATORY)
  const handleInitiateSend = (targetItems: ContentItem[]) => {
    if (!accessToken) {
      setStatusMessage({
        type: 'error',
        text: 'Please sign in with Google in the top navigation to send emails via Gmail.',
      });
      return;
    }

    if (targetItems.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'No upcoming deadline items found to notify about.',
      });
      return;
    }

    const html = generateEmailHtml(targetItems);
    setPreviewHtml(html);
    setItemsToNotify(targetItems);
    setShowConfirmModal(true);
  };

  // User confirmed send
  const confirmAndSendEmail = async () => {
    if (!accessToken || itemsToNotify.length === 0) return;
    setIsSending(true);
    setStatusMessage(null);

    try {
      const plainText = `Brand Content Deadline Alert for ${brand.name}.\n\nYou have ${itemsToNotify.length} upcoming content items due:\n${itemsToNotify
        .map((i) => `- Reel #${i.itemNumber}: ${i.title} (Deadline: ${i.targetDate})`)
        .join('\n')}\n\nClient: ${brand.clientName}`;

      await GoogleWorkspaceService.sendEmail(accessToken, {
        to: recipientEmail,
        subject: customSubject,
        bodyHtml: previewHtml,
        bodyText: plainText,
      });

      onMarkNotified(itemsToNotify.map((i) => i.id));
      setStatusMessage({
        type: 'success',
        text: `Automated deadline notification successfully delivered to ${recipientEmail} via Gmail!`,
      });
      setShowConfirmModal(false);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to send email: ${err.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Bell className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Automated Deadline Monitor & Gmail Notification Engine
            </h3>
            <p className="text-xs text-slate-400">
              Scans upcoming reel release deadlines and dispatches branded email digests to your client or team
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInitiateSend([...overdue, ...urgent24h, ...upcoming48h, ...next7Days])}
            disabled={items.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/20 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send Deadline Digest Now</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl p-3 border text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Recipient Configuration */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800 text-xs">
        <div>
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-cyan-400" />
            <span>Client / Recipient Email Address</span>
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200 focus:border-cyan-400 focus:outline-none"
            placeholder="client@brand.com"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Email Subject Line</span>
          </label>
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-slate-200 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Deadline Category Buckets */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bucket 1: Urgent (Overdue + 24 Hours) */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Urgent (&lt; 24h &amp; Overdue)</span>
            </span>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-300">
              {overdue.length + urgent24h.length}
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {[...overdue, ...urgent24h].length === 0 ? (
              <p className="text-xs text-slate-500 italic">No urgent deadlines due today.</p>
            ) : (
              [...overdue, ...urgent24h].map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-900/80 p-2.5 text-xs border border-rose-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                      #{item.itemNumber} {item.title}
                    </span>
                    <span className="font-mono text-rose-400 text-[11px]">{item.targetDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{item.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bucket 2: Approaching (48 Hours) */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Next 48 Hours</span>
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
              {upcoming48h.length}
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {upcoming48h.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No releases due in next 48h.</p>
            ) : (
              upcoming48h.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-900/80 p-2.5 text-xs border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                      #{item.itemNumber} {item.title}
                    </span>
                    <span className="font-mono text-amber-400 text-[11px]">{item.targetDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{item.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bucket 3: This Week (Next 7 Days) */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>This Week (7 Days)</span>
            </span>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-300">
              {next7Days.length}
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {next7Days.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No items scheduled for this week.</p>
            ) : (
              next7Days.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-900/80 p-2.5 text-xs border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[170px]">
                      #{item.itemNumber} {item.title}
                    </span>
                    <span className="font-mono text-cyan-400 text-[11px]">{item.targetDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{item.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Sending Email (MANDATORY per Workspace Skill) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-slate-950 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center gap-3 text-amber-400 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-slate-100">
                  Confirm Automated Email Dispatch
                </h4>
                <p className="text-xs text-slate-400">
                  You are about to send an email on behalf of your Google account via the Gmail API.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-mono font-bold text-cyan-300">{recipientEmail}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">Subject:</span>
                <span className="font-semibold text-slate-200">{customSubject}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="text-slate-400">Reels Included:</span>
                <span className="font-mono font-bold text-amber-300">{itemsToNotify.length} creatives</span>
              </div>
            </div>

            {/* Email Preview iframe/container */}
            <div className="mt-4 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-white">
              <span className="block bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 border-b">
                Live Email Message Preview:
              </span>
              <div
                className="p-3 overflow-y-auto max-h-56 text-slate-900 text-xs"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>

            <div className="mt-5 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSending}
                className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndSendEmail}
                disabled={isSending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Send className={`h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
                <span>{isSending ? 'Sending via Gmail...' : 'Confirm & Send Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
