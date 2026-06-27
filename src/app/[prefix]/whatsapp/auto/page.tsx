"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Search, CheckCircle,
  ArrowLeft, Loader2, PlayCircle, StopCircle, Smartphone, Info, Clock,
  Users, SkipForward, AlertCircle, RefreshCw, Wifi, WifiOff, Signal
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  category?: string;
  ig?: string;
  website?: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
}

interface StoredLink {
  id: string;
  title: string;
  url: string;
  category: string;
}

interface SendHistory {
  id: string;
  contact_name: string;
  contact_phone: string;
  template_name: string;
  created_at: string;
}

type WaStatus = 'DISCONNECTED' | 'INITIALIZING' | 'NEED_QR' | 'CONNECTED' | 'RECONNECTING';
type SendStatus = 'pending' | 'sending' | 'success' | 'error' | 'skipped';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<WaStatus, { label: string; color: string; icon: React.ReactNode; dot: string }> = {
  CONNECTED:    { label: 'Terhubung',          color: 'text-green-700',  icon: <Wifi className="h-3.5 w-3.5" />,      dot: 'bg-green-500' },
  RECONNECTING: { label: 'Menghubungkan ulang', color: 'text-amber-700',  icon: <RefreshCw className="h-3.5 w-3.5 animate-spin" />, dot: 'bg-amber-500 animate-pulse' },
  INITIALIZING: { label: 'Memulai...',          color: 'text-blue-700',   icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,    dot: 'bg-blue-500 animate-pulse' },
  NEED_QR:      { label: 'Perlu Scan QR',      color: 'text-purple-700', icon: <Smartphone className="h-3.5 w-3.5" />, dot: 'bg-purple-500' },
  DISCONNECTED: { label: 'Terputus',            color: 'text-red-700',    icon: <WifiOff className="h-3.5 w-3.5" />,   dot: 'bg-red-500' },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WhatsAppAutoPage() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  const [userId, setUserId] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<SendHistory[]>([]);
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Connection
  const [waStatus, setWaStatus] = useState<WaStatus>('DISCONNECTED');
  const [waQr, setWaQr] = useState<string>("");
  const [hasSession, setHasSession] = useState(false);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  const [sentStatusFilter, setSentStatusFilter] = useState<string>("all");

  // Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedWebs, setSelectedWebs] = useState<Record<string, string>>({});
  const [selectedWebCategories, setSelectedWebCategories] = useState<Record<string, string>>({});
  const [delaySeconds, setDelaySeconds] = useState<number>(30);
  const [batchSize, setBatchSize] = useState<number>(20);
  const [batchBreakMinutes, setBatchBreakMinutes] = useState<number>(15);
  const [shuffleContacts, setShuffleContacts] = useState<boolean>(true);

  // Send State
  const [isSendingMode, setIsSendingMode] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [sendQueue, setSendQueue] = useState<Contact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentStatus, setSentStatus] = useState<Record<string, SendStatus>>({});
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isBatchBreak, setIsBatchBreak] = useState(false);
  const [batchBreakCountdown, setBatchBreakCountdown] = useState<number | null>(null);
  const [sessionSentCount, setSessionSentCount] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const sendingItemRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // ─── Auth & Init ───────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    if (typeof window === "undefined") return;

    const VALID_PREFIXES = ["madk"];
    if (!VALID_PREFIXES.includes(prefix)) {
      router.replace("/not-found");
      return;
    }

    const session = localStorage.getItem("luma_session");
    if (!session || prefix !== session) {
      router.replace(`/workspace/login`);
      return;
    }
    setUserId(session);
    loadData(session);

    // Check status immediately
    checkWaStatus(true);

    // Poll every 3s
    pollIntervalRef.current = setInterval(() => checkWaStatus(false), 3000);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, prefix]);

  // ─── Data Loading ──────────────────────────────────────────────────────────
  const loadData = async (user: string) => {
    setIsLoading(true);
    try {
      const [contactsRes, templatesRes, historyRes, businessesRes, linksRes] = await Promise.all([
        supabase.from("contacts").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_templates").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_send_history").select("*").eq("user_id", user).order("created_at", { ascending: false }).limit(2000),
        supabase.from("businesses").select("*").eq("user_id", user).not("phone", "is", null).order("created_at", { ascending: false }),
        supabase.from("links").select("*").eq("user_id", user).order("created_at", { ascending: false }),
      ]);

      /* eslint-disable @typescript-eslint/no-explicit-any */
      const fetchedContacts = contactsRes.data ? contactsRes.data.map((c: any) => ({
        id: c.id, name: c.name, phone: c.phone,
        email: c.email || "", category: c.category || "Umum",
        ig: c.ig || "", website: c.website || "",
      })) : [];

      const fetchedBusinesses = businessesRes.data ? businessesRes.data
        .filter((b: any) => b.phone && b.phone !== "—" && b.phone !== "-")
        .map((b: any) => ({
          id: `biz-${b.id}`, name: b.name, phone: b.phone,
          email: b.contact_name || "", category: b.category || "Bisnis",
          ig: b.instagram || "", website: b.website || "",
        })) : [];
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setContacts([...fetchedContacts, ...fetchedBusinesses]);
      if (templatesRes.data) setTemplates(templatesRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      if (linksRes.data) setLinks(linksRes.data);
    } catch (err) {
      console.error("Supabase load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── WA Status ─────────────────────────────────────────────────────────────
  const checkWaStatus = async (autoStart = false) => {
    try {
      const res = await fetch('/api/wa-auto?action=status');
      const data = await res.json();
      if (!isMountedRef.current) return;

      setWaStatus(data.status);
      setHasSession(data.hasSession);
      if (data.qr) setWaQr(data.qr);
      setConnectedNumber(data.connectedNumber || null);

      // Auto-start if session exists and currently disconnected
      if (autoStart && data.status === 'DISCONNECTED' && data.hasSession) {
        console.log('[Frontend] Session found, auto-starting...');
        handleStartWa();
      }
    } catch {
      // Silent fail on poll
    }
  };

  const handleStartWa = async () => {
    if (!isMountedRef.current) return;
    setWaStatus(hasSession ? 'RECONNECTING' : 'INITIALIZING');
    await fetch('/api/wa-auto?action=start', { method: 'POST' });
    checkWaStatus(false);
  };

  const handleLogoutWa = async () => {
    await fetch('/api/wa-auto?action=logout', { method: 'POST' });
    setWaStatus('DISCONNECTED');
    setHasSession(false);
    setWaQr("");
  };

  // ─── Filtering ──────────────────────────────────────────────────────────────
  const contactCategories = ["Semua", ...Array.from(new Set(contacts.map(c => c.category).filter(Boolean) as string[]))];

  const filteredContacts = contacts.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    const matchCat = activeCategory === "Semua" || c.category === activeCategory;

    let matchWeb = true;
    if (websiteFilter === "has_web") matchWeb = !!c.website && c.website.trim() !== "" && c.website.trim() !== "—" && c.website.trim() !== "-";
    else if (websiteFilter === "no_web") matchWeb = !c.website || c.website.trim() === "" || c.website.trim() === "—" || c.website.trim() === "-";

    let matchSent = true;
    if (sentStatusFilter !== "all") {
      let phoneToMatch = c.phone.replace(/\D/g, "");
      if (phoneToMatch.startsWith("0")) phoneToMatch = "62" + phoneToMatch.substring(1);
      const hasLog = history.some(h => h.contact_phone === phoneToMatch || (c.ig && h.contact_phone.includes(c.ig)));
      if (sentStatusFilter === "sent") matchSent = hasLog;
      else if (sentStatusFilter === "unsent") matchSent = !hasLog;
    }

    return matchSearch && matchCat && matchWeb && matchSent;
  });

  // ─── Selection ─────────────────────────────────────────────────────────────
  const handleSelectContact = (id: string) => {
    const newSet = new Set(selectedContacts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedContacts(newSet);
  };

  const handleSelectAllFiltered = () => {
    const allIds = filteredContacts.map(c => c.id);
    const allSelected = allIds.every(id => selectedContacts.has(id));
    const newSet = new Set(selectedContacts);
    if (allSelected) {
      allIds.forEach(id => newSet.delete(id));
    } else {
      allIds.forEach(id => newSet.add(id));
    }
    setSelectedContacts(newSet);
  };

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
  };

  const handleSelectAllInCategory = () => {
    const catContacts = activeCategory === "Semua"
      ? filteredContacts
      : filteredContacts.filter(c => c.category === activeCategory);
    const newSet = new Set(selectedContacts);
    catContacts.forEach(c => newSet.add(c.id));
    setSelectedContacts(newSet);
  };

  const handleClearSelection = () => {
    setSelectedContacts(new Set());
  };

  // ─── Stats Computation ──────────────────────────────────────────────────────
  const stats = {
    total: sendQueue.length,
    success: Object.values(sentStatus).filter(s => s === 'success').length,
    error: Object.values(sentStatus).filter(s => s === 'error').length,
    skipped: Object.values(sentStatus).filter(s => s === 'skipped').length,
    pending: Object.values(sentStatus).filter(s => s === 'pending').length,
    sending: Object.values(sentStatus).filter(s => s === 'sending').length,
  };
  const done = stats.success + stats.error + stats.skipped;
  const successPct = done > 0 ? Math.round((stats.success / done) * 100) : 0;
  const eta = Math.max(0, stats.pending) * (delaySeconds + 4); // seconds

  const formatEta = (secs: number) => {
    if (secs <= 0) return "Selesai";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `~${m}m ${s}s` : `~${s}s`;
  };

  // ─── Message Builder ────────────────────────────────────────────────────────
  const buildMessage = useCallback((contact: Contact, templateContent: string) => {
    let msg = templateContent;
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    msg = msg.replace(/{nama}/g, contact.name);
    msg = msg.replace(/{nomor}/g, contact.phone);
    msg = msg.replace(/{kategori}/g, contact.category || "-");
    msg = msg.replace(/{tanggal}/g, dateStr);
    msg = msg.replace(/{websitekita}/g, "lumaspace.web.id");

    let igText = "-";
    if (contact.ig && contact.ig.trim() !== "") {
      igText = contact.ig.startsWith("@") ? contact.ig : `@${contact.ig}`;
    }
    msg = msg.replace(/{instagram}/g, igText);

    const webMatches = msg.match(/{website\d+}/g) || [];
    Array.from(new Set(webMatches)).forEach(w => {
      const wKey = w.replace(/[{}]/g, '');
      msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[${wKey.toUpperCase()}]`);
    });

    return msg;
  }, [selectedWebs]);

  // ─── Auto Send Loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoRunning || !isSendingMode || waStatus !== 'CONNECTED') {
      console.log(`[WA Auto Frontend] Loop skipped. isAutoRunning: ${isAutoRunning}, isSendingMode: ${isSendingMode}, waStatus: ${waStatus}`);
      return;
    }
    let alive = true;

    const runLoop = async () => {
      console.log(`[WA Auto Frontend] Memulai pemrosesan antrean. Index awal: ${currentIndex}/${sendQueue.length}`);
      for (let i = currentIndex; i < sendQueue.length; i++) {
        if (!alive) break;
        if (!isAutoRunning) {
          console.log("[WA Auto Frontend] Pemrosesan antrean dijeda.");
          break;
        }

        const contact = sendQueue[i];
        console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Memulai pemrosesan untuk: ${contact.name} (${contact.phone})`);

        // Skip already processed
        const curStatus = sentStatus[contact.id];
        if (curStatus === 'success' || curStatus === 'skipped') {
          console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Kontak ini sudah memiliki status '${curStatus}'. Dilewati.`);
          setCurrentIndex(i + 1);
          continue;
        }

        // ── Batch Break: pause every batchSize messages ──────────────────────
        if (i > 0 && i % batchSize === 0) {
          const breakSecs = batchBreakMinutes * 60;
          setIsBatchBreak(true);
          console.log(`[WA Auto Frontend] [BATCH BREAK] Istirahat selama ${batchBreakMinutes} menit setelah mengirim ${i} pesan.`);
          for (let s = breakSecs; s > 0; s--) {
            if (!alive || !isAutoRunning) break;
            setBatchBreakCountdown(s);
            await new Promise(r => setTimeout(r, 1000));
          }
          if (alive) { setIsBatchBreak(false); setBatchBreakCountdown(null); }
        }

        if (!alive || !isAutoRunning) break;

        // Mark as sending
        console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Menandai status pengiriman sebagai 'sending'`);
        setSentStatus(prev => ({ ...prev, [contact.id]: 'sending' }));
        setTimeout(() => sendingItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);

        const template = templates.find(t => t.id === selectedTemplateId);
        if (!template) {
          console.error(`[WA Auto Frontend] [QUEUE #${i + 1}] Error: Template dengan ID ${selectedTemplateId} tidak ditemukan.`);
          setSentStatus(prev => ({ ...prev, [contact.id]: 'error' }));
          setCurrentIndex(i + 1);
          continue;
        }

        const msg = buildMessage(contact, template.content);
        console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Menghubungi API backend untuk mengirim pesan ke ${contact.phone}...`);

        try {
          const res = await fetch('/api/wa-auto?action=send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: contact.phone, text: msg }),
          });
          
          console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Mendapatkan response HTTP ${res.status}`);
          const data = await res.json();
          console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] Data response:`, data);

          if (!alive) break;

          if (data.success) {
            console.log(`[WA Auto Frontend] [QUEUE #${i + 1}] SUKSES mengirim pesan ke ${contact.name}. ID Pesan: ${data.messageId}`);
            setSentStatus(prev => ({ ...prev, [contact.id]: 'success' }));
            setSessionSentCount(prev => prev + 1);
            
            const historyData = {
              contact_name: contact.name, contact_phone: contact.phone,
              template_name: template.name, user_id: userId, sent_by: userId,
            };
            supabase.from("whatsapp_send_history").insert([historyData]).select().then(({ data: inserted, error }) => {
              if (error) console.error("[WA Auto Frontend] Gagal menyimpan riwayat ke Supabase:", error);
              if (inserted) {
                console.log("[WA Auto Frontend] Riwayat tersimpan di Supabase:", inserted[0]);
                setHistory(prev => [inserted[0], ...prev]);
              }
            });
          } else if (data.skipped) {
            console.warn(`[WA Auto Frontend] [QUEUE #${i + 1}] DILEWATI: ${data.error}`);
            setSentStatus(prev => ({ ...prev, [contact.id]: 'skipped' }));
          } else {
            console.error(`[WA Auto Frontend] [QUEUE #${i + 1}] GAGAL: ${data.error}`);
            setSentStatus(prev => ({ ...prev, [contact.id]: 'error' }));
          }
        } catch (fetchErr) {
          const error = fetchErr as Error;
          console.error(`[WA Auto Frontend] [QUEUE #${i + 1}] Exception ditangkap saat memanggil API:`, error.message, error.stack);
          if (alive) setSentStatus(prev => ({ ...prev, [contact.id]: 'error' }));
        }

        if (!alive) break;
        setCurrentIndex(i + 1);

        // ── Delay: base + large random range ────────────────────────────────
        if (i < sendQueue.length - 1) {
          const randomExtra = Math.floor(Math.random() * delaySeconds);
          const delaySecs = Math.max(20, delaySeconds) + randomExtra;
          console.log(`[WA Auto Frontend] [DELAY] Menunggu jeda selama ${delaySecs} detik sebelum kontak berikutnya.`);
          for (let s = delaySecs; s > 0; s--) {
            if (!alive) break;
            setCountdown(s);
            await new Promise(r => setTimeout(r, 1000));
          }
          if (alive) setCountdown(null);
        }
      }

      if (alive) {
        console.log("[WA Auto Frontend] Pemrosesan antrean selesai.");
        setIsAutoRunning(false);
        setCountdown(null);
        setIsBatchBreak(false);
        setBatchBreakCountdown(null);
      }
    };

    runLoop();
    return () => { alive = false; };
  }, [isAutoRunning, isSendingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Start Blast ─────────────────────────────────────────────────────────────
  const startAutoBlast = () => {
    console.log("[WA Auto Frontend] Tombol Kirim (startAutoBlast) diklik");
    if (!selectedTemplateId) {
      console.warn("[WA Auto Frontend] Gagal memulai: Template pesan belum dipilih");
      return alert("Pilih template pesan dulu!");
    }
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) {
      console.error("[WA Auto Frontend] Gagal memulai: Template tidak ditemukan");
      return;
    }

    const usedWebVars = Array.from(new Set((template.content || "").match(/{website\d+}/g) || [])).map(w => w.replace(/[{}]/g, ''));
    if (usedWebVars.some(w => !selectedWebs[w])) {
      console.warn("[WA Auto Frontend] Gagal memulai: Tautan website variabel belum lengkap");
      return alert("Harap pilih tautan website untuk semua variabel terlebih dahulu!");
    }

    let queue = contacts.filter(c => selectedContacts.has(c.id));
    console.log(`[WA Auto Frontend] Jumlah kontak yang dipilih untuk dikirim: ${queue.length}`);
    if (queue.length === 0) {
      console.warn("[WA Auto Frontend] Gagal memulai: Tidak ada kontak terpilih");
      return alert("Pilih minimal 1 kontak!");
    }

    // Shuffle contact order if enabled (avoids sequential pattern detection)
    if (shuffleContacts) {
      queue = [...queue].sort(() => Math.random() - 0.5);
      console.log("[WA Auto Frontend] Urutan antrean dikocok (shuffled)");
    }

    console.log("[WA Auto Frontend] Queue berhasil dibuat:", queue.map(c => ({ id: c.id, name: c.name, phone: c.phone })));
    console.log(`[WA Auto Frontend] Status WhatsApp Web saat ini: ${waStatus}`);

    setSendQueue(queue);
    const initialStatus: Record<string, SendStatus> = {};
    queue.forEach(c => { initialStatus[c.id] = 'pending'; });
    setSentStatus(initialStatus);
    setCurrentIndex(0);
    setCountdown(null);
    setIsSendingMode(true);
    setIsAutoRunning(true);
  };

  // ─── Connection Screen (not yet connected) ───────────────────────────────────
  if (waStatus !== 'CONNECTED') {
    const sc = STATUS_CONFIG[waStatus];
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center p-6 text-[#4A3E3D]">
        <div className="absolute top-6 left-6">
          <button onClick={() => router.push(`/${prefix}/whatsapp`)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-[#EFEAE2] transition flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> <span>Kembali</span>
          </button>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#E6DFD5] max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            waStatus === 'RECONNECTING' ? 'bg-amber-100 text-amber-600' :
            waStatus === 'NEED_QR' ? 'bg-purple-100 text-purple-600' :
            waStatus === 'INITIALIZING' ? 'bg-blue-100 text-blue-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Smartphone className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">WhatsApp Auto Sender</h1>

          {/* Status pill */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 ${
            waStatus === 'RECONNECTING' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
            waStatus === 'INITIALIZING' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
            waStatus === 'NEED_QR' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
            'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
            {sc.label}
          </div>

          {/* QR Code */}
          {waStatus === 'NEED_QR' && waQr && (
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 bg-white border border-[#E6DFD5] rounded-xl shadow-inner mb-4 inline-block">
                <Image src={waQr} alt="WhatsApp QR Code" width={240} height={240} unoptimized />
              </div>
              <p className="font-semibold text-sm mb-1">Scan QR Code ini di HP Anda</p>
              <p className="text-xs text-[#7A6F6D]">WhatsApp &gt; Menu &gt; Tautkan Perangkat</p>
            </div>
          )}

          {/* Reconnecting / Initializing spinner */}
          {(waStatus === 'RECONNECTING' || waStatus === 'INITIALIZING') && (
            <div className="flex flex-col items-center gap-3 mb-6">
              <Loader2 className="h-8 w-8 animate-spin text-[#A07855]" />
              <p className="font-semibold text-sm">
                {waStatus === 'RECONNECTING' ? 'Menghubungkan kembali sesi tersimpan...' : 'Memulai koneksi WhatsApp...'}
              </p>
              <p className="text-xs text-[#7A6F6D]">Mohon tunggu, proses ini bisa memakan 15–30 detik</p>
            </div>
          )}

          {/* Disconnected state */}
          {waStatus === 'DISCONNECTED' && (
            <div className="mb-6">
              <p className="text-[#7A6F6D] mb-4 text-sm">
                {hasSession
                  ? 'Sesi ditemukan. Klik tombol di bawah untuk terhubung kembali tanpa scan QR.'
                  : 'Belum ada sesi aktif. Hubungkan WhatsApp Anda terlebih dahulu.'}
              </p>
              <button
                onClick={handleStartWa}
                className="w-full py-3 bg-[#A07855] text-white font-bold rounded-xl hover:bg-[#8B684A] transition-colors flex items-center justify-center gap-2"
              >
                {hasSession ? <><RefreshCw className="h-4 w-4" /> Hubungkan Kembali</> : <><Smartphone className="h-4 w-4" /> Mulai Koneksi</>}
              </button>
            </div>
          )}

          <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs text-left border border-blue-200 flex gap-3 items-start">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Fitur ini menggunakan WhatsApp Web di background. Pastikan terminal Node.js tetap berjalan. Gunakan dengan bijak agar nomor tidak terblokir.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Interface ──────────────────────────────────────────────────────────
  const categoryCounts = contactCategories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "Semua" ? contacts.length : contacts.filter(c => c.category === cat).length;
    return acc;
  }, {});

  const filteredInActiveCategory = activeCategory === "Semua"
    ? filteredContacts
    : filteredContacts.filter(c => c.category === activeCategory);

  const allInCategorySelected = filteredInActiveCategory.length > 0 &&
    filteredInActiveCategory.every(c => selectedContacts.has(c.id));

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8F4EE] overflow-hidden font-sans relative text-[#4A3E3D]">

      {/* ─── SEND MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSendingMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#E6DFD5] bg-[#FAF6F0] flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-[#3C2F2F]">Proses Auto Blast</h2>
                  <p className="text-xs text-[#7A6F6D]">Mengirim ke {stats.total} kontak</p>
                </div>
                <button
                  onClick={() => { setIsAutoRunning(false); setIsSendingMode(false); }}
                  className="p-2 hover:bg-[#E6DFD5] rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-[#7A6F6D]" />
                </button>
              </div>

              {/* ── Dashboard Stats ── */}
              <div className="px-4 py-3 bg-white border-b border-[#F0EAE1] shrink-0">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">Total</span>
                    <span className="text-xl font-black text-gray-700">{stats.total}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-green-50 border border-green-100">
                    <span className="text-xs text-green-500 font-medium">Terkirim</span>
                    <span className="text-xl font-black text-green-600">{stats.success}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-red-50 border border-red-100">
                    <span className="text-xs text-red-400 font-medium">Gagal</span>
                    <span className="text-xl font-black text-red-500">{stats.error}</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-xs text-amber-500 font-medium">Dilewati</span>
                    <span className="text-xl font-black text-amber-600">{stats.skipped}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                    <span>Progress: {done}/{stats.total}</span>
                    <span className="text-green-600">{successPct}% Berhasil</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.total > 0 ? (done / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* ETA */}
                {isAutoRunning && stats.pending > 0 && (
                  <p className="text-[10px] text-gray-400 text-right font-medium">
                    Estimasi selesai: <span className="text-gray-600 font-bold">{formatEta(eta)}</span>
                  </p>
                )}
              </div>
                {/* Batch Break Banner */}
                {isBatchBreak && batchBreakCountdown !== null && (
                  <div className="mx-4 mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-purple-500 animate-spin shrink-0" />
                    <div>
                      <p className="text-xs font-black text-purple-700">Istirahat Antar Batch</p>
                      <p className="text-[10px] text-purple-500">
                        Menunggu {Math.floor(batchBreakCountdown/60)}m {batchBreakCountdown%60}s agar tidak terdeteksi otomatis
                      </p>
                    </div>
                  </div>
                )}

              <div className="flex-1 overflow-y-auto p-3 bg-white space-y-1.5">
                {sendQueue.map((contact, idx) => {
                  const status = sentStatus[contact.id];
                  const isActive = idx === currentIndex;
                  return (
                    <div
                      key={contact.id}
                      ref={isActive && status === 'sending' ? sendingItemRef : undefined}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        status === 'success' ? 'bg-green-50 border-green-200' :
                        status === 'sending' ? 'bg-blue-50 border-blue-300 shadow-sm' :
                        status === 'error'   ? 'bg-red-50 border-red-200' :
                        status === 'skipped' ? 'bg-gray-50 border-gray-200' :
                        'bg-white border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#3C2F2F]">{contact.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {status === 'success'  && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Terkirim</span>}
                        {status === 'error'    && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Gagal</span>}
                        {status === 'skipped'  && <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><SkipForward className="h-4 w-4" /> Dilewati</span>}
                        {status === 'sending'  && <span className="text-xs font-bold text-blue-600 flex items-center gap-1"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengirim...</span>}
                        {status === 'pending' && idx === currentIndex && countdown !== null && (
                          <span className="text-xs font-bold text-amber-600 flex items-center gap-1"><Clock className="h-3.5 w-3.5 animate-pulse" /> Jeda {countdown}s</span>
                        )}
                        {status === 'pending' && !(idx === currentIndex && countdown !== null) && (
                          <span className="text-xs font-bold text-gray-300">Antrian</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E6DFD5] bg-[#FDFBF7] flex justify-between items-center shrink-0">
                <div className="text-sm font-bold text-[#5C4B40]">
                  {isBatchBreak ? (
                    <span className="flex items-center gap-1.5 text-purple-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Istirahat sesi: {batchBreakCountdown ? `${Math.floor(batchBreakCountdown/60)}m ${batchBreakCountdown%60}s` : '...'}
                    </span>
                  ) : isAutoRunning ? (
                    <span className="flex items-center gap-1.5"><Signal className="h-4 w-4 text-green-500 animate-pulse" /> Berjalan... ({sessionSentCount} terkirim sesi ini)</span>
                  ) : done === stats.total ? (
                    <span className="text-green-600 font-bold">✓ Semua selesai diproses</span>
                  ) : (
                    <span className="text-amber-600">Dijeda</span>
                  )}
                </div>
                {done < stats.total ? (
                  <button
                    onClick={() => setIsAutoRunning(!isAutoRunning)}
                    className={`px-4 py-2 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 ${
                      isAutoRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isAutoRunning ? <><StopCircle className="h-4 w-4" /> Jeda</> : <><PlayCircle className="h-4 w-4" /> Lanjutkan</>}
                  </button>
                ) : (
                  <button onClick={() => setIsSendingMode(false)} className="px-4 py-2 bg-[#A07855] text-white font-bold rounded-xl text-sm hover:bg-[#8B684A] transition-colors">
                    Tutup
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div className="w-[240px] bg-[#FAF6F0] border-r border-[#DCd4c6] flex-col h-full flex-shrink-0 z-10 hidden lg:flex">
        {/* Header */}
        <div className="p-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <button onClick={() => router.push(`/${prefix}/whatsapp`)} className="p-1.5 bg-white rounded-lg border border-[#DCd4c6] hover:bg-[#F0EAE1]">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 text-green-600">
            <MessageCircle className="h-4 w-4 fill-current" />
            <span className="font-bold text-xs">WA Auto</span>
          </div>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          {/* Categories */}
          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest mb-2">Kategori</h3>
          <div className="space-y-0.5 mb-3">
            {contactCategories.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${
                    isActive ? "bg-[#EFEAE2] text-[#5C4B40] border border-[#DCd4c6]" : "text-[#7A6F6D] hover:bg-[#FDFBF7]"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span className="text-[10px] text-[#A89F95] ml-1 shrink-0">{categoryCounts[cat] || 0}</span>
                </button>
              );
            })}
          </div>

          {/* Pilih Semua per kategori */}
          <div className="flex gap-1.5">
            <button
              onClick={handleSelectAllInCategory}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
                allInCategorySelected
                  ? 'bg-[#A07855]/10 text-[#A07855] border border-[#A07855]/20'
                  : 'bg-white border border-[#DCd4c6] text-[#7A6F6D] hover:bg-[#F0EAE1]'
              }`}
            >
              <Users className="h-3 w-3" />
              Pilih Semua
            </button>
            <button
              onClick={handleClearSelection}
              className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors bg-white border border-[#DCd4c6] text-[#7A6F6D] hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              Batalkan
            </button>
          </div>

          {/* Selected badge */}
          {selectedContacts.size > 0 && (
            <div className="mt-2 py-1.5 px-3 bg-[#A07855]/10 border border-[#A07855]/20 rounded-lg text-center">
              <span className="text-[11px] font-black text-[#A07855]">{selectedContacts.size} Terpilih</span>
            </div>
          )}

          {/* Connection status */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700">WA Terhubung</span>
            </div>
            {connectedNumber && (
              <p className="text-[10px] text-green-600 font-semibold mb-2 font-mono break-all">
                No: +{connectedNumber}
              </p>
            )}
            <button
              onClick={handleLogoutWa}
              className="text-[10px] w-full py-1.5 border border-green-300 rounded-lg text-green-800 font-semibold hover:bg-green-100 transition-colors"
            >
              Putuskan Koneksi
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#3C2F2F]">Auto Blaster</h1>
              <p className="text-xs text-[#7A6F6D]">Pilih kontak → klik Mulai → sistem berjalan otomatis</p>
            </div>
            {selectedContacts.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#A07855] bg-[#A07855]/10 border border-[#A07855]/20 px-2.5 py-1 rounded-full">
                  {selectedContacts.size} dipilih
                </span>
                <button onClick={handleClearSelection} className="text-xs text-red-500 hover:underline font-semibold">
                  Batalkan
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A89F95]" />
              <input
                type="text"
                placeholder="Cari nama atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:border-[#A07855]"
              />
            </div>
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              className="text-xs bg-white border border-[#DCd4c6] rounded-xl py-2 px-3 focus:outline-none"
            >
              <option value="all">Semua Website</option>
              <option value="has_web">Punya Website</option>
              <option value="no_web">Tanpa Website</option>
            </select>
            <select
              value={sentStatusFilter}
              onChange={(e) => setSentStatusFilter(e.target.value)}
              className="text-xs bg-white border border-[#DCd4c6] rounded-xl py-2 px-3 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="sent">Sudah Dikirim</option>
              <option value="unsent">Belum Dikirim</option>
            </select>
          </div>

          {/* Select all in view */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className="text-xs font-bold text-[#A07855] hover:underline flex items-center gap-1"
            >
              <Users className="h-3 w-3" />
              {filteredContacts.every(c => selectedContacts.has(c.id)) && filteredContacts.length > 0
                ? 'Batalkan Semua Tampil'
                : `Pilih Semua (${filteredContacts.length})`}
            </button>
            <span className="text-gray-200">|</span>
            <span className="text-xs text-gray-400">{filteredContacts.length} kontak ditampilkan</span>
          </div>
        </div>

        {/* Contact Table */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-w-[700px] w-full">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#E6DFD5] bg-white sticky top-0 z-10 text-[10px] font-black text-[#A89F95] uppercase tracking-wider">
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={filteredContacts.every(c => selectedContacts.has(c.id)) && filteredContacts.length > 0}
                  onChange={handleSelectAllFiltered}
                  className="rounded border-[#DCd4c6]"
                />
              </div>
              <div className="col-span-3">Nama Kontak</div>
              <div className="col-span-3">No. WhatsApp</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-3">Log Terakhir</div>
            </div>
            <div className="divide-y divide-[#F0EAE1]">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#A07855]" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-400">Tidak ada kontak yang cocok</div>
              ) : filteredContacts.map(contact => {
                const isSelected = selectedContacts.has(contact.id);
                let phoneToMatch = contact.phone.replace(/\D/g, "");
                if (phoneToMatch.startsWith("0")) phoneToMatch = "62" + phoneToMatch.substring(1);
                const lastLog = history.find(h => h.contact_phone === phoneToMatch || (contact.ig && h.contact_phone.includes(contact.ig)));

                return (
                  <div
                    key={contact.id}
                    className={`grid grid-cols-12 gap-4 p-3.5 items-center transition-colors hover:bg-[#FAF6F0] cursor-pointer ${isSelected ? "bg-[#F0EAE1]" : ""}`}
                    onClick={() => handleSelectContact(contact.id)}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input type="checkbox" checked={isSelected} readOnly className="rounded border-[#DCd4c6] text-[#A07855] pointer-events-none" />
                    </div>
                    <div className="col-span-3 font-bold text-sm text-[#3C2F2F] truncate">{contact.name}</div>
                    <div className="col-span-3 text-xs font-mono text-[#7A6F6D]">{contact.phone}</div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-[#A89F95] bg-[#F0EAE1] px-2 py-0.5 rounded-full">{contact.category || "Umum"}</span>
                    </div>
                    <div className="col-span-3">
                      {lastLog ? (
                        <div className="flex flex-col text-xs text-[#7A6F6D]">
                          <span className="font-semibold text-green-700 truncate">{lastLog.template_name}</span>
                          <span className="text-[10px]">{new Date(lastLog.created_at).toLocaleString("id-ID")}</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[300px] bg-white border-t lg:border-t-0 lg:border-l border-[#E6DFD5] flex flex-col h-full z-10 shrink-0">
        <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7]">
          <h2 className="text-sm font-bold text-[#3C2F2F]">Pengaturan Blast</h2>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Template */}
          <div>
            <label className="block text-[10px] font-black text-[#A89F95] uppercase tracking-wider mb-2">Template Pesan</label>
            <select
              value={selectedTemplateId || ""}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full bg-white border border-[#DCd4c6] rounded-xl px-3 py-2 text-sm text-[#5C4B40] font-semibold focus:outline-none focus:border-[#A07855]"
            >
              <option value="" disabled>Pilih Template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Template preview */}
          {selectedTemplateId && (
            <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#DCd4c6] text-xs text-[#7A6F6D] whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
              {templates.find(t => t.id === selectedTemplateId)?.content.substring(0, 200)}...
            </div>
          )}

          {/* Website vars */}
          {(() => {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (!template) return null;
            const usedWebVars = Array.from(new Set((template.content.match(/{website\d+}/g) || []).map(m => m.replace(/[{}]/g, ''))));
            if (usedWebVars.length === 0) return null;

            const linkCategories = Array.from(new Set(links.map(l => l.category).filter(Boolean)));
            const allGroupedLinks = links.reduce<Record<string, StoredLink[]>>((acc, link) => {
              const cat = link.category || "Umum";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(link);
              return acc;
            }, {});
            const allSelectedWebs = Object.values(selectedWebs).filter(Boolean);

            return (
              <div className="pt-2 border-t border-[#E6DFD5] space-y-3">
                <h3 className="text-[10px] font-black text-[#5C4B40] uppercase tracking-wider">Pengaturan Tautan</h3>
                {usedWebVars.map(w => {
                  const filterCategory = selectedWebCategories[w] || "";
                  const groupedLinks = filterCategory ? { [filterCategory]: allGroupedLinks[filterCategory] || [] } : allGroupedLinks;
                  return (
                    <div key={w} className="p-3 bg-white border border-[#E6DFD5] rounded-xl flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-[#5C4B40]">
                        Pilih Tautan <span className="text-amber-700">{w.toUpperCase()}</span>
                      </label>
                      {linkCategories.length > 0 && (
                        <select
                          value={filterCategory}
                          onChange={(e) => setSelectedWebCategories({ ...selectedWebCategories, [w]: e.target.value })}
                          className="w-full px-2 py-1.5 border border-[#DCd4c6] rounded-lg text-[10px] focus:outline-none"
                        >
                          <option value="">Semua Kategori</option>
                          {linkCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      )}
                      <select
                        value={selectedWebs[w] || ""}
                        onChange={(e) => setSelectedWebs({ ...selectedWebs, [w]: e.target.value })}
                        className="w-full px-2 py-1.5 border border-[#DCd4c6] rounded-lg text-xs focus:outline-none"
                      >
                        <option value="">-- Pilih {w.toUpperCase()} --</option>
                        {Object.entries(groupedLinks).map(([category, catLinks]) => (
                          <optgroup key={category} label={category}>
                            {catLinks.map(l => {
                              const isUsed = allSelectedWebs.includes(l.url) && selectedWebs[w] !== l.url;
                              return (
                                <option key={l.id} value={l.url} disabled={isUsed}>
                                  {l.title} {isUsed ? "[Sudah]" : ""}
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Bottom action */}
        <div className="p-4 border-t border-[#E6DFD5] bg-[#FDFBF7] space-y-3">

          {/* Anti-Detection Settings */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
            <h3 className="text-[10px] font-black text-purple-800 uppercase tracking-wider flex items-center gap-1">
              🛡️ Pengaman Anti-Deteksi WA
            </h3>

            {/* Delay */}
            <div>
              <label className="block text-[10px] font-bold text-purple-700 mb-1">
                Jeda Antar Pesan (Detik) — + acak tambahan
              </label>
              <input
                type="number"
                min="20"
                max="120"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:border-purple-400"
              />
              <p className="text-[9px] text-purple-500 mt-0.5">Aktual: {delaySeconds}–{delaySeconds * 2}s (acak). Min 30 detik sangat disarankan.</p>
            </div>

            {/* Batch size + break */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-purple-700 mb-1">Pesan/Batch</label>
                <input
                  type="number" min="5" max="100"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-purple-700 mb-1">Istirahat (Menit)</label>
                <input
                  type="number" min="5" max="60"
                  value={batchBreakMinutes}
                  onChange={(e) => setBatchBreakMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[9px] text-purple-500">Setiap {batchSize} pesan, sistem istirahat {batchBreakMinutes} menit otomatis.</p>

            {/* Shuffle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffleContacts}
                onChange={(e) => setShuffleContacts(e.target.checked)}
                className="rounded border-purple-300 text-purple-600"
              />
              <span className="text-[10px] font-bold text-purple-700">Acak urutan kontak (lebih aman)</span>
            </label>
          </div>


          <button
            onClick={startAutoBlast}
            disabled={
              selectedContacts.size === 0 ||
              !selectedTemplateId ||
              (() => {
                const t = templates.find(t => t.id === selectedTemplateId);
                if (!t) return false;
                const webVars = Array.from(new Set((t.content.match(/{website\d+}/g) || []).map(m => m.replace(/[{}]/g, ''))));
                return webVars.some(w => !selectedWebs[w]);
              })()
            }
            className="w-full py-3 bg-[#A07855] text-white font-bold rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 hover:bg-[#8B684A] transition-colors"
          >
            <PlayCircle className="h-5 w-5" />
            Mulai Kirim Otomatis
          </button>
          <div className="text-center text-[10px] text-gray-500 font-semibold">{selectedContacts.size} Kontak Terpilih</div>
        </div>
      </div>
    </div>
  );
}
