// Simple in-memory temporary email store for dev/testing OTP flows
// Enable with env TEMP_EMAIL_MODE=1

export interface TempEmailRecord {
  id: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  createdAt: Date;
  meta?: Record<string, any>;
}

export const TEMP_EMAIL_MODE = process.env.TEMP_EMAIL_MODE === '1';

const _emails: TempEmailRecord[] = [];

export function addTempEmail(rec: Omit<TempEmailRecord, 'id' | 'createdAt'>): TempEmailRecord {
  const full: TempEmailRecord = { id: Math.random().toString(36).slice(2), createdAt: new Date(), ...rec };
  _emails.push(full);
  // Keep only last 100 messages to bound memory
  if (_emails.length > 100) _emails.splice(0, _emails.length - 100);
  return full;
}

export function listTempEmails(opts?: { to?: string }): TempEmailRecord[] {
  if (opts?.to) return _emails.filter(e => e.to.toLowerCase() === opts.to!.toLowerCase()).slice().reverse();
  return _emails.slice().reverse();
}

export function getLatestOtpFor(to: string): string | null {
  const rec = listTempEmails({ to }).find(e => /otp/i.test(e.subject) || /otp/i.test(e.text));
  if (!rec) return null;
  const m = rec.text.match(/(\d{6})/);
  return m ? m[1] : null;
}
