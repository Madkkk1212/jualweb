"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Plus, Trash2, Edit, Send, 
  CheckCircle, Loader2, MessageCircle, ArrowLeft, 
  Save, AlertCircle, Clock, CheckSquare, Square
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Interfaces
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  content: string;
  is_active: boolean;
}

interface SendHistory {
  id: string;
  contact_name: string;
  contact_phone: string;
  template_name: string;
  created_at: string;
}

const TEMPLATE_CATEGORIES = [
  "Follow Up", "Penawaran Jasa", "Penawaran Website", "Penawaran Aplikasi",
  "Reminder Pembayaran", "Reminder Meeting", "Ucapan Selamat Pagi",
  "Ucapan Selamat Siang", "Ucapan Selamat Malam", "Broadcast Informasi",
  "Customer Lama", "Customer Baru", "Travel", "Sekolah", "Pemerintahan", "UMKM", "Custom"
];

export default function WhatsAppWorkspace() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  // Auth & Data states
  const [userId, setUserId] = useState<string>("madk");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<SendHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  
  // Template States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState({ id: "", name: "", category: "Custom", content: "" });
  
  // Sending States
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [sendQueue, setSendQueue] = useState<Contact[]>([]);
  const [sentStatus, setSentStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = localStorage.getItem("luma_session");
    if (!session) {
      router.replace(`/${prefix}/login`);
      return;
    }
    setUserId(session);
    loadData(session);
  }, [router, prefix]);

  const loadData = async (user: string) => {
    setIsLoading(true);
    try {
      const [contactsRes, templatesRes, historyRes] = await Promise.all([
        supabase.from("contacts").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_templates").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_send_history").select("*").eq("user_id", user).order("created_at", { ascending: false }).limit(50),
      ]);

      if (contactsRes.data) {
        setContacts(contactsRes.data.map((c: any) => ({
          id: c.id, name: c.name, phone: c.phone,
          email: c.email || "", category: c.category || "Umum",
        })));
      }
      
      if (templatesRes.data) {
        setTemplates(templatesRes.data);
      }
      
      if (historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Supabase load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtering & Categories ---
  const contactCategories = ["Semua", ...Array.from(new Set(contacts.map(c => c.category).filter(Boolean)))];

  const filteredContacts = contacts.filter((c) => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery);
    const matchCat = activeCategory === "Semua" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  // --- Selection Logic ---
  const handleSelectContact = (id: string) => {
    const newSet = new Set(selectedContacts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedContacts(newSet);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  // --- Template CRUD ---
  const handleCreateTemplate = () => {
    setTemplateForm({ id: "", name: "Template Baru", category: "Follow Up", content: "Halo {nama},\n\n..." });
    setIsEditingTemplate(true);
    setSelectedTemplateId(null);
  };

  const handleEditTemplate = (t: Template) => {
    setTemplateForm({ id: t.id, name: t.name, category: t.category, content: t.content });
    setIsEditingTemplate(true);
    setSelectedTemplateId(t.id);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.content) return;
    
    setIsLoading(true);
    const isNew = !templateForm.id;
    const templateData = {
      name: templateForm.name,
      category: templateForm.category,
      content: templateForm.content,
      user_id: userId,
      is_active: true
    };

    if (isNew) {
      const { data, error } = await supabase.from("whatsapp_templates").insert([templateData]).select();
      if (error) {
        alert("Gagal menyimpan template. Pesan error: " + error.message);
      } else if (data) {
        setTemplates([data[0], ...templates]);
        setSelectedTemplateId(data[0].id);
      }
    } else {
      const { data, error } = await supabase.from("whatsapp_templates")
        .update(templateData)
        .eq("id", templateForm.id)
        .select();
      if (error) {
        alert("Gagal update template. Pesan error: " + error.message);
      } else if (data) {
        setTemplates(templates.map(t => t.id === templateForm.id ? data[0] : t));
      }
    }
    
    setIsEditingTemplate(false);
    setIsLoading(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    setTemplates(templates.filter(t => t.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId(null);
    await supabase.from("whatsapp_templates").delete().eq("id", id);
  };

  const insertVariable = (variable: string) => {
    setTemplateForm(prev => ({
      ...prev,
      content: prev.content + `{${variable}}`
    }));
  };

  // --- WA Sending Logic ---
  const getSelectedTemplate = () => templates.find(t => t.id === selectedTemplateId);
  
  const generateMessage = (contact: Contact, templateContent: string) => {
    let msg = templateContent;
    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    msg = msg.replace(/{nama}/g, contact.name);
    msg = msg.replace(/{nomor}/g, contact.phone);
    msg = msg.replace(/{kategori}/g, contact.category || "-");
    msg = msg.replace(/{tanggal}/g, dateStr);
    return encodeURIComponent(msg);
  };

  const handleStartSending = () => {
    if (selectedContacts.size === 0) {
      alert("Pilih minimal 1 kontak");
      return;
    }
    if (!selectedTemplateId) {
      alert("Pilih template pesan terlebih dahulu");
      return;
    }
    
    const queue = contacts.filter(c => selectedContacts.has(c.id));
    setSendQueue(queue);
    setSentStatus({});
    setIsSendingModalOpen(true);
  };

  const handleSendToContact = async (contact: Contact) => {
    const template = getSelectedTemplate();
    if (!template) return;

    // Format phone number
    let phone = contact.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "62" + phone.substring(1);
    
    const text = generateMessage(contact, template.content);
    const waUrl = `https://wa.me/${phone}?text=${text}`;
    
    // Open WA Web in new tab
    window.open(waUrl, "_blank");
    
    // Update local status
    setSentStatus(prev => ({ ...prev, [contact.id]: true }));
    
    // Save history
    const historyData = {
      contact_name: contact.name,
      contact_phone: phone,
      template_name: template.name,
      user_id: userId,
      sent_by: userId
    };
    
    const { data } = await supabase.from("whatsapp_send_history").insert([historyData]).select();
    if (data) {
      setHistory(prev => [data[0], ...prev]);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F4EE] overflow-hidden select-none font-sans relative text-[#4A3E3D]">
      {/* ─── LOADING SCREEN ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FAF6F0] flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#A07855]" />
            <span className="text-[#7A6F6D] text-sm font-semibold">Memuat Data WhatsApp...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR CATEGORIES ─── */}
      <div className="w-[240px] bg-[#FAF6F0] border-r border-[#DCd4c6] flex flex-col h-full flex-shrink-0 z-10 hidden md:flex">
        <div className="p-4 border-b border-[#E6DFD5] flex items-center gap-2">
          <button onClick={() => router.push(`/${prefix}/note`)} className="p-1.5 bg-white rounded-lg border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#4A3E3D] hover:bg-[#F0EAE1] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-[#22C55E]">
            <MessageCircle className="h-5 w-5 fill-current" />
            <span className="font-bold text-[#3C2F2F]">WA Blaster</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest mb-3">Kategori Kontak</h3>
          <div className="space-y-1">
            {contactCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex justify-between items-center ${
                  activeCategory === cat 
                  ? "bg-[#EFEAE2] text-[#5C4B40] border border-[#DCd4c6]" 
                  : "text-[#7A6F6D] hover:bg-[#FDFBF7]"
                }`}
              >
                <span>{cat}</span>
                <span className="text-xs text-[#A89F95]">
                  {cat === "Semua" ? contacts.length : contacts.filter(c => c.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold text-[#A89F95] uppercase tracking-widest mb-3">Riwayat Terakhir</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="text-[11px] p-2 bg-white border border-[#E6DFD5] rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#5C4B40] truncate max-w-[120px]">{h.contact_name}</span>
                    <span className="text-[#A89F95]">{new Date(h.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <div className="text-[#7A6F6D] truncate">{h.template_name}</div>
                </div>
              ))}
              {history.length === 0 && <div className="text-xs text-[#A89F95] italic">Belum ada riwayat</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT (CONTACTS) ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border-r border-[#E6DFD5] z-10">
        <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7] flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#3C2F2F]">Pilih Kontak</h1>
            <p className="text-sm text-[#7A6F6D]">Pilih kontak yang ingin Anda kirimi pesan WhatsApp.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#A89F95]" />
              <input
                type="text"
                placeholder="Cari nama atau nomor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A07855]/20 focus:border-[#A07855]"
              />
            </div>
            <div className="px-3 py-2 bg-[#F0EAE1] rounded-xl border border-[#DCd4c6] text-sm font-semibold text-[#5C4B40]">
              {selectedContacts.size} Terpilih
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#FDFBF7]/30">
          {/* Header row */}
          <div className="flex items-center px-4 py-2 mb-2">
            <button 
              onClick={handleSelectAll}
              className="mr-3 text-[#A89F95] hover:text-[#5C4B40]"
            >
              {selectedContacts.size === filteredContacts.length && filteredContacts.length > 0 ? (
                <CheckSquare className="h-5 w-5 text-[#A07855]" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1 grid grid-cols-12 gap-4 text-xs font-bold text-[#A89F95] uppercase tracking-wider">
              <div className="col-span-5">Nama Kontak</div>
              <div className="col-span-4">Nomor WA</div>
              <div className="col-span-3">Kategori</div>
            </div>
          </div>

          <div className="space-y-1.5">
            {filteredContacts.map(contact => {
              const isSelected = selectedContacts.has(contact.id);
              return (
                <div 
                  key={contact.id}
                  onClick={() => handleSelectContact(contact.id)}
                  className={`flex items-center px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected 
                    ? "bg-[#F0EAE1] border-[#C8BEAE]" 
                    : "bg-white border-[#E6DFD5] hover:border-[#C8BEAE]"
                  }`}
                >
                  <div className="mr-3">
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-[#A07855]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#C0B8AD]" />
                    )}
                  </div>
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 font-semibold text-[#3C2F2F] truncate">{contact.name}</div>
                    <div className="col-span-4 text-sm text-[#7A6F6D]">{contact.phone}</div>
                    <div className="col-span-3">
                      <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-bold border border-stone-200 truncate max-w-full">
                        {contact.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredContacts.length === 0 && (
              <div className="text-center py-10 text-[#A89F95] flex flex-col items-center">
                <Users className="h-10 w-10 mb-2 opacity-50" />
                <p>Tidak ada kontak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL (TEMPLATES & SEND) ─── */}
      <div className="w-[380px] bg-[#FAF6F0] flex flex-col h-full flex-shrink-0 z-20">
        <div className="p-4 border-b border-[#E6DFD5] bg-white">
          <h2 className="font-bold text-lg text-[#3C2F2F] flex items-center gap-2">
            <Send className="h-5 w-5 text-[#22C55E]" />
            Pengaturan Pesan
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          
          {!isEditingTemplate ? (
            <>
              {/* Template Selection Mode */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-[#5C4B40]">Pilih Template</label>
                  <button 
                    onClick={handleCreateTemplate}
                    className="text-xs text-[#A07855] font-semibold flex items-center hover:underline"
                  >
                    <Plus className="h-3 w-3 mr-0.5" /> Buat Baru
                  </button>
                </div>
                
                <div className="space-y-2">
                  {templates.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTemplateId === t.id 
                        ? "bg-white border-[#A07855] shadow-[0_0_0_1px_#A07855]" 
                        : "bg-white/50 border-[#DCd4c6] hover:bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-[#3C2F2F]">{t.name}</span>
                        {selectedTemplateId === t.id && (
                          <div className="flex gap-1">
                            <button onClick={(e) => { e.stopPropagation(); handleEditTemplate(t); }} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit className="h-3 w-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A89F95] mb-2">{t.category}</div>
                      <p className="text-xs text-[#7A6F6D] line-clamp-2 leading-relaxed">
                        {t.content}
                      </p>
                    </div>
                  ))}
                  {templates.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-[#DCd4c6] rounded-xl text-sm text-[#A89F95]">
                      Belum ada template. Buat template pertama Anda.
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              {selectedTemplateId && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#5C4B40] mb-2">Preview Pesan</h3>
                  <div className="bg-[#E2F7CB] p-3 rounded-b-xl rounded-tr-xl border border-[#CDECA9] text-sm text-[#3C2F2F] whitespace-pre-wrap leading-relaxed relative">
                    {/* Tail for speech bubble */}
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[12px] border-r-[#E2F7CB] border-b-[12px] border-b-transparent"></div>
                    
                    {(() => {
                      const t = getSelectedTemplate();
                      const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id)) || { name: "Budi", phone: "08123456789", category: "Customer" } as Contact;
                      if (!t) return "";
                      let msg = t.content;
                      const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                      msg = msg.replace(/{nama}/g, dummyContact.name);
                      msg = msg.replace(/{nomor}/g, dummyContact.phone);
                      msg = msg.replace(/{kategori}/g, dummyContact.category || "-");
                      msg = msg.replace(/{tanggal}/g, dateStr);
                      return msg;
                    })()}
                  </div>
                  {selectedContacts.size > 1 && (
                    <p className="text-[10px] text-stone-500 mt-2 italic text-right">
                      *Preview menggunakan kontak pertama yang dipilih
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Template Editor Mode */
            <div className="bg-white p-4 rounded-xl border border-[#DCd4c6] shadow-sm">
              <h3 className="font-bold text-[#3C2F2F] mb-4 border-b border-[#E6DFD5] pb-2 flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#A07855]" /> 
                {templateForm.id ? "Edit Template" : "Template Baru"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C4B40] mb-1">Nama Template</label>
                  <input 
                    type="text" 
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-lg text-sm focus:outline-none focus:border-[#A07855]"
                    placeholder="Misal: Promo Akhir Tahun"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#5C4B40] mb-1">Kategori</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-lg text-sm focus:outline-none focus:border-[#A07855]"
                  >
                    {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold text-[#5C4B40]">Isi Pesan</label>
                    <div className="text-[10px] text-[#A89F95]">Gunakan variabel di bawah:</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {["nama", "nomor", "kategori", "tanggal"].map(v => (
                      <button 
                        key={v}
                        onClick={() => insertVariable(v)}
                        className="px-2 py-1 bg-[#F0EAE1] hover:bg-[#E6DFD5] rounded text-[10px] font-mono text-[#5C4B40] border border-[#DCd4c6]"
                      >
                        {`{${v}}`}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-lg text-sm focus:outline-none focus:border-[#A07855] min-h-[150px] resize-y"
                    placeholder="Ketik pesan Anda di sini..."
                  />
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-[#E6DFD5]">
                  <button 
                    onClick={() => setIsEditingTemplate(false)}
                    className="flex-1 py-2 text-sm font-semibold text-[#7A6F6D] bg-[#FDFBF7] border border-[#DCd4c6] rounded-lg hover:bg-stone-100"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSaveTemplate}
                    disabled={!templateForm.name || !templateForm.content}
                    className="flex-1 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#A07855] to-[#8B5A2B] rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" /> Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Fixed at Bottom Right Panel */}
        <div className="p-4 border-t border-[#E6DFD5] bg-white">
          <button
            onClick={handleStartSending}
            disabled={selectedContacts.size === 0 || !selectedTemplateId || isEditingTemplate}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            <span>Mulai Kirim ({selectedContacts.size} Kontak)</span>
          </button>
        </div>
      </div>

      {/* ─── SENDING QUEUE MODAL ─── */}
      <AnimatePresence>
        {isSendingModalOpen && (
          <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-[#E6DFD5] flex justify-between items-center bg-[#FDFBF7]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Send className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3C2F2F]">Proses Pengiriman WA</h2>
                    <p className="text-xs text-[#7A6F6D]">
                      Template: <span className="font-semibold">{getSelectedTemplate()?.name}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSendingModalOpen(false)}
                  className="p-2 text-[#A89F95] hover:text-[#5C4B40] hover:bg-[#F0EAE1] rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" /> Tutup
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto bg-[#FAF6F0]">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>
                    <strong>Cara Kerja:</strong> Klik tombol "Kirim WA" pada setiap baris. Sistem akan membuka WhatsApp Web/Desktop. Pastikan Anda menekan tombol kirim di WhatsApp, lalu kembali ke layar ini untuk mengirim ke kontak berikutnya.
                  </p>
                </div>

                <div className="space-y-2">
                  {sendQueue.map((contact, index) => {
                    const isSent = sentStatus[contact.id];
                    return (
                      <div key={contact.id} className={`flex items-center p-3 rounded-xl border ${isSent ? "bg-green-50 border-green-200" : "bg-white border-[#DCd4c6]"}`}>
                        <div className="w-8 font-bold text-[#A89F95]">{index + 1}.</div>
                        <div className="flex-1">
                          <div className="font-bold text-[#3C2F2F]">{contact.name}</div>
                          <div className="text-sm text-[#7A6F6D]">{contact.phone}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isSent && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" /> Terkirim
                            </span>
                          )}
                          <button
                            onClick={() => handleSendToContact(contact)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                              isSent 
                              ? "bg-white border border-[#DCd4c6] text-[#7A6F6D] hover:bg-stone-50" 
                              : "bg-[#22C55E] text-white hover:bg-[#16A34A] shadow-md shadow-green-500/20"
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            {isSent ? "Kirim Ulang" : "Kirim WA"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-4 border-t border-[#E6DFD5] bg-white flex justify-between items-center">
                <div className="text-sm font-bold text-[#5C4B40]">
                  Progres: {Object.keys(sentStatus).length} / {sendQueue.length} Selesai
                </div>
                <button 
                  onClick={() => setIsSendingModalOpen(false)}
                  className="px-6 py-2.5 bg-[#F0EAE1] hover:bg-[#E6DFD5] text-[#5C4B40] font-bold rounded-xl border border-[#DCd4c6] transition-colors"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
