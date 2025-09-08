import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { initLoggingSchema, logEvent } from './mssql';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { TEMP_EMAIL_MODE, addTempEmail, listTempEmails } from './tempEmail';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// Email send timeout (ms) to avoid long hangs on slow SMTP connections
const EMAIL_SEND_TIMEOUT_MS = parseInt(process.env.EMAIL_SEND_TIMEOUT_MS || '7000', 10);

// ================= OTP Rate Limiting / Brute-force Mitigation (in-memory) =================
// NOTE: For production, replace with Redis or persistent store. This protects basic abuse.
interface OtpMeta { attempts: number; lastSentAt: number; windowStart: number; verified?: boolean; lockUntil?: number; }
const OTP_WINDOW_MS = 60 * 60 * 1000; // 1 hour window for counting requests
const OTP_SEND_COOLDOWN_MS = parseInt(process.env.OTP_SEND_COOLDOWN_MS || '30000', 10); // 30s
const OTP_MAX_PER_WINDOW = parseInt(process.env.OTP_MAX_PER_WINDOW || '5', 10);
const OTP_MAX_VERIFY_ATTEMPTS = parseInt(process.env.OTP_MAX_VERIFY_ATTEMPTS || '6', 10);
const OTP_LOCK_MINUTES = parseInt(process.env.OTP_LOCK_MINUTES || '15', 10); // after too many attempts
const otpMeta: Record<string, OtpMeta> = {};
function getOtpMeta(email: string): OtpMeta {
  const key = email.toLowerCase();
  let meta = otpMeta[key];
  const now = Date.now();
  if (!meta || now - meta.windowStart > OTP_WINDOW_MS) {
    meta = { attempts: 0, lastSentAt: 0, windowStart: now };
    otpMeta[key] = meta;
  }
  return meta;
}

// Dev flag: when true, return preview URL for OTP emails (using Ethereal if no SMTP configured)
const DEV_OTP_PREVIEW = process.env.DEV_OTP_PREVIEW === '1';

async function sendOtpEmail(email: string, otp: string): Promise<string | null> {
  try {
    if (TEMP_EMAIL_MODE) {
      addTempEmail({
        to: email,
        subject: 'Your CampusTrail OTP',
        text: `Your verification code is ${otp} (valid 10 minutes).`,
        html: `<p>Your verification code is <strong>${otp}</strong> (valid 10 minutes).</p>`
      });
      return `/dev/temp-emails/${encodeURIComponent(email)}`;
    }
    let transporter; let usedTest = false;
    const haveExplicitService = !!process.env.SMTP_SERVICE;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const forceSecure = process.env.SMTP_SECURE === '1';
    const secure = forceSecure || smtpPort === 465; // auto secure for 465
    if (process.env.SMTP_HOST || haveExplicitService) {
      // Support Gmail either via SMTP_HOST=smtp.gmail.com or SMTP_SERVICE=gmail
      if (haveExplicitService) {
        transporter = nodemailer.createTransport({
          service: process.env.SMTP_SERVICE,
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });
      } else {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure,
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
          tls: secure ? undefined : { rejectUnauthorized: false }
        });
      }
    } else {
      const testAcc = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAcc.smtp.host,
        port: testAcc.smtp.port,
        secure: testAcc.smtp.secure,
        auth: { user: testAcc.user, pass: testAcc.pass }
      });
      usedTest = true;
    }
    const sendPromise = transporter.sendMail({
      from: process.env.MAIL_FROM || (process.env.SMTP_USER ? `CampusTrail <${process.env.SMTP_USER}>` : 'CampusTrail <no-reply@campustrail.local>'),
      to: email,
      subject: 'Your CampusTrail OTP',
      text: `Your verification code is ${otp} (valid 10 minutes).`,
      html: `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:20px;color:#111">`+
        `<p style=margin:0 0 12px>Use this code to finish signing in:</p>`+
        `<p style="font-size:28px;letter-spacing:6px;font-weight:600;margin:0 0 16px;color:#0a4d8c">${otp}</p>`+
        `<p style="font-size:12px;color:#555;margin:0">Valid for 10 minutes. Ignore if you didn’t request it.</p>`+
        `</div>`
    });
    const info = await Promise.race([
      sendPromise,
      new Promise<any>((_, reject) => setTimeout(()=> reject(new Error('EMAIL_SEND_TIMEOUT')), EMAIL_SEND_TIMEOUT_MS))
    ]);
    const preview = (nodemailer as any).getTestMessageUrl ? (nodemailer as any).getTestMessageUrl(info) : null;
    if (preview) console.log('OTP email preview URL:', preview);
    if (DEV_OTP_PREVIEW || usedTest) return preview;
    return null;
  } catch (e: any) {
    if (e && e.message === 'EMAIL_SEND_TIMEOUT') {
      console.warn(`OTP email send timed out after ${EMAIL_SEND_TIMEOUT_MS}ms; continuing without email.`);
    }
    console.warn('OTP email send failed, falling back to console log', e.message);
    console.log('OTP for', email, otp);
    return DEV_OTP_PREVIEW ? `console://otp/${otp}` : null;
  }
}

// Rental buffer (hours) between bookings; can override via env RENTAL_BUFFER_HOURS
const RENTAL_BUFFER_HOURS = parseInt(process.env.RENTAL_BUFFER_HOURS || '12', 10);

type RentalMode = 'PARTIAL' | 'DAY';

function normalizeDates(start: Date, end: Date, mode: RentalMode): { start: Date; end: Date } {
  if (mode === 'DAY') {
    const s = new Date(start); s.setHours(0,0,0,0);
    const e = new Date(end); e.setHours(23,59,59,999);
    return { start: s, end: e };
  }
  return { start, end };
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 3600 * 1000);
}

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Generic event endpoint for frontend (cart add, product view etc.)
app.post('/events/cart-add', async (req, res) => {
  const user = await getUserFromHeader(req);
  const { productId, name } = req.body || {};
  logEvent({ eventType: 'CART_ADD', userEmail: user?.email || null, entityType: 'PRODUCT', entityId: productId, details: { name } });
  res.json({ ok: true });
});

app.post('/auth/request-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const meta = getOtpMeta(email);
  const now = Date.now();
  if (meta.lockUntil && now < meta.lockUntil) {
    return res.status(429).json({ error: 'Too many attempts. Temporarily locked.', retryAfterSeconds: Math.ceil((meta.lockUntil - now)/1000) });
  }
  if (now - meta.lastSentAt < OTP_SEND_COOLDOWN_MS) {
    return res.status(429).json({ error: 'OTP requested too soon', retryAfterMs: OTP_SEND_COOLDOWN_MS - (now - meta.lastSentAt) });
  }
  if (meta.attempts >= OTP_MAX_PER_WINDOW) {
    meta.lockUntil = now + OTP_LOCK_MINUTES * 60 * 1000;
    return res.status(429).json({ error: 'OTP request limit reached', lockMinutes: OTP_LOCK_MINUTES });
  }
  const otp = Math.floor(100000 + Math.random()*900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);
  let user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user) user = await prisma.user.create({ data: { email } });
  await prisma.user.update({ where: { id: user.id }, data: { signupOtp: otp, signupOtpExpires: expires } as any });
  const previewUrl = await sendOtpEmail(email, otp);
  logEvent({ eventType: 'OTP_REQUEST', userEmail: email });
  meta.attempts += 1;
  meta.lastSentAt = now;
  const body: any = { message: 'OTP issued', email, expiresAt: expires.toISOString() };
  if (previewUrl) body.previewUrl = previewUrl;
  if (TEMP_EMAIL_MODE) body.tempEmailMode = true;
  body.rateLimit = {
    attemptsThisWindow: meta.attempts,
    maxPerWindow: OTP_MAX_PER_WINDOW,
    cooldownMs: OTP_SEND_COOLDOWN_MS,
    windowResetInMs: Math.max(0, meta.windowStart + OTP_WINDOW_MS - now)
  };
  res.json(body);
});

// Development helper endpoints (only active when TEMP_EMAIL_MODE)
if (TEMP_EMAIL_MODE) {
  app.get('/dev/temp-emails', (_req, res) => {
    res.json({ mode: 'TEMP_EMAIL_MODE', count: listTempEmails().length, data: listTempEmails().slice(0, 50) });
  });
  app.get('/dev/temp-emails/:email', (req, res) => {
    res.json({ email: req.params.email, data: listTempEmails({ to: req.params.email }) });
  });
}

// Optional test endpoint (enable with ALLOW_EMAIL_TEST=1) for verifying SMTP settings quickly
if (process.env.ALLOW_EMAIL_TEST === '1') {
  app.get('/dev/email-test', async (req, res) => {
    const to = String(req.query.to || '').trim();
    if (!to) return res.status(400).json({ error: 'Provide ?to=email@example.com' });
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const preview = await sendOtpEmail(to, otp);
    res.json({ sent: true, to, preview });
  });
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
app.post('/auth/verify-otp', async (req, res) => {
  const { email } = req.body as { email: string };
  const { otp, name, password } = req.body as any;
  if (!email || !otp) return res.status(400).json({ error: 'email & otp required' });
  const meta = getOtpMeta(email);
  const now = Date.now();
  if (meta.lockUntil && now < meta.lockUntil) {
    return res.status(429).json({ error: 'Too many attempts. Temporarily locked.', retryAfterSeconds: Math.ceil((meta.lockUntil - now)/1000) });
  }
  let user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user) return res.status(400).json({ error: 'Request OTP first' });
  if (!user.signupOtp || !user.signupOtpExpires || user.signupOtp !== otp || user.signupOtpExpires < new Date()) {
    meta.attempts += 1; // count failed verify toward lock
    if (meta.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      meta.lockUntil = now + OTP_LOCK_MINUTES * 60 * 1000;
    }
    return res.status(400).json({ error: 'Invalid or expired OTP', remainingAttempts: Math.max(0, OTP_MAX_VERIFY_ATTEMPTS - meta.attempts), locked: !!meta.lockUntil });
  }
  const update: any = { signupOtp: null, signupOtpExpires: null };
  if (name) update.name = name;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);
  user = await prisma.user.update({ where: { id: user.id }, data: update });
  const token = jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
  logEvent({ eventType: 'LOGIN', userEmail: email });
  meta.verified = true;
  res.json({ token, user });
});

// Password login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user || !user.passwordHash) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
  logEvent({ eventType: 'LOGIN_PASSWORD', userEmail: email });
  res.json({ token, user });
});

// Allow user to set password after OTP login
app.post('/auth/set-password', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { password } = req.body as { password: string };
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password length >=6 required' });
  const hash = await bcrypt.hash(password, 10);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } as any });
  logEvent({ eventType: 'PASSWORD_SET', userEmail: user.email });
  res.json({ user: updated });
});

// Request password reset (sends token via email - mocked)
app.post('/auth/password/request', async (req, res) => {
  const { email } = req.body as { email: string };
  if (!email) return res.status(400).json({ error: 'email required' });
  const user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user) return res.json({ message: 'If account exists, reset email sent' });
  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 30 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpires: expires } as any });
  console.log('Password reset token (mock):', email, token);
  logEvent({ eventType: 'PASSWORD_RESET_REQUEST', userEmail: email });
  res.json({ message: 'If account exists, reset email sent' });
});

// Confirm password reset
app.post('/auth/password/reset', async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };
  if (!token || !password) return res.status(400).json({ error: 'token & password required' });
  const user = await prisma.user.findFirst({ where: { resetToken: token } as any }) as any;
  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  if (password.length < 6) return res.status(400).json({ error: 'Password too short' });
  const hash = await bcrypt.hash(password, 10);
  const updated = await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash, resetToken: null, resetTokenExpires: null } as any });
  logEvent({ eventType: 'PASSWORD_RESET', userEmail: updated.email });
  res.json({ message: 'Password updated' });
});

async function getUserFromHeader(req: express.Request) {
  let email = req.header('x-user-email') || '';
  const auth = req.header('authorization');
  if (!email && auth?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as any;
      email = decoded.email;
    } catch {}
  }
  if (!email) return null;
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) user = await prisma.user.create({ data: { email } });
  return user;
}

// Rental listings
app.get('/gear/:id/rentals', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const gear = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
  if (!gear) return res.status(404).json({ error: 'Not found' });
  if (gear.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  const rentals = await prisma.gearRental.findMany({ where: { gearItemId: gear.id }, orderBy: { createdAt: 'desc' } });
  res.json(rentals);
});

app.get('/my/rentals', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rentals = await prisma.gearRental.findMany({ where: { renterId: user.id }, include: { gearItem: true }, orderBy: { createdAt: 'desc' } });
  res.json(rentals);
});

// Orders
app.post('/orders', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: 'No items' });
  // Expect items: [{ gearItemId, quantity }]
  const gearIds = [...new Set(items.map((i: any)=> i.gearItemId).filter(Boolean))];
  const gearMap: Record<string, any> = {};
  if (gearIds.length) {
    const gears = await prisma.gearItem.findMany({ where: { id: { in: gearIds as string[] } } });
    gears.forEach(g=> gearMap[g.id] = g);
  }
  let total = 0; let depositTotal = 0;
  const lineData: any[] = [];
  for (const raw of items) {
    const q = Math.max(1, parseInt(raw.quantity, 10) || 1);
    const g = gearMap[raw.gearItemId];
    if (!g) return res.status(400).json({ error: `Gear item not found: ${raw.gearItemId}` });
    const lineTotal = g.dailyRate * q; // treating dailyRate as sale price placeholder
    total += lineTotal;
    depositTotal += (g.depositAmount || 0) * q;
    lineData.push({
      gearItemId: g.id,
      title: g.title,
      unitPrice: g.dailyRate,
      depositAmount: g.depositAmount || 0,
      quantity: q,
      lineTotal
    });
  }
  // NOTE: After running `npx prisma generate` the prisma.order type will be available
  const order = await (prisma as any).order.create({
    data: {
      userId: user.id,
      total,
      depositTotal,
      status: 'CREATED',
      items: { create: lineData }
    },
    include: { items: true }
  });
  logEvent({ eventType: 'ORDER_CREATE', userEmail: user.email, entityType: 'ORDER', entityId: order.id, details: { total, items: lineData.length } });
  res.json(order);
});

app.get('/my/orders', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const orders = await (prisma as any).order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

// Current user's created resources (for dashboard)
app.get('/my/gear', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const items = await prisma.gearItem.findMany({ where: { ownerId: user.id }, include: { photos: true } });
  res.json(items);
});

app.get('/my/itineraries', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const its = await prisma.itinerary.findMany({ where: { creatorId: user.id }, include: { interests: true, joins: true } });
  res.json(its);
});

app.get('/my/companion-requests', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const crs = await prisma.companionRequest.findMany({ where: { userId: user.id }, include: { interests: true } });
  res.json(crs);
});

// Simple share link generator (placeholder - in real app might sign or shorten)
app.post('/share-link', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { type, id } = req.body as { type: string; id: string };
  if (!['gear','itinerary','companion-request'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
  const path = type === 'gear' ? `/gear/${id}` : type === 'itinerary' ? `/itinerary/${id}` : `/companion/${id}`;
  const url = `${base}${path}`;
  logEvent({ eventType: 'SHARE_LINK_CREATE', userEmail: user.email, entityType: type.toUpperCase(), entityId: id, details: { url } });
  res.json({ url });
});

app.post('/gear', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Missing x-user-email header' });
  const { title, description, dailyRate, depositAmount, condition, photos } = req.body;
  try {
    const gear = await prisma.gearItem.create({
      data: {
        ownerId: user.id,
        title,
        description,
        dailyRate,
        depositAmount,
        condition,
        photos: { create: (photos || []).map((url: string) => ({ url })) },
        status: 'DRAFT'
      },
      include: { photos: true }
    });
  logEvent({ eventType: 'GEAR_CREATE', userEmail: user.email, entityType: 'GEAR_ITEM', entityId: gear.id, details: { title } });
  res.json(gear);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Publish / archive gear lifecycle
app.post('/gear/:id/publish', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const gear = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
  if (!gear) return res.status(404).json({ error: 'Not found' });
  if (gear.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (gear.status === 'ARCHIVED') return res.status(400).json({ error: 'Archived item' });
  const published = await prisma.gearItem.update({ where: { id: gear.id }, data: { status: 'PUBLISHED' } });
  logEvent({ eventType: 'GEAR_PUBLISH', userEmail: user.email, entityType: 'GEAR_ITEM', entityId: published.id });
  res.json(published);
});

app.post('/gear/:id/archive', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const gear = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
  if (!gear) return res.status(404).json({ error: 'Not found' });
  if (gear.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  const archived = await prisma.gearItem.update({ where: { id: gear.id }, data: { status: 'ARCHIVED' } });
  logEvent({ eventType: 'GEAR_ARCHIVE', userEmail: user.email, entityType: 'GEAR_ITEM', entityId: archived.id });
  res.json(archived);
});

app.get('/gear', async (req, res) => {
  const { startDate, endDate, mode = 'DAY' } = req.query as { startDate?: string; endDate?: string; mode?: string };
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s > e) {
      return res.status(400).json({ error: 'Invalid startDate/endDate' });
    }
    const normalized = normalizeDates(s, e, (mode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY'));
    windowStart = normalized.start; windowEnd = normalized.end;
  } else if (startDate || endDate) {
    return res.status(400).json({ error: 'Provide both startDate and endDate or neither' });
  }
  const gearItems = await prisma.gearItem.findMany({ include: { photos: true, rentals: { select: { status: true, startDate: true, endDate: true, rentalMode: true } } } });
  const ACTIVE = ['REQUESTED', 'APPROVED', 'IN_PROGRESS'];
  const now = new Date();
  const enriched = gearItems.map((g: any) => {
    const activeRentals = g.rentals.filter((r: any) => ACTIVE.includes(r.status));
    let seatsRemaining: number;
    let isAvailable: boolean;
    const buffer = g.bufferHours ?? RENTAL_BUFFER_HOURS;
    if (windowStart && windowEnd) {
      const overlap = activeRentals.some((r: any) => {
        const bufferedStart = addHours(r.startDate, -buffer);
        const bufferedEnd = addHours(r.endDate, buffer);
        return bufferedStart <= windowEnd! && bufferedEnd >= windowStart!;
      });
      isAvailable = !overlap;
      seatsRemaining = overlap ? 0 : 1;
    } else {
      const futureOrCurrent = activeRentals.some((r: any) => addHours(r.endDate, buffer) >= now);
      isAvailable = !futureOrCurrent;
      seatsRemaining = futureOrCurrent ? 0 : 1;
    }
    return {
      ...g,
      seatsRemaining,
      isAvailable,
      windowStart: windowStart ? windowStart.toISOString() : undefined,
      windowEnd: windowEnd ? windowEnd.toISOString() : undefined,
      bufferHours: buffer,
      rentalMode: mode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY'
    };
  });
  // log listing view (aggregate) once per request
  logEvent({ eventType: 'GEAR_LIST_VIEW', userEmail: req.header('x-user-email') || null, details: { count: enriched.length } });
  res.json(enriched);
});

// Gear availability detail endpoint
app.get('/gear/:id/availability', async (req, res) => {
  const { from, to, mode = 'DAY' } = req.query as { from?: string; to?: string; mode?: string };
  const gear = await prisma.gearItem.findUnique({ where: { id: req.params.id }, include: { rentals: true, photos: true } });
  if (!gear) return res.status(404).json({ error: 'Not found' });
  const ACTIVE = ['REQUESTED', 'APPROVED', 'IN_PROGRESS'];
  const rentals = gear.rentals.filter((r: any) => ACTIVE.includes(r.status));
  let windowStart: Date; let windowEnd: Date;
  if (from && to) {
    const rawStart = new Date(from); const rawEnd = new Date(to);
    if (isNaN(rawStart.getTime()) || isNaN(rawEnd.getTime()) || rawStart > rawEnd) {
      return res.status(400).json({ error: 'Invalid from/to' });
    }
    const normalized = normalizeDates(rawStart, rawEnd, (mode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY'));
    windowStart = normalized.start; windowEnd = normalized.end;
  } else {
    windowStart = new Date();
    windowEnd = new Date(windowStart.getTime() + 14 * 24 * 60 * 60 * 1000); // next 14 days
    const normalized = normalizeDates(windowStart, windowEnd, (mode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY'));
    windowStart = normalized.start; windowEnd = normalized.end;
  }
  const buffer = (gear as any).bufferHours ?? RENTAL_BUFFER_HOURS;
  const overlapping = rentals.filter((r: any) => {
    const bufferedStart = addHours(r.startDate, -buffer);
    const bufferedEnd = addHours(r.endDate, buffer);
    return bufferedStart <= windowEnd && bufferedEnd >= windowStart;
  });
  const isAvailable = overlapping.length === 0;
  // Compute nextAvailableDate if not available
  let nextAvailableDate: string | null = null;
  if (!isAvailable) {
  const maxEnd = overlapping.reduce((acc: any, r: any) => (r.endDate > acc ? r.endDate : acc), overlapping[0].endDate);
  nextAvailableDate = addHours(maxEnd, buffer).toISOString();
  }
  res.json({
    gearItemId: gear.id,
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    isAvailable,
    seatsRemaining: isAvailable ? 1 : 0,
  overlappingRentalIds: overlapping.map((r: any) => r.id),
    nextAvailableDate,
  bufferHours: buffer,
    rentalMode: mode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY'
  });
});

app.post('/gear/:id/rent', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { startDate, endDate, rentalMode } = req.body as { startDate: string; endDate: string; rentalMode?: string };
  try {
    const gear = await prisma.gearItem.findUnique({ where: { id: req.params.id } });
    if (!gear) return res.status(404).json({ error: 'Gear not found' });
    if (gear.ownerId === user.id) return res.status(400).json({ error: 'Cannot rent your own gear' });
  const rawStart = new Date(startDate);
  const rawEnd = new Date(endDate);
  if (isNaN(rawStart.getTime()) || isNaN(rawEnd.getTime()) || rawStart > rawEnd) return res.status(400).json({ error: 'Invalid date range' });
    const mode: RentalMode = rentalMode && rentalMode.toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'DAY';
    const { start, end } = normalizeDates(rawStart, rawEnd, mode);
    const ACTIVE = ['REQUESTED', 'APPROVED', 'IN_PROGRESS'];
    const buffer = gear.bufferHours ?? RENTAL_BUFFER_HOURS;
    const overlap = await prisma.gearRental.findFirst({
      where: {
        gearItemId: gear.id,
        status: { in: ACTIVE },
        AND: [
          { startDate: { lte: addHours(end, buffer) } },
          { endDate: { gte: addHours(start, -buffer) } }
        ]
      }
    });
    if (overlap) return res.status(409).json({
      error: 'Gear unavailable for selected dates',
      conflictingRentalId: overlap.id,
      conflict: {
        startDate: overlap.startDate,
        endDate: overlap.endDate,
        rentalMode: overlap.rentalMode
      },
      bufferHours: buffer
    });
    const rental = await prisma.gearRental.create({
      data: {
        gearItemId: gear.id,
        renterId: user.id,
        startDate: start,
        endDate: end,
        status: 'REQUESTED',
        depositHeld: gear.depositAmount,
        rentalMode: mode
      }
    });
  logEvent({ eventType: 'RENTAL_CREATE', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: rental.id, details: { gearItemId: gear.id, startDate: start, endDate: end } });
  res.json(rental);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/rentals/:id/approve', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ include: { gearItem: true }, where: { id: req.params.id } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (rental.gearItem.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (rental.status !== 'REQUESTED') return res.status(400).json({ error: 'Invalid state' });
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { status: 'APPROVED' } });
  logEvent({ eventType: 'RENTAL_APPROVE', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: updated.id });
  res.json(updated);
});

// Simulated payment hold (deposit)
app.post('/rentals/:id/hold-deposit', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ where: { id: req.params.id }, include: { gearItem: true, payments: true } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (rental.renterId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (rental.depositStatus !== 'PENDING') return res.status(400).json({ error: 'Deposit already processed' });
  const payment = await prisma.payment.create({ data: { rentalId: rental.id, type: 'DEPOSIT', amount: rental.gearItem.depositAmount, status: 'HELD' } });
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { depositStatus: 'HELD', depositHeld: rental.gearItem.depositAmount } });
  logEvent({ eventType: 'DEPOSIT_HELD', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: rental.id, details: { amount: rental.gearItem.depositAmount } });
  res.json({ rental: updated, payment });
});

// Capture deposit (e.g., damage) by owner after dispute resolution
app.post('/rentals/:id/capture-deposit', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ where: { id: req.params.id }, include: { gearItem: true, payments: true } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (rental.gearItem.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (rental.depositStatus !== 'HELD') return res.status(400).json({ error: 'Deposit not in HELD state' });
  await prisma.payment.create({ data: { rentalId: rental.id, type: 'DEPOSIT', amount: rental.depositHeld, status: 'CAPTURED' } });
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { depositStatus: 'CAPTURED' } });
  logEvent({ eventType: 'DEPOSIT_CAPTURE', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: updated.id, details: { amount: rental.depositHeld } });
  res.json(updated);
});

// Release deposit back to renter
app.post('/rentals/:id/release-deposit', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ where: { id: req.params.id }, include: { gearItem: true } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (![rental.gearItem.ownerId, rental.renterId].includes(user.id)) return res.status(403).json({ error: 'Forbidden' });
  if (!['HELD','CAPTURED'].includes(rental.depositStatus) && rental.depositStatus !== 'PENDING') return res.status(400).json({ error: 'Invalid deposit state' });
  if (rental.depositStatus === 'HELD') {
    await prisma.payment.create({ data: { rentalId: rental.id, type: 'DEPOSIT', amount: rental.depositHeld, status: 'RELEASED' } });
  }
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { depositStatus: 'RELEASED' } });
  logEvent({ eventType: 'DEPOSIT_RELEASE', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: updated.id });
  res.json(updated);
});

// Create dispute
app.post('/rentals/:id/disputes', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { reason, description } = req.body as { reason: string; description?: string };
  if (!reason) return res.status(400).json({ error: 'reason required' });
  const rental = await prisma.gearRental.findUnique({ where: { id: req.params.id }, include: { gearItem: true, disputes: true } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (![rental.gearItem.ownerId, rental.renterId].includes(user.id)) return res.status(403).json({ error: 'Forbidden' });
  const dispute = await prisma.rentalDispute.create({ data: { rentalId: rental.id, raisedById: user.id, reason, description } });
  logEvent({ eventType: 'DISPUTE_CREATE', userEmail: user.email, entityType: 'RENTAL_DISPUTE', entityId: dispute.id, details: { reason } });
  res.json(dispute);
});

// Resolve dispute (simple path)
app.post('/disputes/:id/resolve', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { outcome, notes } = req.body as { outcome: string; notes?: string };
  const dispute = await prisma.rentalDispute.findUnique({ where: { id: req.params.id }, include: { rental: { include: { gearItem: true } } } });
  if (!dispute) return res.status(404).json({ error: 'Not found' });
  // Simple rule: only owner can finalize for now
  if (dispute.rental.gearItem.ownerId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (dispute.status !== 'OPEN' && dispute.status !== 'UNDER_REVIEW') return res.status(400).json({ error: 'Already resolved' });
  let newStatus = 'RESOLVED_RELEASE';
  if (outcome === 'capture') newStatus = 'RESOLVED_CAPTURE';
  const updated = await prisma.rentalDispute.update({ where: { id: dispute.id }, data: { status: newStatus, resolutionNotes: notes } });
  logEvent({ eventType: 'DISPUTE_RESOLVE', userEmail: user.email, entityType: 'RENTAL_DISPUTE', entityId: updated.id, details: { outcome, newStatus } });
  res.json(updated);
});

// ================= Reviews =================
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(5),
});

app.post('/reviews', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const parse = reviewSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { rating, title, body, gearItemId, itineraryId, companionRequestId, targetUserId } = req.body;
  if (!gearItemId && !itineraryId && !companionRequestId && !targetUserId) return res.status(400).json({ error: 'One of gearItemId, itineraryId, companionRequestId, targetUserId required' });
  try {
  const data: any = { authorId: user.id, rating, title, body };
  if (gearItemId) data.gearItem = { connect: { id: gearItemId } };
  if (itineraryId) data.itinerary = { connect: { id: itineraryId } };
  if (targetUserId) data.targetUser = { connect: { id: targetUserId } };
  if (companionRequestId) data.companionRequest = { connect: { id: companionRequestId } };
  const review = await prisma.review.create({ data });
  logEvent({ eventType: 'REVIEW_CREATE', userEmail: user.email, entityType: 'REVIEW', entityId: review.id, details: { rating, gearItemId, itineraryId, companionRequestId, targetUserId } });
  res.json(review);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/reviews', async (req, res) => {
  const { gearItemId, itineraryId, companionRequestId, targetUserId, page = '1', pageSize = '10' } = req.query as any;
  const where: any = {};
  if (gearItemId) where.gearItemId = gearItemId;
  if (itineraryId) where.itineraryId = itineraryId;
  if (companionRequestId) where.companionRequestId = companionRequestId;
  if (targetUserId) where.targetUserId = targetUserId;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
  const total = await prisma.review.count({ where });
  const reviews = await prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (p - 1) * ps, take: ps });
  res.json({ meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) }, data: reviews });
});

app.post('/rentals/:id/pickup', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ include: { gearItem: true }, where: { id: req.params.id } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (![rental.gearItem.ownerId, rental.renterId].includes(user.id)) return res.status(403).json({ error: 'Forbidden' });
  if (!['APPROVED', 'REQUESTED'].includes(rental.status)) return res.status(400).json({ error: 'Invalid state' });
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { status: 'IN_PROGRESS', pickupConfirmedAt: new Date() } });
  logEvent({ eventType: 'RENTAL_PICKUP', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: updated.id });
  res.json(updated);
});

app.post('/rentals/:id/return', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const rental = await prisma.gearRental.findUnique({ include: { gearItem: true }, where: { id: req.params.id } });
  if (!rental) return res.status(404).json({ error: 'Not found' });
  if (![rental.gearItem.ownerId, rental.renterId].includes(user.id)) return res.status(403).json({ error: 'Forbidden' });
  if (rental.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Invalid state' });
  const updated = await prisma.gearRental.update({ where: { id: rental.id }, data: { status: 'COMPLETED', returnConfirmedAt: new Date() } });
  logEvent({ eventType: 'RENTAL_RETURN', userEmail: user.email, entityType: 'GEAR_RENTAL', entityId: updated.id });
  res.json(updated);
});

// ================= Itinerary Endpoints =================
const itinerarySchema = z.object({
  title: z.string().min(2),
  destination: z.string().min(2),
  description: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  maxPeople: z.number().int().positive(),
  costEstimate: z.number().int().positive().optional(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().min(2).optional() // stored as interest style:<value>
});

app.post('/itineraries', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const parse = itinerarySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const data = parse.data;
  try {
    const combinedInterests = new Set<string>(data.interests || []);
    if (data.travelStyle) {
      // ensure only one style: entry
      [...combinedInterests].filter(i => i.startsWith('style:')).forEach(s => combinedInterests.delete(s));
      combinedInterests.add(`style:${data.travelStyle}`);
    }
    const itinerary = await prisma.itinerary.create({
      data: {
        creatorId: user.id,
        title: data.title,
        destination: data.destination,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxPeople: data.maxPeople,
        costEstimate: data.costEstimate,
        interests: combinedInterests.size ? { create: [...combinedInterests].map(v => ({ value: v })) } : undefined
      },
      include: { interests: true }
    });
    // Auto add creator join as HOST
    await prisma.itineraryJoin.create({ data: { itineraryId: itinerary.id, userId: user.id, role: 'HOST', status: 'APPROVED' } });
    logEvent({ eventType: 'ITINERARY_CREATE', userEmail: user.email, entityType: 'ITINERARY', entityId: itinerary.id });
    res.json(itinerary);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/itineraries', async (req, res) => {
  const { destination, q, activeOnly, page = '1', pageSize = '10', sort = 'startDate', sortDir = 'asc' } = req.query as any;
  const where: any = {};
  if (destination) where.destination = { contains: destination, mode: 'insensitive' };
  if (q) where.OR = [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } }
  ];
  if (activeOnly === '1') where.status = 'OPEN';
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
  const orderBy: any = {};
  if (sort === 'createdAt') orderBy.createdAt = sortDir === 'desc' ? 'desc' : 'asc';
  else orderBy.startDate = sortDir === 'desc' ? 'desc' : 'asc';
  const total = await prisma.itinerary.count({ where });
  const itineraries = await prisma.itinerary.findMany({
    where,
    orderBy,
    skip: (p - 1) * ps,
    take: ps,
    include: { interests: true, joins: { select: { status: true } } }
  });
  const augmented = itineraries.map((i: any) => {
    const approved = i.joins.filter((j: any) => j.status === 'APPROVED').length;
    return {
      ...i,
      travelStyle: (i.interests as any[]).find((x: any) => x.value.startsWith('style:'))?.value.slice(6) || null,
      seatsRemaining: Math.max(0, i.maxPeople - approved)
    };
  });
  res.json({ meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) }, data: augmented });
});

app.get('/itineraries/:id', async (req, res) => {
  const itinerary = await prisma.itinerary.findUnique({
    where: { id: req.params.id },
    include: { interests: true, joins: { include: { user: true } } }
  });
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  const detailed = {
    ...itinerary,
    travelStyle: itinerary.interests.find((x: any) => x.value.startsWith('style:'))?.value.slice(6) || null,
    seatsRemaining: itinerary.maxPeople - itinerary.joins.filter((j: any) => j.status === 'APPROVED').length
  };
  res.json(detailed);
});

app.post('/itineraries/:id/join', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { message } = req.body as { message?: string };
  const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id } });
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  const existing = await prisma.itineraryJoin.findFirst({ where: { itineraryId: itinerary.id, userId: user.id } });
  if (existing) return res.status(400).json({ error: 'Already requested/joined' });
  const join = await prisma.itineraryJoin.create({ data: { itineraryId: itinerary.id, userId: user.id, message, status: 'PENDING' } });
  logEvent({ eventType: 'ITINERARY_JOIN_REQUEST', userEmail: user.email, entityType: 'ITINERARY_JOIN', entityId: join.id, details: { itineraryId: itinerary.id } });
  res.json(join);
});

app.post('/itinerary-joins/:id/approve', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const join = await prisma.itineraryJoin.findUnique({ where: { id: req.params.id }, include: { itinerary: true } });
  if (!join) return res.status(404).json({ error: 'Not found' });
  if (join.itinerary.creatorId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (join.status !== 'PENDING') return res.status(400).json({ error: 'Invalid state' });
  const approved = await prisma.itineraryJoin.update({ where: { id: join.id }, data: { status: 'APPROVED' } });
  logEvent({ eventType: 'ITINERARY_JOIN_APPROVE', userEmail: user.email, entityType: 'ITINERARY_JOIN', entityId: approved.id });
  res.json(approved);
});

// Reject join request
app.post('/itinerary-joins/:id/reject', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const join = await prisma.itineraryJoin.findUnique({ where: { id: req.params.id }, include: { itinerary: true } });
  if (!join) return res.status(404).json({ error: 'Not found' });
  if (join.itinerary.creatorId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  if (['REJECTED', 'APPROVED'].includes(join.status)) return res.status(400).json({ error: 'Already finalized' });
  const rejected = await prisma.itineraryJoin.update({ where: { id: join.id }, data: { status: 'REJECTED' } });
  logEvent({ eventType: 'ITINERARY_JOIN_REJECT', userEmail: user.email, entityType: 'ITINERARY_JOIN', entityId: rejected.id });
  res.json(rejected);
});

app.post('/itineraries/:id/interests', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { interests } = req.body as { interests: string[] };
  if (!Array.isArray(interests) || interests.length === 0) return res.status(400).json({ error: 'interests required' });
  const itinerary = await prisma.itinerary.findUnique({ where: { id: req.params.id } });
  if (!itinerary) return res.status(404).json({ error: 'Not found' });
  if (itinerary.creatorId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.itineraryInterest.createMany({ data: interests.map(v => ({ itineraryId: itinerary.id, value: v })) });
  const updated = await prisma.itinerary.findUnique({ where: { id: itinerary.id }, include: { interests: true } });
  logEvent({ eventType: 'ITINERARY_INTEREST_ADD', userEmail: user.email, entityType: 'ITINERARY', entityId: updated!.id, details: { count: interests.length } });
  res.json(updated);
});

// ================= Companion Request Endpoints =================
const companionRequestSchema = z.object({
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  flexibility: z.string().optional(),
  notes: z.string().optional(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().min(2).optional()
});

app.post('/companion-requests', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const parse = companionRequestSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const data = parse.data;
  try {
    const combinedInterests = new Set<string>(data.interests || []);
    if (data.travelStyle) {
      [...combinedInterests].filter(i => i.startsWith('style:')).forEach(s => combinedInterests.delete(s));
      combinedInterests.add(`style:${data.travelStyle}`);
    }
    const cr = await prisma.companionRequest.create({
      data: {
        userId: user.id,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        flexibility: data.flexibility,
        notes: data.notes,
        interests: combinedInterests.size ? { create: [...combinedInterests].map(v => ({ value: v })) } : undefined
      },
      include: { interests: true }
    });
    logEvent({ eventType: 'COMPANION_REQUEST_CREATE', userEmail: user.email, entityType: 'COMPANION_REQUEST', entityId: cr.id });
    res.json(cr);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/companion-requests', async (req, res) => {
  const { destination, from, to } = req.query as { destination?: string; from?: string; to?: string };
  const where: any = {};
  if (destination) where.destination = { contains: destination, mode: 'insensitive' };
  // Date window overlap logic
  if (from || to) {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    where.AND = [] as any[];
    if (start) where.AND.push({ endDate: { gte: start } });
    if (end) where.AND.push({ startDate: { lte: end } });
  }
  const list = await prisma.companionRequest.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: { interests: true, user: true }
  });
  const augmented = list.map((cr: any) => ({
    ...cr,
    travelStyle: cr.interests.find((i: any) => i.value.startsWith('style:'))?.value.slice(6) || null
  }));
  res.json(augmented);
});

app.get('/companion-requests/:id', async (req, res) => {
  const cr = await prisma.companionRequest.findUnique({ where: { id: req.params.id }, include: { interests: true, user: true } });
  if (!cr) return res.status(404).json({ error: 'Not found' });
  const withMeta = {
    ...cr,
    travelStyle: cr.interests.find((i: any) => i.value.startsWith('style:'))?.value.slice(6) || null
  };
  res.json(withMeta);
});

app.post('/companion-requests/:id/interests', async (req, res) => {
  const user = await getUserFromHeader(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const { interests } = req.body as { interests: string[] };
  if (!Array.isArray(interests) || !interests.length) return res.status(400).json({ error: 'interests required' });
  const cr = await prisma.companionRequest.findUnique({ where: { id: req.params.id } });
  if (!cr) return res.status(404).json({ error: 'Not found' });
  if (cr.userId !== user.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.companionRequestInterest.createMany({ data: interests.map(v => ({ companionRequestId: cr.id, value: v })) });
  const updated = await prisma.companionRequest.findUnique({ where: { id: cr.id }, include: { interests: true, user: true } });
  const withMeta = updated ? {
    ...updated,
    travelStyle: updated.interests.find((i: any) => i.value.startsWith('style:'))?.value.slice(6) || null
  } : null;
  logEvent({ eventType: 'COMPANION_REQUEST_INTEREST_ADD', userEmail: user.email, entityType: 'COMPANION_REQUEST', entityId: cr.id, details: { count: interests.length } });
  res.json(withMeta);
});

// ================= Matching Endpoints =================
function computeOverlapDays(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  const start = aStart > bStart ? aStart : bStart;
  const end = aEnd < bEnd ? aEnd : bEnd;
  const diff = end.getTime() - start.getTime();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

function extractStyle(interests: { value: string }[]) {
  return interests.find(i => i.value.startsWith('style:'))?.value.slice(6) || null;
}

function scoreMatch(opts: {
  destA: string; destB: string; styleA: string | null; styleB: string | null;
  overlapDays: number; durationA: number; durationB: number; sharedInterests: number;
}) {
  let score = 0;
  // destination
  if (opts.destA.toLowerCase() === opts.destB.toLowerCase()) score += 40; else if (opts.destA && opts.destB && (opts.destA.toLowerCase().includes(opts.destB.toLowerCase()) || opts.destB.toLowerCase().includes(opts.destA.toLowerCase()))) score += 20;
  // overlap ratio
  const minDur = Math.max(1, Math.min(opts.durationA, opts.durationB));
  const overlapRatio = Math.min(1, opts.overlapDays / minDur);
  score += overlapRatio * 30; // up to 30
  // style
  if (opts.styleA && opts.styleB && opts.styleA.toLowerCase() === opts.styleB.toLowerCase()) score += 20;
  // interests (exclude style entries)
  score += Math.min(10, opts.sharedInterests * 2); // 2 points each up to 10
  return Math.round(score);
}

app.get('/companion-requests/:id/matches', async (req, res) => {
  const { page = '1', pageSize = '10', sort = 'score', sortDir = 'desc' } = req.query as any;
  const cr = await prisma.companionRequest.findUnique({ where: { id: req.params.id }, include: { interests: true } });
  if (!cr) return res.status(404).json({ error: 'Not found' });
  const itineraries = await prisma.itinerary.findMany({ include: { interests: true, joins: { select: { status: true } } } });
  const styleCR = extractStyle(cr.interests);
  const filtered = itineraries.filter((it: any) => it.startDate <= cr.endDate && it.endDate >= cr.startDate);
  const computed = filtered.map((it: any) => {
    const approved = it.joins.filter((j: any) => j.status === 'APPROVED').length;
    const seatsRemaining = Math.max(0, it.maxPeople - approved);
    const styleIt = extractStyle(it.interests);
    const itInterestSet = new Set((it.interests as any[]).map((i: any) => i.value).filter((v: string) => !v.startsWith('style:')));
    const crInterestSet = new Set(cr.interests.map((i: any) => i.value).filter((v: string) => !v.startsWith('style:')));
    let shared = 0; crInterestSet.forEach((v: any) => { if (itInterestSet.has(v)) shared++; });
    const overlapDays = computeOverlapDays(it.startDate, it.endDate, cr.startDate, cr.endDate);
    const durationIt = computeOverlapDays(it.startDate, it.endDate, it.startDate, it.endDate);
    const durationCR = computeOverlapDays(cr.startDate, cr.endDate, cr.startDate, cr.endDate);
    const compatibilityScore = scoreMatch({ destA: it.destination, destB: cr.destination, styleA: styleIt, styleB: styleCR, overlapDays, durationA: durationIt, durationB: durationCR, sharedInterests: shared });
    return {
      type: 'itinerary',
      itineraryId: it.id,
      title: it.title,
      destination: it.destination,
      startDate: it.startDate,
      endDate: it.endDate,
      travelStyle: styleIt,
      sharedInterests: shared,
      overlapDays,
      compatibilityScore,
      seatsRemaining
    };
  }).filter((m: any) => m.seatsRemaining > 0); // exclude fully booked
  const sortLower = String(sort).toLowerCase();
  computed.sort((a: any, b: any) => {
    if (sortLower === 'startdate') {
      return (sortDir === 'asc' ? 1 : -1) * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }
    // default score
    return (sortDir === 'asc' ? 1 : -1) * (a.compatibilityScore - b.compatibilityScore);
  });
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
  const total = computed.length;
  const slice = computed.slice((p - 1) * ps, (p - 1) * ps + ps);
  res.json({ requestId: cr.id, meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) }, matches: slice });
});

app.get('/itineraries/:id/matches', async (req, res) => {
  const { page = '1', pageSize = '10', sort = 'score', sortDir = 'desc' } = req.query as any;
  const it = await prisma.itinerary.findUnique({ where: { id: req.params.id }, include: { interests: true, joins: { select: { status: true } } } });
  if (!it) return res.status(404).json({ error: 'Not found' });
  const approved = it.joins.filter((j: any) => j.status === 'APPROVED').length;
  const seatsRemaining = Math.max(0, it.maxPeople - approved);
  if (seatsRemaining === 0) return res.json({ itineraryId: it.id, matches: [], meta: { page: 1, pageSize: 0, total: 0, totalPages: 0 }, seatsRemaining: 0 });
  const requests = await prisma.companionRequest.findMany({ include: { interests: true } });
  const styleIt = extractStyle(it.interests);
  const filtered = requests.filter((cr: any) => it.startDate <= cr.endDate && it.endDate >= cr.startDate);
  const computed = filtered.map((cr: any) => {
    const styleCR = extractStyle(cr.interests);
    const itInterestSet = new Set(it.interests.map((i: any) => i.value).filter((v: string) => !v.startsWith('style:')));
    const crInterestSet = new Set(cr.interests.map((i: any) => i.value).filter((v: string) => !v.startsWith('style:')));
    let shared = 0; crInterestSet.forEach((v: any) => { if (itInterestSet.has(v)) shared++; });
    const overlapDays = computeOverlapDays(it.startDate, it.endDate, cr.startDate, cr.endDate);
    const durationIt = computeOverlapDays(it.startDate, it.endDate, it.startDate, it.endDate);
    const durationCR = computeOverlapDays(cr.startDate, cr.endDate, cr.startDate, cr.endDate);
    const compatibilityScore = scoreMatch({ destA: it.destination, destB: cr.destination, styleA: styleIt, styleB: styleCR, overlapDays, durationA: durationIt, durationB: durationCR, sharedInterests: shared });
    return {
      type: 'companionRequest',
      companionRequestId: cr.id,
      destination: cr.destination,
      startDate: cr.startDate,
      endDate: cr.endDate,
      travelStyle: styleCR,
      sharedInterests: shared,
      overlapDays,
      compatibilityScore,
      seatsRemaining // seats remaining on the itinerary itself
    };
  });
  const sortLower = String(sort).toLowerCase();
  computed.sort((a: any, b: any) => {
    if (sortLower === 'startdate') {
      return (sortDir === 'asc' ? 1 : -1) * (new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }
    return (sortDir === 'asc' ? 1 : -1) * (a.compatibilityScore - b.compatibilityScore);
  });
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
  const total = computed.length;
  const slice = computed.slice((p - 1) * ps, (p - 1) * ps + ps);
  res.json({ itineraryId: it.id, meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) }, matches: slice });
});

const desiredPort = parseInt(process.env.PORT || '4010', 10);
function startServer(portAttempt: number, depth = 0) {
  initLoggingSchema().catch(err => {
    console.warn('MSSQL logging init failed', err.message);
  }).finally(()=>{
    const server = app.listen(portAttempt, () => {
      console.log(`API listening on port ${portAttempt}`);
    });
    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE' && depth < 3) {
        const nextPort = portAttempt + 1;
        console.warn(`Port ${portAttempt} in use, trying ${nextPort}...`);
        setTimeout(()=> startServer(nextPort, depth + 1), 300);
      } else if (e.code === 'EADDRINUSE') {
        console.error(`Failed to bind after retries. Last port tried: ${portAttempt}`);
        process.exit(1);
      } else {
        console.error('Server error:', e);
        process.exit(1);
      }
    });
  });
}
startServer(desiredPort);
