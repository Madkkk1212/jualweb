import { NextResponse } from 'next/server';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';

// ─── Global State ─────────────────────────────────────────────────────────────
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
  console.log(`[WA Auto] ${isReconnect ? 'Reconnecting' : 'Initializing'} WhatsApp client...`);

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'wa-auto-session',
      dataPath: path.join(process.cwd(), '.wwebjs_auth'),
    }),
    puppeteer: {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    },
  });

  global.waClient = client;

  client.on('qr', async (qr) => {
    global.waStatus = 'NEED_QR';
    global.waQrData = await qrcode.toDataURL(qr);
    global.waIsInitializing = false;
    console.log('[WA Auto] QR received — scan required');
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`[WA Auto] Loading: ${percent}% — ${message}`);
    if (global.waStatus !== 'NEED_QR') global.waStatus = 'RECONNECTING';
  });

  client.on('authenticated', () => { console.log('[WA Auto] Authenticated!'); });

  client.on('ready', () => {
    global.waStatus = 'CONNECTED';
    global.waQrData = undefined;
    global.waIsInitializing = false;
    console.log(`[WA Auto] READY! Connected as: ${client.info?.wid?.user || 'unknown'}`);
  });

  client.on('change_state', (state) => { console.log(`[WA Auto] State -> ${state}`); });

  client.on('disconnected', async (reason) => {
    console.log(`[WA Auto] Disconnected: ${reason}`);
    try { await client.destroy(); } catch {}
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waQrData = undefined;
    if (hasExistingSession()) {
      global.waStatus = 'RECONNECTING';
      setTimeout(() => { if (!global.waClient) initClient(true); }, 5000);
    } else {
      global.waStatus = 'DISCONNECTED';
    }
  });

  client.on('auth_failure', async (msg) => {
    console.error('[WA Auto] Auth failure:', msg);
    try { await client.destroy(); } catch {}
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waQrData = undefined;
    global.waStatus = 'DISCONNECTED';
  });

  client.initialize().catch(async (err) => {
    console.error('[WA Auto] Init failed:', err);
    try { await client.destroy(); } catch {}
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waStatus = 'DISCONNECTED';
  });
}

// ─── Dismiss any popup dialog in WhatsApp Web ────────────────────────────────
async function dismissPopup(): Promise<boolean> {
  if (!global.waClient?.pupPage) return false;
  const page = global.waClient.pupPage;
  try {
    // Check for confirm-popup (e.g. "Use Here", "Continue", logout confirmation)
    const popup = await page.$('[data-testid="confirm-popup"], [data-testid="popup-contents"]').catch(() => null);
    if (!popup) return false;

    console.log('[WA Auto] Popup detected — attempting to dismiss...');

    // Try clicking the primary/confirm button (usually the LAST button = "Use Here")
    const allButtons = await page.$$('[data-testid="confirm-popup"] button, [data-testid="popup-contents"] button').catch(() => []);
    if (allButtons.length > 0) {
      const btn = allButtons[allButtons.length - 1]; // last button = primary action
      await btn.click();
      console.log(`[WA Auto] Clicked popup button (${allButtons.length} found)`);
    } else {
      // No button found — press Enter (default confirm)
      await page.keyboard.press('Enter');
      console.log('[WA Auto] Pressed Enter to dismiss popup');
    }

    await new Promise((r) => setTimeout(r, 2000));
    return true;
  } catch (e) {
    console.warn('[WA Auto] dismissPopup error:', e);
    return false;
  }
}

// ─── GET Handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'status') {
    if (global.waClient && global.waStatus === 'CONNECTED') {
      const ok = global.waClient.pupBrowser?.connected ?? false;
      if (!ok) {
        console.warn('[WA Auto] Browser disconnected. Cleaning up.');
        global.waStatus = 'DISCONNECTED';
        global.waClient.destroy().catch(() => {});
        global.waClient = undefined;
      }
    }
    return NextResponse.json({
      status: global.waStatus || 'DISCONNECTED',
      qr: global.waQrData,
      hasSession: hasExistingSession(),
      connectedNumber: global.waClient?.info?.wid?.user || null,
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

  if (action === 'start') {
    const isReconnect = hasExistingSession();
    if (!global.waClient && !global.waIsInitializing) initClient(isReconnect);
    return NextResponse.json({ success: true, isReconnect });
  }

  if (action === 'logout') {
    if (global.waClient) {
      try { await global.waClient.logout(); await global.waClient.destroy(); }
      catch { try { await global.waClient.destroy(); } catch {} }
    }
    global.waClient = undefined;
    global.waIsInitializing = false;
    global.waStatus = 'DISCONNECTED';
    global.waQrData = undefined;
    try {
      const sessionDir = path.join(process.cwd(), '.wwebjs_auth', 'session-wa-auto-session');
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log('[WA Auto] Session cleared.');
      }
    } catch (e) { console.error('[WA Auto] Failed to clear session:', e); }
    return NextResponse.json({ success: true, message: 'Logged out' });
  }

  if (action === 'send') {
    // ── Guard ──
    if (global.waStatus !== 'CONNECTED' || !global.waClient) {
      return NextResponse.json({ success: false, error: 'WhatsApp not connected' }, { status: 400 });
    }

    // ── Browser health ──
    const isBrowserOk = global.waClient.pupBrowser?.connected === true;
    const isPageOk = !(global.waClient.pupPage?.isClosed() ?? true);
    if (!isBrowserOk || !isPageOk) {
      global.waStatus = 'DISCONNECTED';
      global.waClient.destroy().catch(() => {});
      global.waClient = undefined;
      return NextResponse.json({ success: false, error: 'WhatsApp browser disconnected' }, { status: 400 });
    }

    // ── Dismiss any blocking popup BEFORE doing anything ──
    const wasPopup = await dismissPopup();
    if (wasPopup) {
      console.log('[WA Auto] Popup dismissed. Waiting 2s for WA Web to stabilize...');
      await new Promise((r) => setTimeout(r, 2000));
    }

    // ── Parse request ──
    let body: { phone: string; text: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 }); }

    const { phone, text } = body;
    if (!phone || !text) {
      return NextResponse.json({ success: false, error: 'Phone and text required' }, { status: 400 });
    }

    // ── Normalize phone ──
    const cleanNumber = phone.replace(/\D/g, '');
    let normalizedNumber = cleanNumber;
    if (normalizedNumber.startsWith('0')) normalizedNumber = '62' + normalizedNumber.substring(1);
    else if (normalizedNumber.startsWith('8')) normalizedNumber = '62' + normalizedNumber;
    if (normalizedNumber.length < 10 || normalizedNumber.length > 15) {
      return NextResponse.json({ success: false, error: 'invalid_phone', skipped: true });
    }

    const targetJid = normalizedNumber + '@c.us';
    console.log(`[WA Auto] [SEND] -> ${normalizedNumber}`);

    // ── Send ──
    try {
      const sentMsg = await global.waClient.sendMessage(targetJid, text);

      if (!sentMsg?.id) {
        throw new Error('sendMessage() returned null/invalid object');
      }

      const msgId = sentMsg.id.id;
      const initialAck = sentMsg.ack as number;
      console.log(`[WA Auto] [SEND] sendMessage OK: id=${msgId} ack=${initialAck} to=${sentMsg.to}`);

      // If ack is already -1 immediately, report error
      if (initialAck === -1) {
        console.error(`[WA Auto] [SEND] Immediate ACK_ERROR (-1). Server rejected.`);
        return NextResponse.json({
          success: false,
          error: 'ACK_ERROR (-1): WhatsApp server rejected the message. Session may need re-login.',
          ack: -1,
        });
      }

      // Wait up to 12s for ack >= 1
      let lastAck = initialAck;
      let acknowledged = false;
      const deadline = Date.now() + 12000;
      while (Date.now() < deadline) {
        // Re-read ack from the message object (it updates in-place)
        try {
          const updatedAck = (sentMsg as unknown as { ack: number }).ack;
          if (updatedAck !== lastAck) {
            console.log(`[WA Auto] [SEND] ACK: ${lastAck} -> ${updatedAck}`);
            lastAck = updatedAck;
          }
        } catch {}
        if (lastAck === -1) {
          console.error(`[WA Auto] [SEND] ACK_ERROR (-1) during wait.`);
          break;
        }
        if (lastAck >= 1) { acknowledged = true; break; }
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (acknowledged) {
        console.log(`[WA Auto] [SEND] Delivered! ack=${lastAck}`);
        return NextResponse.json({ success: true, messageId: msgId, ack: lastAck });
      }

      if (lastAck === -1) {
        return NextResponse.json({
          success: false,
          error: 'ACK_ERROR (-1): Server rejected. Try logging out and scanning QR again.',
          ack: -1,
        });
      }

      // ack=0 after 12s: message queued but not confirmed. Treat as likely-sent.
      console.warn(`[WA Auto] [SEND] ack=0 after 12s (queued but unconfirmed). Treating as sent.`);
      return NextResponse.json({ success: true, messageId: msgId, ack: 0, note: 'queued' });

    } catch (err: unknown) {
      const error = err as Error;
      console.error(`[WA Auto] [SEND] Exception: ${error?.message}`);

      const isFatal = (error?.message || '').includes('Target closed') ||
        (error?.message || '').includes('Protocol error') ||
        !(global.waClient?.pupBrowser?.connected ?? false);

      if (isFatal) {
        global.waStatus = 'DISCONNECTED';
        global.waClient?.destroy().catch(() => {});
        global.waClient = undefined;
        return NextResponse.json({ success: false, error: `Browser crashed: ${error?.message}` }, { status: 503 });
      }

      return NextResponse.json({ success: false, error: error?.message || 'Unknown error' });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
