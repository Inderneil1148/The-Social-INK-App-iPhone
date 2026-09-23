import { GoogleCalendarEventItem, GoogleDriveSheetFile, GoogleTaskItem } from '../types/content';

/**
 * Encode unicode string to base64url (RFC 4648) for Gmail API
 */
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export class GoogleWorkspaceService {
  /**
   * Fetch user's Google Drive files that are Google Sheets
   */
  static async listSpreadsheets(accessToken: string): Promise<GoogleDriveSheetFile[]> {
    const q = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    const fields = encodeURIComponent("files(id, name, modifiedTime, webViewLink)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=20&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch sheets from Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return data.files || [];
  }

  /**
   * Read raw values from Google Sheet
   */
  static async getSpreadsheetValues(
    accessToken: string,
    spreadsheetId: string,
    range: string = 'A1:Z100'
  ): Promise<string[][]> {
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to read Google Sheet values: ${res.statusText}`);
    }

    const data = await res.json();
    return data.values || [];
  }

  /**
   * Update range in Google Sheet
   */
  static async updateSpreadsheetValues(
    accessToken: string,
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<any> {
    const encodedRange = encodeURIComponent(range);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update Google Sheet: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Create a new Google Spreadsheet for the Brand Content Plan
   */
  static async createSpreadsheet(
    accessToken: string,
    title: string,
    headers: string[],
    initialRows: any[][]
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [
          {
            properties: { title: 'Content Plan & Analytics' },
            data: [
              {
                startRow: 0,
                startColumn: 0,
                rowData: [
                  {
                    values: headers.map((h) => ({
                      userEnteredValue: { stringValue: h },
                    })),
                  },
                  ...initialRows.map((row) => ({
                    values: row.map((val) => ({
                      userEnteredValue:
                        typeof val === 'number'
                          ? { numberValue: val }
                          : { stringValue: String(val) },
                    })),
                  })),
                ],
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Sheet: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
    };
  }

  /**
   * List Google Calendar events
   */
  static async listCalendarEvents(accessToken: string): Promise<GoogleCalendarEventItem[]> {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
      oneMonthAgo
    )}&timeMax=${encodeURIComponent(threeMonthsLater)}&singleEvents=true&orderBy=startTime&maxResults=50`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Calendar events: ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  }

  /**
   * Create an event in user's primary Google Calendar
   */
  static async createCalendarEvent(
    accessToken: string,
    eventData: {
      summary: string;
      description: string;
      startDateTime: string; // ISO string
      endDateTime: string; // ISO string
      location?: string;
    }
  ): Promise<GoogleCalendarEventItem> {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: eventData.summary,
        description: eventData.description,
        location: eventData.location,
        start: { dateTime: eventData.startDateTime },
        end: { dateTime: eventData.endDateTime },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Calendar event: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Delete an event from user's primary Google Calendar
   */
  static async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok && res.status !== 404 && res.status !== 410) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to delete Calendar event: ${res.statusText}`);
    }
  }

  /**
   * List user's Google Tasks
   */
  static async listTasks(accessToken: string, taskListId: string = '@default'): Promise<GoogleTaskItem[]> {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?maxResults=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch tasks: ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  }

  /**
   * Create a Google Task
   */
  static async createTask(
    accessToken: string,
    title: string,
    notes: string,
    dueDateIso?: string,
    taskListId: string = '@default'
  ): Promise<GoogleTaskItem> {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        notes,
        due: dueDateIso,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Task: ${res.statusText}`);
    }

    return res.json();
  }

  /**
   * Send Email via Gmail API (Base64url encoded RFC 2822 message)
   */
  static async sendEmail(
    accessToken: string,
    params: {
      to: string;
      subject: string;
      bodyHtml: string;
      bodyText: string;
    }
  ): Promise<any> {
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
    const messageParts = [
      `To: ${params.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      params.bodyHtml,
    ];

    const message = messageParts.join('\r\n');
    const raw = base64UrlEncode(message);

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send email via Gmail: ${res.statusText}`);
    }

    return res.json();
  }
}
