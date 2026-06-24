import { NextResponse } from 'next/server';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

// ─── Global State (persists across HMR) ─────────────────────────────────────
/* eslint-disable no-var */
declare global {
  var waClient: Client | undefined;
  var waStatus: 'DISCONNECTED' | 'INITIALIZING' | 'NEED_QR' | 'CONNECTED' | 'RECONNECTING';
  var waQrData: string | undefined;
  var waIsInitializing: boolean;
}
/* eslint-enable no-var */

global.waStatus = (global.waStatus as string) ? global.waStatus : 'DISCONNECTED';
global.waIsInitializing = global.waIsInitializing ?? false;

// ─── Session Detection ───────────────────────────────────────────────────────
function hasExistingSession(): boolean {
  try {
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', 'session-wa-auto-session');
    return fs.existsSync(sessionDir);
  } catch {
    return false;
  }
}

// ─── Client Initializer ──────────────────────────────────────────────────────
function initClient(isReconnect = false) {
  if (global.waClient || global.waIsInitializing) return;
  global.waIsInitializing = true;
  global.waStatus = isReconnect ? 'RECONNECTING' : 'INITIALIZING';

  console.log(`[WA Auto] ${isReconnect ? 'Reconnecting' : 'Initializing'} client...`);

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'wa-auto-session',
      dataPath: path.join(process.cwd(), '.wwebjs_auth'),
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    },
  });

  // Mark immediately so no double-init
  global.waClient = client;

  client.on('qr', async (qr) => {
    global.waStatus = 'NEED_QR';
    global.waQrData = await qrcode.toDataURL(qr);
    global.waIsInitializing = false;
    console.log('[WA Auto] QR code received — scan required');
  });

  client.on('loading_screen', () => {
    const current = global.waStatus as string;
    if (current !== 'NEED_QR') {
      global.waStatus = 'RECONNECTING';
    }
    console.log('[WA Auto] Loading screen...');
  });

  client.on('authenticated', () => {
    console.log('[WA Auto] Authenticated!');
  });

  client.on('ready', () => {
    global.waStatus = 'CONNECTED';
    global.waQrData = undefined;
    global.waIsInitializing = false;
    console.log('[WA Auto] Client is ready!');
  });

  client.on('disconnected', (reason) => {
    console.log(`[WA Auto] Disconnected: ${reason}`);
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waQrData = undefined;

    // Auto reconnect if session still exists on disk
    if (hasExistingSession()) {
      console.log('[WA Auto] Session found — auto reconnecting in 3s...');
      global.waStatus = 'RECONNECTING';
      setTimeout(() => {
        if (!global.waClient) initClient(true);
      }, 3000);
    } else {
      global.waStatus = 'DISCONNECTED';
    }
  });

  client.on('auth_failure', (msg) => {
    console.error('[WA Auto] Auth failure:', msg);
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waQrData = undefined;
    global.waStatus = 'DISCONNECTED';
  });

  client.initialize().catch((err) => {
    console.error('[WA Auto] Failed to initialize:', err);
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waStatus = 'DISCONNECTED';
  });
}

// ─── Helper: Format Phone ────────────────────────────────────────────────────
function formatPhone(raw: string): string | null {
  let phone = raw.replace(/\D/g, '');
  if (phone.startsWith('0')) phone = '62' + phone.substring(1);
  if (phone.length < 10 || phone.length > 15) return null;
  return phone + '@c.us';
}

// ─── GET Handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'status') {
    return NextResponse.json({
      status: global.waStatus || 'DISCONNECTED',
      qr: global.waQrData,
      hasSession: hasExistingSession(),
    });
  }

  if (action === 'check-session') {
    return NextResponse.json({ hasSession: hasExistingSession() });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // ── Start / Reconnect ──────────────────────────────────────────────────────
  if (action === 'start') {
    const isReconnect = hasExistingSession();
    if (!global.waClient && !global.waIsInitializing) {
      initClient(isReconnect);
    }
    return NextResponse.json({ success: true, isReconnect });
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  if (action === 'logout') {
    if (global.waClient) {
      try {
        await global.waClient.logout();
      } catch (e) {
        console.error('[WA Auto] Logout error:', e);
      }
    }
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waStatus = 'DISCONNECTED';
    global.waQrData = undefined;

    // Remove session files so it doesn't auto reconnect
    try {
      const sessionDir = path.join(process.cwd(), '.wwebjs_auth', 'session-wa-auto-session');
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log('[WA Auto] Session files removed.');
      }
    } catch (e) {
      console.error('[WA Auto] Failed to remove session files:', e);
    }

    return NextResponse.json({ success: true, message: 'Logged out and session cleared' });
  }

  // ── Send Message ──────────────────────────────────────────────────────────
  if (action === 'send') {
    if (global.waStatus !== 'CONNECTED' || !global.waClient) {
      return NextResponse.json({ success: false, error: 'WhatsApp not connected' }, { status: 400 });
    }

    let body: { phone: string; text: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { phone, text } = body;
    if (!phone || !text) {
      return NextResponse.json({ success: false, error: 'Phone and text are required' }, { status: 400 });
    }

    const formattedPhone = formatPhone(phone);
    if (!formattedPhone) {
      return NextResponse.json({ success: false, error: 'invalid_phone', skipped: true }, { status: 200 });
    }

    // ── Human-like: vary each message slightly with a random invisible unicode char ──
    // This makes each message technically unique — avoids "identical bulk message" detection
    const invisibleChars = ['\u200C', '\u200D', '\uFEFF', '\u200B'];
    const randomInvisible = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
    const variedText = text + randomInvisible;

    // ── Human-like: simulate typing duration (2–6 seconds) ──
    const typingDuration = 2000 + Math.floor(Math.random() * 4000);

    // ── Send with 1 retry ──────────────────────────────────────────────────
    let lastError = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (!global.waClient || global.waStatus !== 'CONNECTED') {
          return NextResponse.json({ success: false, error: 'WhatsApp disconnected mid-send' }, { status: 503 });
        }

        // Simulate "typing..." indicator in the chat before sending
        try {
          const chat = await global.waClient.getChatById(formattedPhone);
          await chat.sendStateTyping();
          await new Promise((r) => setTimeout(r, typingDuration));
          await chat.clearState();
        } catch {
          // Chat may not exist yet (first message) — just wait the duration naturally
          await new Promise((r) => setTimeout(r, typingDuration));
        }

        await global.waClient.sendMessage(formattedPhone, variedText);
        return NextResponse.json({ success: true });
      } catch (err: unknown) {
        const error = err as Error;
        lastError = error?.message || 'Unknown error';
        console.error(`[WA Auto] Send attempt ${attempt + 1} failed:`, lastError);
        if (attempt === 0) {
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }

    return NextResponse.json({ success: false, error: lastError }, { status: 500 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
