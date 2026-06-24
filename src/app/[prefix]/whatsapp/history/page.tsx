"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Loader2, Calendar, 
  MessageCircle, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SendHistory {
  id: string;
  contact_name: string;
  contact_phone: string;
  template_name: string;
  created_at: string;
}

export default function WhatsAppHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  const [userId, setUserId] = useState<string>("");
  const [history, setHistory] = useState<SendHistory[]>([]);
  const [contacts, setContacts] = useState<{name: string, phone: string, category: string, ig: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
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
  }, [router, prefix]);

  const loadData = async (user: string) => {
    setIsLoading(true);
    try {
      const [historyRes, contactsRes, businessesRes] = await Promise.all([
        supabase.from("whatsapp_send_history").select("*").eq("user_id", user).order("created_at", { ascending: false }).limit(5000),
        supabase.from("contacts").select("name, phone, category, ig").eq("user_id", user),
        supabase.from("businesses").select("name, phone, category, instagram").eq("user_id", user).not("phone", "is", null)
      ]);

      const fetchedContacts = contactsRes.data || [];
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const fetchedBusinesses = (businessesRes.data || []).map((b: any) => ({
        name: b.name,
        phone: b.phone,
        category: b.category || "Bisnis",
        ig: b.instagram || ""
      }));
      /* eslint-enable @typescript-eslint/no-explicit-any */

      setContacts([...fetchedContacts, ...fetchedBusinesses]);

      if (historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Supabase load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (history.length === 0) return;
    if (!confirm("Apakah Anda yakin ingin menghapus SEMUA riwayat pengiriman? Tindakan ini tidak dapat dibatalkan.")) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("whatsapp_send_history")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      setHistory([]);
      alert("Seluruh riwayat berhasil dihapus.");
    } catch (err) {
      alert("Gagal menghapus riwayat.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Build lookup maps for performance
  const phoneToCategoryMap = new Map<string, string>();
  const nameToCategoryMap = new Map<string, string>();
  contacts.forEach(c => {
      let cPhone = c.phone.replace(/\D/g, "");
      if (cPhone.startsWith("0")) cPhone = "62" + cPhone.substring(1);
      phoneToCategoryMap.set(cPhone, c.category || "Umum");
      if (c.ig) phoneToCategoryMap.set("IG:" + c.ig, c.category || "Umum");
      nameToCategoryMap.set(c.name, c.category || "Umum");
  });

  const getCategory = (h: SendHistory) => {
      if (h.contact_phone.startsWith("IG:")) {
          const igMatch = phoneToCategoryMap.get(h.contact_phone);
          if (igMatch) return igMatch;
          return nameToCategoryMap.get(h.contact_name) || "Umum";
      } else {
          const phoneToMatch = h.contact_phone.replace(/\D/g, "");
          return phoneToCategoryMap.get(phoneToMatch) || "Umum";
      }
  };

  const filteredHistory = history.filter(h => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      h.contact_name?.toLowerCase().includes(q) ||
      h.contact_phone?.toLowerCase().includes(q) ||
      h.template_name?.toLowerCase().includes(q);
      
    const cat = getCategory(h);
    const matchesCat = categoryFilter === "Semua" || cat === categoryFilter;
    
    return matchesSearch && matchesCat;
  });
  
  const allCategories = ["Semua", ...Array.from(new Set(contacts.map(c => c.category || "Umum")))];

  return (
    <div className="flex flex-col h-screen bg-[#F8F4EE] font-sans text-[#4A3E3D]">
      {/* ─── LOADING SCREEN ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FAF6F0] flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#A07855]" />
            <span className="text-[#7A6F6D] text-sm font-semibold">Memuat Riwayat...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="p-4 md:p-6 bg-white border-b border-[#E6DFD5] flex flex-col gap-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push(`/${prefix}/whatsapp`)} 
              className="p-2 bg-[#F0EAE1] hover:bg-[#E6DFD5] rounded-xl border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#5C4B40] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#3C2F2F] flex items-center gap-2">
                <Calendar className="h-6 w-6 text-[#A07855]" /> Riwayat Pengiriman
              </h1>
              <p className="text-sm text-[#7A6F6D] hidden md:block">Log aktivitas pengiriman pesan WhatsApp dan Instagram.</p>
            </div>
          </div>
          
          <button 
            onClick={handleClearHistory}
            disabled={isDeleting || history.length === 0}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="hidden sm:inline">Bersihkan Riwayat</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full max-w-xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A89F95]" />
            <input
              type="text"
              placeholder="Cari nama, nomor, atau template pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A07855]/20 focus:border-[#A07855] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 sm:flex-none text-xs bg-white border border-[#DCd4c6] rounded-xl py-2.5 px-3 text-[#5C4B40] font-semibold focus:outline-none focus:ring-1 focus:ring-[#A07855]"
            >
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="px-4 py-2.5 bg-white rounded-xl border border-[#DCd4c6] text-sm font-semibold text-[#5C4B40] whitespace-nowrap shadow-sm">
              Total: {filteredHistory.length}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE / LIST */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-[#E6DFD5] shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#FDFBF7] border-b border-[#E6DFD5] text-xs font-bold text-[#A89F95] uppercase tracking-wider">
            <div className="col-span-2">Tanggal & Waktu</div>
            <div className="col-span-3">Penerima</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Nomor Tujuan</div>
            <div className="col-span-3">Template Pesan</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#E6DFD5]">
            {filteredHistory.map((h) => {
              const date = new Date(h.created_at);
              const isIG = h.contact_phone.includes("IG:") || h.template_name.includes("[IG]");
              const cat = getCategory(h);
              
              return (
                <div key={h.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 hover:bg-[#FAF6F0] transition-colors items-center">
                  
                  {/* Tanggal & Waktu */}
                  <div className="col-span-1 md:col-span-2 flex flex-row md:flex-col justify-between md:justify-start">
                    <span className="md:hidden text-xs font-bold text-[#A89F95] uppercase">Waktu</span>
                    <div>
                      <div className="font-semibold text-[#5C4B40]">
                        {date.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-[#7A6F6D]">
                        {date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </div>
                  </div>

                  {/* Penerima */}
                  <div className="col-span-1 md:col-span-3 flex flex-row md:flex-col justify-between md:justify-start">
                    <span className="md:hidden text-xs font-bold text-[#A89F95] uppercase">Penerima</span>
                    <div className="font-bold text-[#3C2F2F] text-right md:text-left truncate" title={h.contact_name}>{h.contact_name}</div>
                  </div>

                  {/* Kategori */}
                  <div className="col-span-1 md:col-span-2 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start">
                    <span className="md:hidden text-xs font-bold text-[#A89F95] uppercase">Kategori</span>
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold border border-stone-200 truncate max-w-full">
                      {cat}
                    </span>
                  </div>

                  {/* Nomor Tujuan */}
                  <div className="col-span-1 md:col-span-2 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-dashed border-[#E6DFD5]">
                    <span className="md:hidden text-xs font-bold text-[#A89F95] uppercase">Tujuan</span>
                    <div className="flex items-center gap-1.5 justify-end md:justify-start">
                      {isIG ? (
                        <span className="px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-200 rounded text-[10px] font-bold">IG</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[10px] font-bold">WA</span>
                      )}
                      <span className="text-[11px] text-[#7A6F6D] font-mono truncate max-w-[100px]" title={h.contact_phone}>{h.contact_phone}</span>
                    </div>
                  </div>

                  {/* Template Pesan */}
                  <div className="col-span-1 md:col-span-3 flex flex-row md:flex-col justify-between md:justify-start mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-dashed border-[#E6DFD5]">
                    <span className="md:hidden text-xs font-bold text-[#A89F95] uppercase shrink-0 mr-4">Template</span>
                    <div className="flex items-center gap-2 max-w-full overflow-hidden justify-end md:justify-start">
                      <MessageCircle className="h-4 w-4 text-[#A07855] shrink-0 hidden md:block" />
                      <span className="text-sm font-semibold text-[#5C4B40] truncate" title={h.template_name}>
                        {h.template_name}
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredHistory.length === 0 && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#F0EAE1] rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-[#A89F95]" />
                </div>
                <h3 className="text-lg font-bold text-[#3C2F2F] mb-1">Tidak Ada Riwayat</h3>
                <p className="text-sm text-[#7A6F6D] max-w-md">
                  {searchQuery ? "Tidak ada hasil yang cocok dengan pencarian Anda." : "Belum ada pesan yang pernah dikirimkan melalui WA Blaster."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
