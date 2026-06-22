"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, Plus, Trash2, Edit, Send, 
  CheckCircle, Loader2, MessageCircle, ArrowLeft, 
  Save, AlertCircle, CheckSquare, Square, X, Instagram,
  ExternalLink, Maximize2, Building2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Interfaces
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  ig?: string;
  website?: string;
}

interface StoredLink {
  id: string;
  title: string;
  url: string;
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auth & Data states
  const [userId, setUserId] = useState<string>("madk");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [links, setLinks] = useState<StoredLink[]>([]);
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
  const [selectedWebs, setSelectedWebs] = useState<Record<string, string>>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [igTutorialContact, setIgTutorialContact] = useState<Contact | null>(null);
  const [selectedWebCategories, setSelectedWebCategories] = useState<Record<string, string>>({});
  const [previewPlatform, setPreviewPlatform] = useState<"wa" | "ig">("wa");
  const [isWebSettingsModalOpen, setIsWebSettingsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ id: "", name: "", phone: "", ig: "", category: "Umum", website: "" });
  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  
  const [dbContactCategories, setDbContactCategories] = useState<string[]>(["Umum", "Travel", "Jual Buku", "Klien", "Supplier", "Teman", "Keluarga"]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = localStorage.getItem("luma_session");
    if (!session) {
      router.replace(`/workspace/login`);
      return;
    }
    
    if (prefix !== session) {
      router.replace(`/${session}/whatsapp`);
      return;
    }
    setUserId(session);
    loadData(session);
  }, [router, prefix]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadData = async (user: string) => {
    setIsLoading(true);
    try {
      const [contactsRes, linksRes, templatesRes, historyRes, businessesRes, catsRes] = await Promise.all([
        supabase.from("contacts").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("links").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_templates").select("*").eq("user_id", user).order("created_at", { ascending: false }),
        supabase.from("whatsapp_send_history").select("*").eq("user_id", user).order("created_at", { ascending: false }).limit(50),
        supabase.from("businesses").select("*").eq("user_id", user).not("phone", "is", null).order("created_at", { ascending: false }),
        supabase.from("user_categories").select("*").eq("user_id", user).eq("type", "contacts")
      ]);

      const fetchedContacts = contactsRes.data ? (contactsRes.data as {
        id: string;
        name: string;
        phone: string;
        email?: string | null;
        category?: string | null;
        ig?: string | null;
        website?: string | null;
      }[]).map((c) => ({
        id: c.id, name: c.name, phone: c.phone,
        email: c.email || "", category: c.category || "Umum",
        ig: c.ig || "",
        website: c.website || "",
      })) : [];

      const fetchedBusinesses = businessesRes.data ? (businessesRes.data as {
        id: string;
        name: string;
        phone: string | null;
        contact_name?: string | null;
        category?: string | null;
        instagram?: string | null;
        website?: string | null;
      }[])
        .filter((b) => b.phone && b.phone !== "—" && b.phone !== "-")
        .map((b) => ({
          id: `biz-${b.id}`,
          name: b.name,
          phone: b.phone as string,
          email: b.contact_name || "",
          category: b.category || "Bisnis",
          ig: b.instagram || "",
          website: b.website || "",
        })) : [];

      setContacts([...fetchedContacts, ...fetchedBusinesses]);
      
      if (linksRes.data) {
        setLinks(linksRes.data);
      }
      
      if (templatesRes.data) {
        setTemplates(templatesRes.data);
      }
      
      if (historyRes.data) {
        setHistory(historyRes.data);
      }

      if (catsRes.data && catsRes.data.length > 0) {
        const catData = catsRes.data[0];
        if (catData.categories?.length) {
          setDbContactCategories(catData.categories);
        }
      }
    } catch (err) {
      console.error("Supabase load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Filtering & Categories ---
  const contactCategories = ["Semua", ...Array.from(new Set(contacts.map(c => c.category).filter(Boolean)))];

  const allAvailableCategories = Array.from(new Set([
    ...dbContactCategories,
    ...contacts.map(c => c.category).filter(Boolean)
  ])).filter(cat => cat !== "Semua" && cat !== "Bisnis" && cat !== "Umum").sort();
  const categoriesList = ["Umum", "Bisnis", ...allAvailableCategories];

  const filteredContacts = contacts.filter((c) => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery);
    const matchCat = activeCategory === "Semua" || c.category === activeCategory;
    
    let matchWeb = true;
    if (websiteFilter === "has_web") {
      matchWeb = !!c.website && c.website.trim() !== "" && c.website.trim() !== "—" && c.website.trim() !== "-";
    } else if (websiteFilter === "no_web") {
      matchWeb = !c.website || c.website.trim() === "" || c.website.trim() === "—" || c.website.trim() === "-";
    }
    
    return matchSearch && matchCat && matchWeb;
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

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm(`Hapus kontak "${contact.name}" dari database?`)) return;
    
    setIsLoading(true);
    const isBiz = contact.id.startsWith("biz-");
    const cleanId = isBiz ? contact.id.replace("biz-", "") : contact.id;
    
    let error;
    if (isBiz) {
      const { error: err } = await supabase.from("businesses")
        .delete()
        .eq("id", cleanId);
      error = err;
    } else {
      const { error: err } = await supabase.from("contacts")
        .delete()
        .eq("id", cleanId);
      error = err;
    }

    if (error) {
      alert("Gagal menghapus kontak: " + error.message);
    } else {
      setContacts(contacts.filter(c => c.id !== contact.id));
      if (selectedContacts.has(contact.id)) {
        const newSet = new Set(selectedContacts);
        newSet.delete(contact.id);
        setSelectedContacts(newSet);
      }
    }
    setIsLoading(false);
  };

  const handleBulkDeleteContacts = async () => {
    const count = selectedContacts.size;
    if (count === 0) return;
    if (!confirm(`Hapus ${count} kontak terpilih secara permanen dari database?`)) return;

    setIsLoading(true);
    try {
      const selectedIds = Array.from(selectedContacts);
      const bizIds = selectedIds.filter(id => id.startsWith("biz-")).map(id => id.replace("biz-", ""));
      const normalIds = selectedIds.filter(id => !id.startsWith("biz-"));

      const deletePromises = [];
      if (bizIds.length > 0) {
        deletePromises.push(supabase.from("businesses").delete().in("id", bizIds));
      }
      if (normalIds.length > 0) {
        deletePromises.push(supabase.from("contacts").delete().in("id", normalIds));
      }

      const results = await Promise.all(deletePromises);
      const firstError = results.find(r => r.error);
      if (firstError) {
        throw new Error(firstError.error?.message);
      }

      setContacts(contacts.filter(c => !selectedContacts.has(c.id)));
      setSelectedContacts(new Set());
      alert(`Berhasil menghapus ${count} kontak.`);
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus kontak: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditContact = (c: Contact) => {
    setContactForm({ id: c.id, name: c.name, phone: c.phone, ig: c.ig || "", category: c.category || "Umum", website: c.website || "" });
    setIsEditingContact(true);
  };

  const handleSaveContact = async () => {
    if (!contactForm.name || !contactForm.phone) return;
    
    setIsLoading(true);
    const isBiz = contactForm.id.startsWith("biz-");
    const cleanId = isBiz ? contactForm.id.replace("biz-", "") : contactForm.id;
    
    let error;
    if (isBiz) {
      const { error: err } = await supabase.from("businesses")
        .update({
          name: contactForm.name,
          phone: contactForm.phone,
          instagram: contactForm.ig || null,
          category: contactForm.category,
          website: contactForm.website || null
        })
        .eq("id", cleanId);
      error = err;
    } else {
      const { error: err } = await supabase.from("contacts")
        .update({
          name: contactForm.name,
          phone: contactForm.phone,
          ig: contactForm.ig,
          category: contactForm.category,
          website: contactForm.website
        })
        .eq("id", cleanId);
      error = err;
    }

    if (error) {
      alert("Gagal memperbarui kontak: " + error.message);
    } else {
      setContacts(contacts.map(c => c.id === contactForm.id ? {
        ...c,
        name: contactForm.name,
        phone: contactForm.phone,
        ig: contactForm.ig,
        category: contactForm.category,
        website: contactForm.website
      } : c));
      setIsEditingContact(false);
    }
    setIsLoading(false);
  };

  const insertVariable = (variable: string) => {
    let varToInsert = `{${variable}}`;
    
    setTemplateForm(prev => {
      if (variable === "website") {
        const matches = prev.content.match(/{website(\d+)}/g);
        let nextNum = 1;
        if (matches) {
          const nums = matches.map(m => parseInt(m.replace(/\D/g, ''), 10));
          nextNum = Math.max(...nums) + 1;
        }
        varToInsert = `{website${nextNum}}`;
      }

      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = prev.content;
        const newContent = text.substring(0, start) + varToInsert + text.substring(end);
        
        // Focus the textarea and set the cursor position after the inserted variable after render
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + varToInsert.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);

        return {
          ...prev,
          content: newContent
        };
      }
      
      return {
        ...prev,
        content: prev.content + varToInsert
      };
    });
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
    
    // Replace {instagram}
    let igText = "-";
    if (contact.ig && contact.ig.trim() !== "") {
      const igInput = contact.ig.trim();
      if (igInput.startsWith("http://") || igInput.startsWith("https://")) {
        igText = igInput; // Use URL directly in text
      } else {
        igText = igInput.startsWith("@") ? igInput : `@${igInput}`;
      }
    }
    msg = msg.replace(/{instagram}/g, igText);
    
    // Replace {websiteX} dynamically
    const webMatches = msg.match(/{website\d+}/g) || [];
    const uniqueWebs = Array.from(new Set(webMatches));
    uniqueWebs.forEach(w => {
      const wKey = w.replace(/[{}]/g, ''); // e.g. "website1"
      msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[Pilih ${wKey.toUpperCase()} di Setting]`);
    });

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
    setIsSettingsOpen(false);
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

  const handleSendToContactIG = async (contact: Contact) => {
    const template = getSelectedTemplate();
    if (!template) return;

    // Compile message text & copy to clipboard
    const encodedText = generateMessage(contact, template.content);
    const text = decodeURIComponent(encodedText);
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Failed to copy automatically", e);
    }

    setIgTutorialContact(contact);
  };

  const handleConfirmSendIG = async (contact: Contact) => {
    // Parse IG Input (URL or Username)
    let igUrl = "";
    const igInput = contact.ig?.trim() || "";
    let cleanUsername = igInput;
    
    if (igInput.startsWith("http://") || igInput.startsWith("https://")) {
      igUrl = igInput;
      try {
        const parts = igInput.split('/');
        const lastPart = parts.filter(Boolean).pop();
        cleanUsername = lastPart ? lastPart.split('?')[0] : igInput;
        if (cleanUsername.startsWith('@')) cleanUsername = cleanUsername.substring(1);
      } catch {
        cleanUsername = igInput;
      }
    } else {
      if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.substring(1);
      }
      igUrl = cleanUsername ? `https://www.instagram.com/${cleanUsername}` : `https://www.instagram.com/direct/new/`;
    }
    
    window.open(igUrl, "_blank");
    
    // Update local status
    setSentStatus(prev => ({ ...prev, [contact.id]: true }));
    
    const template = getSelectedTemplate();
    if (template) {
      // Save history
      const historyData = {
        contact_name: contact.name,
        contact_phone: `IG: ${cleanUsername || "Manual"}`,
        template_name: `[IG] ${template.name}`,
        user_id: userId,
        sent_by: userId
      };
      
      const { data } = await supabase.from("whatsapp_send_history").insert([historyData]).select();
      if (data) {
        setHistory(prev => [data[0], ...prev]);
      }
    }
    
    setIgTutorialContact(null);
  };

  const renderRightPanel = (isPopup = false) => {
    const template = getSelectedTemplate();
    const matches = template ? template.content.match(/{website\d+}/g) || [] : [];
    const usedWebVars = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
    const configuredCount = usedWebVars.filter(w => selectedWebs[w]).length;
    const isAllConfigured = configuredCount === usedWebVars.length;

    return (
      <div className="flex flex-col h-full w-full bg-[#FAF6F0]">
        {/* Header */}
        <div className="p-4 border-b border-[#E6DFD5] bg-white flex justify-between items-center shrink-0">
          <h2 className="font-bold text-lg text-[#3C2F2F] flex items-center gap-2 font-sans">
            <Send className="h-5 w-5 text-[#22C55E]" />
            Pengaturan Pesan
          </h2>
          {isPopup ? (
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="p-1.5 hover:bg-[#EFEAE2] rounded-xl text-[#A89F95] hover:text-[#5C4B40] transition-colors"
              title="Tutup Pengaturan"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 hover:bg-[#EFEAE2] rounded-xl text-[#A89F95] hover:text-[#5C4B40] transition-colors"
              title="Buka Popup"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div 
          className="flex-1 overflow-y-auto p-4 pb-28 scroll-smooth overscroll-contain"
          style={{ 
            WebkitOverflowScrolling: "touch", 
            willChange: "transform" 
          }}
        >
          {/* Template Selection Mode */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-bold text-[#5C4B40] font-sans">Pilih Template</label>
              <button 
                onClick={handleCreateTemplate}
                className="text-xs text-[#A07855] font-semibold flex items-center hover:underline font-sans"
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
                    <span className="font-bold text-sm text-[#3C2F2F] font-sans">{t.name}</span>
                    {selectedTemplateId === t.id && (
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEditTemplate(t); }} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#A89F95] mb-2 font-sans">{t.category}</div>
                  <p className="text-xs text-[#7A6F6D] line-clamp-2 leading-relaxed font-sans">
                    {t.content}
                  </p>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center p-4 border border-dashed border-[#DCd4c6] rounded-xl text-sm text-[#A89F95] font-sans">
                  Belum ada template. Buat template pertama Anda.
                </div>
              )}
            </div>
          </div>

          {/* Preview Box */}
          {selectedTemplateId && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#5C4B40] mb-2 flex justify-between items-center bg-transparent font-sans">
                <span>Preview Pesan</span>
                <button 
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100 transition-colors border border-blue-200 font-sans"
                >
                  <ExternalLink className="h-3 w-3" /> Mockup HP Penuh
                </button>
              </h3>

              {/* Platform Switcher */}
              <div className="flex gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DCd4c6] mb-3">
                <button
                  onClick={() => setPreviewPlatform("wa")}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all font-sans ${
                    previewPlatform === "wa"
                      ? "bg-[#22C55E] text-white shadow-sm"
                      : "text-[#7A6F6D] hover:bg-white"
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WA
                </button>
                <button
                  onClick={() => setPreviewPlatform("ig")}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all font-sans ${
                    previewPlatform === "ig"
                      ? "bg-gradient-to-r from-[#fd5949] to-[#d6249f] text-white shadow-sm"
                      : "text-[#7A6F6D] hover:bg-white"
                  }`}
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </button>
              </div>

              {previewPlatform === "wa" ? (
                /* WA Speech Bubble */
                <div 
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="bg-[#E2F7CB] p-3 rounded-b-xl rounded-tr-xl border border-[#CDECA9] text-sm text-[#3C2F2F] whitespace-pre-wrap leading-relaxed relative shadow-sm cursor-pointer hover:shadow-md transition-shadow animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Tail for speech bubble */}
                  <div className="absolute top-0 -left-2 w-0 h-0 border-t-[0px] border-t-transparent border-r-[12px] border-r-[#E2F7CB] border-b-[12px] border-b-transparent"></div>
                  
                  {(() => {
                    const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id)) || { name: "Budi", phone: "08123456789", category: "Customer", ig: "budidoremi" } as Contact;
                    let msg = template ? template.content : "";
                    const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                    msg = msg.replace(/{nama}/g, dummyContact.name);
                    msg = msg.replace(/{nomor}/g, dummyContact.phone);
                    msg = msg.replace(/{kategori}/g, dummyContact.category || "-");
                    msg = msg.replace(/{tanggal}/g, dateStr);
                    
                    let igText = "-";
                    if (dummyContact.ig && dummyContact.ig.trim() !== "") igText = dummyContact.ig.startsWith("@") ? dummyContact.ig : `@${dummyContact.ig}`;
                    msg = msg.replace(/{instagram}/g, igText);
                    
                    const webMatches = msg.match(/{website\d+}/g) || [];
                    const uniqueWebs = Array.from(new Set(webMatches));
                    uniqueWebs.forEach(w => {
                      const wKey = w.replace(/[{}]/g, '');
                      msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[Pilih ${wKey.toUpperCase()}]`);
                    });
                    
                    return msg;
                  })()}
                  
                  <div className="absolute bottom-1.5 right-2 text-[9px] text-[#8696A0] flex items-center gap-1 font-sans">
                    10:45 <span className="text-[#53bdeb]">✓✓</span>
                  </div>
                </div>
              ) : (
                /* IG Gradient Bubble */
                <div 
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex flex-col items-end cursor-pointer hover:opacity-95 transition-opacity animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="bg-gradient-to-tr from-[#3897f0] via-[#a800e6] to-[#ff217a] p-3 rounded-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-xs text-sm text-white whitespace-pre-wrap leading-relaxed shadow-sm w-full">
                    {(() => {
                      const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id)) || { name: "Budi", phone: "08123456789", category: "Customer", ig: "budidoremi" } as Contact;
                      let msg = template ? template.content : "";
                      const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                      msg = msg.replace(/{nama}/g, dummyContact.name);
                      msg = msg.replace(/{nomor}/g, dummyContact.phone);
                      msg = msg.replace(/{kategori}/g, dummyContact.category || "-");
                      msg = msg.replace(/{tanggal}/g, dateStr);
                      
                      let igText = "-";
                      if (dummyContact.ig && dummyContact.ig.trim() !== "") igText = dummyContact.ig.startsWith("@") ? dummyContact.ig : `@${dummyContact.ig}`;
                      msg = msg.replace(/{instagram}/g, igText);
                      
                      const webMatches = msg.match(/{website\d+}/g) || [];
                      const uniqueWebs = Array.from(new Set(webMatches));
                      uniqueWebs.forEach(w => {
                        const wKey = w.replace(/[{}]/g, '');
                        msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[Pilih ${wKey.toUpperCase()}]`);
                      });
                      
                      return msg;
                    })()}
                  </div>
                  <span className="text-[10px] text-[#A89F95] mt-1 mr-1 font-sans">Seen</span>
                </div>
              )}

              {selectedContacts.size > 1 && (
                <p className="text-[10px] text-stone-500 mt-2 italic text-right font-sans">
                  *Klik untuk melihat mockup HP penuh
                </p>
              )}
            </div>
          )}

          {/* Dynamic website selects config trigger */}
          {template && usedWebVars.length > 0 && (
            <div className="mt-4 p-4 bg-white border border-[#E6DFD5] rounded-2xl flex flex-col gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-[#E6DFD5] pb-2">
                <h4 className="text-[11px] font-bold text-[#5C4B40] uppercase tracking-wider font-sans">Tautan Template</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans ${
                  isAllConfigured ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {configuredCount}/{usedWebVars.length} Terpilih
                </span>
              </div>

              {/* Quick list summary */}
              <div className="space-y-1.5 text-xs text-[#7A6F6D]">
                {usedWebVars.map(w => {
                  const isSelected = !!selectedWebs[w];
                  return (
                    <div key={w} className="flex justify-between items-center bg-[#FAF6F0] p-2 rounded-xl border border-[#E6DFD5]/60">
                      <span className="font-bold text-[#5C4B40] uppercase font-sans">{w}</span>
                      <span>
                        {isSelected ? (
                          <CheckCircle className="h-4 w-4 text-green-600 fill-green-50" />
                        ) : (
                          <span className="text-amber-600 font-semibold flex items-center gap-1 font-sans">
                            Belum Diatur <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setIsWebSettingsModalOpen(true)}
                className="w-full py-2.5 bg-[#FAF6F0] hover:bg-[#EFEAE2] text-[#5C4B40] font-bold text-xs rounded-xl border border-[#DCd4c6] transition-all flex items-center justify-center gap-1.5 font-sans"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Atur Tautan ({usedWebVars.length})</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Button Fixed at Bottom Right Panel */}
        <div className="p-4 border-t border-[#E6DFD5] bg-white shrink-0">
          <button
            onClick={handleStartSending}
            disabled={
              selectedContacts.size === 0 || 
              !selectedTemplateId || 
              isEditingTemplate || 
              (() => {
                if (!template) return false;
                return usedWebVars.some(w => !selectedWebs[w]);
              })()
            }
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white font-bold shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 font-sans"
          >
            <Send className="h-5 w-5" />
            <span>Mulai Kirim ({selectedContacts.size} Kontak)</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#F8F4EE] overflow-hidden font-sans relative text-[#4A3E3D]">
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
      <div className="w-[240px] bg-[#FAF6F0] border-r border-[#DCd4c6] flex-col h-full flex-shrink-0 z-10 hidden lg:flex">
        <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/${prefix}/note`)} className="p-1.5 bg-white rounded-lg border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#4A3E3D] hover:bg-[#F0EAE1] transition-colors" title="Kembali ke Catatan">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 text-[#22C55E]">
              <MessageCircle className="h-4 w-4 fill-current" />
              <span className="font-bold text-[#3C2F2F] text-xs">WA Blaster</span>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/${prefix}/import`)} 
            className="p-1.5 bg-white hover:bg-[#EFEAE2] rounded-lg border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#A07855] transition-colors"
            title="Import Bisnis"
          >
            <Building2 className="h-4 w-4" />
          </button>
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
      <div className="flex-1 flex flex-col min-w-0 bg-white border-b lg:border-b-0 lg:border-r border-[#E6DFD5] z-10">
        <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push(`/${prefix}/note`)} className="lg:hidden p-2 bg-white rounded-xl border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#4A3E3D] hover:bg-[#F0EAE1] transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#3C2F2F]">Pilih Kontak</h1>
                <p className="text-sm text-[#7A6F6D] hidden sm:block">Pilih kontak yang ingin Anda kirimi pesan WhatsApp.</p>
              </div>
            </div>
            <button 
              onClick={() => router.push(`/${prefix}/import`)} 
              className="lg:hidden p-2 bg-white hover:bg-[#EFEAE2] rounded-xl border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#A07855] transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Building2 className="h-4 w-4" />
              <span>Bisnis</span>
            </button>
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
            <select
              value={websiteFilter}
              onChange={(e) => setWebsiteFilter(e.target.value)}
              className="text-xs bg-white border border-[#DCd4c6] rounded-xl py-2 px-3 text-[#5C4B40] font-semibold focus:outline-none focus:ring-1 focus:ring-[#A07855] h-[38px]"
            >
              <option value="all">Semua</option>
              <option value="has_web">Ada Website</option>
              <option value="no_web">Tidak Ada Website</option>
            </select>
            {selectedContacts.size > 0 && (
              <button
                onClick={handleBulkDeleteContacts}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                title="Hapus kontak terpilih secara permanen"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Terpilih</span>
              </button>
            )}
            <div className="px-3 py-2 bg-[#F0EAE1] rounded-xl border border-[#DCd4c6] text-sm font-semibold text-[#5C4B40] whitespace-nowrap">
              {selectedContacts.size} Terpilih
            </div>
          </div>

          {/* Mobile Category Filter */}
          <div className="lg:hidden flex overflow-x-auto pb-1 gap-2 no-scrollbar">
            {contactCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  activeCategory === cat
                    ? "bg-[#5C4B40] text-white border-[#5C4B40]"
                    : "bg-white text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                }`}
              >
                {cat} ({cat === "Semua" ? contacts.length : contacts.filter(c => c.category === cat).length})
              </button>
            ))}
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
              <div className="col-span-4">Nama Kontak</div>
              <div className="col-span-2">Nomor WA</div>
              <div className="col-span-2">Website</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-2 text-right">Aksi</div>
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
                    <div className="col-span-4 font-semibold text-[#3C2F2F] truncate">{contact.name}</div>
                    <div className="col-span-2 text-sm text-[#7A6F6D]">{contact.phone}</div>
                    <div className="col-span-2 truncate">
                      {contact.website ? (
                        <a
                          href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold flex items-center gap-1 hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                          title={contact.website}
                        >
                          {contact.website}
                        </a>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-block px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px] font-bold border border-stone-200 truncate max-w-full">
                        {contact.category}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditContact(contact);
                        }}
                        className="p-1.5 text-amber-600 hover:bg-[#EFEAE2] rounded-lg transition-colors flex items-center justify-center"
                        title="Edit Kontak"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(contact);
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                        title="Hapus Kontak"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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

        {/* Floating Action Bar to open Settings */}
        {selectedContacts.size > 0 && (
          <div className="lg:hidden p-4 border-t border-[#E6DFD5] bg-white flex items-center justify-between z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex flex-col">
              <span className="text-xs text-[#7A6F6D] font-medium font-sans">Kontak Terpilih</span>
              <span className="text-sm font-bold text-[#3C2F2F] font-sans">{selectedContacts.size} Kontak</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-[#A07855] to-[#8B5A2B] text-white font-bold text-xs rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center gap-1.5 font-sans"
            >
              <span>Lanjut ke Pengaturan</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ─── RIGHT PANEL (TEMPLATES & SEND) ─── */}
      <div className="hidden lg:flex lg:w-[380px] h-full flex-shrink-0 z-20 border-l border-[#E6DFD5]">
        {renderRightPanel(false)}
      </div>

      {/* Unified Settings Drawer/Modal Sheet */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[140] bg-black/60 flex items-end lg:items-center justify-center backdrop-blur-xs p-0 lg:p-4">
            <motion.div
              initial={{ 
                y: typeof window !== "undefined" && window.innerWidth >= 1024 ? 20 : "100%",
                opacity: typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : 1,
                scale: typeof window !== "undefined" && window.innerWidth >= 1024 ? 0.95 : 1
              }}
              animate={{ 
                y: 0,
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                y: typeof window !== "undefined" && window.innerWidth >= 1024 ? 20 : "100%",
                opacity: typeof window !== "undefined" && window.innerWidth >= 1024 ? 0 : 1,
                scale: typeof window !== "undefined" && window.innerWidth >= 1024 ? 0.95 : 1
              }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full lg:max-w-lg h-[85vh] lg:h-[80vh] bg-[#FAF6F0] rounded-t-[2.5rem] lg:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border-t lg:border border-[#DCd4c6]"
            >
              {renderRightPanel(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingTemplate(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DFD5] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#3C2F2F]">
                    {templateForm.id ? "Edit Template Pesan" : "Template Pesan Baru"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditingTemplate(false)}
                  className="p-1 hover:bg-[#EFEAE2] rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-[#A89F95]" />
                </button>
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Nama Template</label>
                  <input 
                    type="text" 
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                    placeholder="Misal: Promo Akhir Tahun"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Kategori</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F] bg-white"
                  >
                    {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D]">Isi Pesan WhatsApp</label>
                    <div className="text-[10px] text-[#A89F95]">Variabel (Klik untuk insert):</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {["nama", "nomor", "kategori", "tanggal", "instagram", "website"].map(v => (
                      <button 
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className={`px-2 py-1 hover:bg-[#E6DFD5] rounded-md text-[10px] font-mono border border-[#DCd4c6] shadow-sm transition-colors ${
                          (v === "website" || v === "instagram") ? "bg-[#E2F7CB] text-[#3C2F2F] border-[#CDECA9]" : "bg-[#F0EAE1] text-[#5C4B40]"
                        }`}
                      >
                        {`{${v}}`}
                      </button>
                    ))}
                  </div>
                  <textarea 
                    ref={textareaRef}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] min-h-[160px] resize-y placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                    placeholder="Ketik pesan WhatsApp Anda di sini..."
                  />
                </div>
              </div>
                
              <div className="flex gap-2 pt-4 mt-4 border-t border-[#E6DFD5] shrink-0">
                <button 
                  onClick={() => setIsEditingTemplate(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#5C4B40] bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl hover:bg-[#EFEAE2] transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveTemplate}
                  disabled={!templateForm.name || !templateForm.content}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#A07855] to-[#8B5A2B] rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Simpan Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingContact(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DFD5] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <Edit className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#3C2F2F]">
                    Edit Kontak
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditingContact(false)}
                  className="p-1 hover:bg-[#EFEAE2] rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-[#A89F95]" />
                </button>
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Nama Kontak</label>
                  <input 
                    type="text" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Nomor WhatsApp</label>
                  <input 
                    type="text" 
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Username Instagram</label>
                  <input 
                    type="text" 
                    value={contactForm.ig}
                    onChange={(e) => setContactForm({...contactForm, ig: e.target.value})}
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                    placeholder="Misal: llaysaaz"
                  />
                </div>
                
                <div className="relative" ref={categoryDropdownRef}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Kategori</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={contactForm.category}
                      onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                      placeholder="Pilih atau ketik kategori baru..."
                      className="w-full pl-3 pr-10 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="absolute right-0 top-0 bottom-0 px-3 text-[#A89F95] hover:text-[#5C4B40] transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#DCd4c6] rounded-xl shadow-lg max-h-40 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {categoriesList.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setContactForm({...contactForm, category: cat});
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#5C4B40] hover:bg-[#FAF6F0] hover:text-[#3C2F2F] transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                      <div className="border-t border-[#FAF6F0] my-1"></div>
                      <div className="px-3 py-1 text-[9px] text-[#A89F95] italic">
                        * Anda juga dapat mengetik langsung kategori baru di atas.
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">Website</label>
                  <input 
                    type="text" 
                    value={contactForm.website}
                    onChange={(e) => setContactForm({...contactForm, website: e.target.value})}
                    placeholder="Misal: google.com"
                    className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F] bg-white"
                  />
                </div>
              </div>
                
              <div className="flex gap-2 pt-4 mt-4 border-t border-[#E6DFD5] shrink-0">
                <button 
                  onClick={() => setIsEditingContact(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#5C4B40] bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl hover:bg-[#EFEAE2] transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveContact}
                  disabled={!contactForm.name || !contactForm.phone}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#A07855] to-[#8B5A2B] rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Simpan Kontak
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── PREVIEW MOCKUP MODAL (WA & IG) ─── */}
      <AnimatePresence>
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-[360px] h-[700px] max-h-[85vh] bg-black rounded-[2rem] border-[8px] border-gray-900 shadow-2xl overflow-hidden flex flex-col select-none"
            >
              {/* Floating Platform Switcher inside mockup */}
              <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-20 flex bg-[#1e1e1e]/85 backdrop-blur-md p-1 rounded-full border border-stone-800 w-[180px] shadow-lg">
                <button
                  onClick={() => setPreviewPlatform("wa")}
                  className={`flex-1 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                    previewPlatform === "wa"
                      ? "bg-[#22C55E] text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setPreviewPlatform("ig")}
                  className={`flex-1 py-1 rounded-full text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                    previewPlatform === "ig"
                      ? "bg-gradient-to-r from-[#fd5949] to-[#d6249f] text-white shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Instagram
                </button>
              </div>

              {previewPlatform === "wa" ? (
                /* ─── WHATSAPP CHAT PREVIEW ─── */
                <div className="flex flex-col h-full bg-[#EFEAE2]">
                  {/* WA Header */}
                  <div className="bg-[#008069] text-white px-4 py-3 flex items-center gap-3 shrink-0 shadow-md z-10">
                    <button onClick={() => setIsPreviewModalOpen(false)} className="shrink-0"><ArrowLeft className="h-5 w-5" /></button>
                    <div className="w-9 h-9 rounded-full bg-stone-300 flex items-center justify-center shrink-0 overflow-hidden">
                      <Users className="h-5 w-5 text-stone-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate leading-tight">
                        {filteredContacts.find(c => selectedContacts.has(c.id))?.name || "Budi (Contoh)"}
                      </h3>
                      <p className="text-[11px] text-white/80 truncate">online</p>
                    </div>
                  </div>

                  {/* WA Chat Background */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 flex flex-col relative pt-20"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10H10V10zM30 30h10v10H30V30z' fill='%23000000' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                      backgroundColor: "#EFEAE2"
                    }}
                  >
                    <div className="bg-[#D9FDD3] self-end max-w-[85%] rounded-lg rounded-tr-none p-2.5 pb-5 relative shadow-sm text-[14.5px] leading-[1.3] text-[#111B21] mb-2 mt-4">
                      {/* Tail */}
                      <div className="absolute top-0 -right-[8px] w-[8px] h-[13px]">
                        <svg viewBox="0 0 8 13" width="8" height="13" className="text-[#D9FDD3] fill-current">
                          <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                          <path opacity=".02" d="M5.188 1.25H0v11l6.467-8.625C7.526 2.25 6.958 1.25 5.188 1.25z"></path>
                          <path d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
                        </svg>
                      </div>
                      
                      <div className="whitespace-pre-wrap break-words font-sans">
                        {(() => {
                          const t = getSelectedTemplate();
                          const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id)) || { name: "Budi", phone: "08123456789", category: "Customer", ig: "budidoremi" } as Contact;
                          if (!t) return "";
                          let msg = t.content;
                          const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                          msg = msg.replace(/{nama}/g, dummyContact.name);
                          msg = msg.replace(/{nomor}/g, dummyContact.phone);
                          msg = msg.replace(/{kategori}/g, dummyContact.category || "-");
                          msg = msg.replace(/{tanggal}/g, dateStr);
                          
                          let igText = "-";
                          if (dummyContact.ig && dummyContact.ig.trim() !== "") igText = dummyContact.ig.startsWith("@") ? dummyContact.ig : `@${dummyContact.ig}`;
                          msg = msg.replace(/{instagram}/g, igText);
                          
                          const webMatches = msg.match(/{website\d+}/g) || [];
                          const uniqueWebs = Array.from(new Set(webMatches));
                          uniqueWebs.forEach(w => {
                            const wKey = w.replace(/[{}]/g, '');
                            msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[Pilih ${wKey.toUpperCase()}]`);
                          });
                          
                          return msg;
                        })()}
                      </div>

                      <div className="absolute bottom-1 right-1.5 text-[10px] text-[#667781] flex items-center gap-1 font-sans">
                        10:45 <span className="text-[#53bdeb] ml-0.5">✓✓</span>
                      </div>
                    </div>
                  </div>

                  {/* WA Footer */}
                  <div className="bg-[#F0F2F5] px-2 py-2 flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500"><Plus className="h-6 w-6" /></div>
                    <div className="flex-1 bg-white rounded-full px-4 py-2 text-sm text-stone-400">Ketik pesan</div>
                    <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-sm">
                      <Send className="h-4 w-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── INSTAGRAM CHAT PREVIEW (DARK MODE) ─── */
                <div className="flex flex-col h-full bg-[#000000]">
                  {/* IG Header */}
                  <div className="bg-[#121212] border-b border-stone-850 text-white px-4 py-3 flex items-center gap-3 shrink-0 z-10">
                    <button onClick={() => setIsPreviewModalOpen(false)} className="shrink-0">
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fd5949] to-[#d6249f] flex items-center justify-center text-white font-bold overflow-hidden shrink-0 border border-stone-850">
                      {(() => {
                        const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id));
                        return dummyContact?.name?.charAt(0).toUpperCase() || "B";
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate leading-tight text-white font-sans">
                        {(() => {
                          const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id));
                          const igInput = dummyContact?.ig?.trim() || "";
                          if (!igInput) return "instagram_user";
                          
                          if (igInput.startsWith("http://") || igInput.startsWith("https://")) {
                            try {
                              const parts = igInput.split('/');
                              const lastPart = parts.filter(Boolean).pop();
                              let name = lastPart ? lastPart.split('?')[0] : igInput;
                              if (name.startsWith('@')) name = name.substring(1);
                              return name;
                            } catch {
                              return "instagram_user";
                            }
                          }
                          return igInput.startsWith("@") ? igInput.substring(1) : igInput;
                        })()}
                      </h3>
                      <p className="text-[10px] text-green-500 font-semibold tracking-wide mt-0.5 font-sans">Aktif sekarang</p>
                    </div>
                    
                    {/* Inline icons for audio & video placeholder */}
                    <div className="flex gap-3 text-stone-300 mr-1">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 12v.5a7.5 7.5 0 0 1-15 0v-.5h1.5v.5a6 6 0 0 0 12 0v-.5H20zM12 2A3.5 3.5 0 0 0 8.5 5.5v5a3.5 3.5 0 0 0 7 0v-5A3.5 3.5 0 0 0 12 2z"/></svg>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    </div>
                  </div>

                  {/* IG Chat Body */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col relative pt-20 bg-[#000]">
                    <div className="bg-gradient-to-tr from-[#3897f0] via-[#a800e6] to-[#ff217a] self-end max-w-[85%] rounded-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-xs p-3 text-[14px] leading-[1.35] text-white mb-1 mt-4 shadow-sm">
                      <div className="whitespace-pre-wrap break-words font-sans">
                        {(() => {
                          const t = getSelectedTemplate();
                          const dummyContact = filteredContacts.find(c => selectedContacts.has(c.id)) || { name: "Budi", phone: "08123456789", category: "Customer", ig: "budidoremi" } as Contact;
                          if (!t) return "";
                          let msg = t.content;
                          const dateStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                          msg = msg.replace(/{nama}/g, dummyContact.name);
                          msg = msg.replace(/{nomor}/g, dummyContact.phone);
                          msg = msg.replace(/{kategori}/g, dummyContact.category || "-");
                          msg = msg.replace(/{tanggal}/g, dateStr);
                          
                          let igText = "-";
                          if (dummyContact.ig && dummyContact.ig.trim() !== "") igText = dummyContact.ig.startsWith("@") ? dummyContact.ig : `@${dummyContact.ig}`;
                          msg = msg.replace(/{instagram}/g, igText);
                          
                          const webMatches = msg.match(/{website\d+}/g) || [];
                          const uniqueWebs = Array.from(new Set(webMatches));
                          uniqueWebs.forEach(w => {
                            const wKey = w.replace(/[{}]/g, '');
                            msg = msg.replace(new RegExp(w, 'g'), selectedWebs[wKey] || `[Pilih ${wKey.toUpperCase()}]`);
                          });
                          
                          return msg;
                        })()}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-500 self-end mr-1 mt-0.5 font-sans">Dilihat</span>
                  </div>

                  {/* IG Footer */}
                  <div className="bg-[#121212] border-t border-stone-850 px-3 py-3 flex items-center gap-3 shrink-0">
                    <div className="flex-1 bg-[#1c1c1e] rounded-full px-4 py-2 border border-stone-800 flex items-center justify-between text-stone-400 text-xs">
                      <span className="font-sans">Kirim pesan...</span>
                      <div className="flex gap-2 shrink-0">
                        {/* Audio record icon */}
                        <svg className="w-4 h-4 fill-stone-400" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                        {/* Image gallery icon */}
                        <svg className="w-4 h-4 fill-stone-400" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                      </div>
                    </div>
                    {/* Heart icon */}
                    <div className="text-[#ff217a] shrink-0">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <strong>Cara Kerja:</strong> Klik <strong>Kirim WA</strong> untuk WhatsApp, atau <strong>IG</strong> untuk Instagram. Jika memilih IG, pesan akan <strong>otomatis tersalin ke clipboard</strong> Anda, jadi Anda cukup menekan tombol Paste di ruang obrolan. Pastikan Anda mengirim pesan, lalu kembali ke layar ini untuk lanjut.
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
                            onClick={() => handleSendToContactIG(contact)}
                            title="Kirim via Instagram DM"
                            className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                              isSent 
                              ? "bg-white border border-[#DCd4c6] text-[#7A6F6D] hover:bg-stone-50" 
                              : "bg-gradient-to-tr from-[#fd5949] to-[#d6249f] text-white hover:opacity-90 shadow-md shadow-pink-500/20"
                            }`}
                          >
                            <Instagram className="h-4 w-4" />
                            IG
                          </button>

                          <button
                            onClick={() => handleSendToContact(contact)}
                            className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all ${
                              isSent 
                              ? "bg-white border border-[#DCd4c6] text-[#7A6F6D] hover:bg-stone-50" 
                              : "bg-[#22C55E] text-white hover:bg-[#16A34A] shadow-md shadow-green-500/20"
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            {isSent ? "Kirim Ulang" : "WA"}
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

      {/* ─── INSTAGRAM TUTORIAL MODAL ─── */}
      <AnimatePresence>
        {igTutorialContact && (
          <div className="fixed inset-0 z-[250] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1e1e24] text-stone-100 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-850"
            >
              {/* Top Instagram Gradient Banner */}
              <div className="h-2 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fd5949] to-[#d6249f] flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
                      <Instagram className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-white font-sans">Langkah Kirim IG DM</h3>
                      <p className="text-[11px] text-stone-400 font-sans">Untuk {igTutorialContact.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIgTutorialContact(null)}
                    className="p-1.5 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Steps Section */}
                <div className="space-y-4 mb-6">
                  
                  {/* Step 1 */}
                  <div className="flex gap-4 items-start p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60">
                    <div className="w-8 h-8 rounded-full bg-green-950 border border-green-800/80 flex items-center justify-center font-bold text-green-400 shrink-0 text-sm">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white font-sans">Teks Disalin Otomatis</div>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                        Pesan template untuk <span className="font-medium text-stone-200">{igTutorialContact.name}</span> sudah berhasil disalin ke clipboard Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4 items-start p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60">
                    <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-800/80 flex items-center justify-center font-bold text-blue-400 shrink-0 text-sm font-mono">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white font-sans">Buka DM / Profil IG</div>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                        Klik tombol di bawah untuk membuka halaman Instagram target. {igTutorialContact.ig ? (
                          <span>
                            Profil target:{" "}
                            <strong className="text-[#ee2a7b]">
                              {igTutorialContact.ig.startsWith("http") 
                                ? (() => {
                                    try {
                                      const parts = igTutorialContact.ig.split('/');
                                      const lastPart = parts.filter(Boolean).pop();
                                      return lastPart ? `@${lastPart.split('?')[0]}` : igTutorialContact.ig;
                                    } catch {
                                      return igTutorialContact.ig;
                                    }
                                  })()
                                : (igTutorialContact.ig.startsWith("@") ? igTutorialContact.ig : `@${igTutorialContact.ig}`)
                              }
                            </strong>.
                          </span>
                        ) : (
                          <span>Cari akun target secara manual.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4 items-start p-3 rounded-2xl bg-stone-900/40 border border-stone-800/60">
                    <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-800/80 flex items-center justify-center font-bold text-amber-400 shrink-0 text-sm font-mono">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white font-sans">Tempel & Kirim</div>
                      <p className="text-xs text-stone-400 mt-0.5 leading-relaxed font-sans">
                        Klik tombol <strong className="text-stone-200">Message / Kirim Pesan</strong> di Instagram, lalu tekan:
                        <span className="block mt-1 px-2 py-1 bg-stone-950 rounded font-mono text-[10px] text-amber-400 w-max">
                          Desktop: Ctrl + V  |  HP: Tekan lama & Tempel
                        </span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIgTutorialContact(null)}
                    className="flex-1 py-3 text-xs font-bold text-stone-400 bg-stone-900 border border-stone-800 hover:bg-stone-800 rounded-xl transition-colors font-sans"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleConfirmSendIG(igTutorialContact)}
                    className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#fd5949] to-[#d6249f] text-white font-bold text-xs shadow-lg shadow-pink-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-sans"
                  >
                    <span>Buka Instagram & Kirim</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── WEB SETTINGS POPUP MODAL ─── */}
      <AnimatePresence>
        {isWebSettingsModalOpen && (
          <div className="fixed inset-0 z-[250] bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF8F5] text-[#3C2F2F] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#DCd4c6]"
            >
              {/* Top Accent Gradient Banner */}
              <div className="h-2 bg-gradient-to-r from-[#A07855] to-[#8B5A2B]"></div>
              
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-5 border-b border-[#E6DFD5] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#8B5A2B]">
                      <Edit className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight text-[#3C2F2F] font-serif">Pengaturan Tautan</h3>
                      <p className="text-[10px] text-[#7A6F6D] font-sans">Konfigurasi variabel tautan template</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsWebSettingsModalOpen(false)}
                    className="p-1.5 hover:bg-[#EFEAE2] rounded-xl text-[#A89F95] hover:text-[#5C4B40] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body dropdowns list (scrollable if many) */}
                <div 
                  className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 scroll-smooth overscroll-contain"
                  style={{ 
                    WebkitOverflowScrolling: "touch", 
                    willChange: "transform" 
                  }}
                >
                  {(() => {
                    const template = getSelectedTemplate();
                    if (!template) return null;
                    const matches = template.content.match(/{website\d+}/g) || [];
                    const usedWebVars = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));
                    
                    const linkCategories = Array.from(new Set(links.map(l => l.category).filter(Boolean)));

                    // Performance Optimization: Pre-group links and find selected links once
                    const allSelectedWebs = Object.values(selectedWebs).filter(Boolean);
                    const allGroupedLinks = links.reduce<Record<string, StoredLink[]>>((acc, link) => {
                      const cat = link.category || "Umum";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(link);
                      return acc;
                    }, {});

                    return usedWebVars.map(w => {
                      const filterCategory = selectedWebCategories[w] || "";
                      const groupedLinks = filterCategory 
                        ? { [filterCategory]: allGroupedLinks[filterCategory] || [] }
                        : allGroupedLinks;

                      return (
                        <div key={w} className="p-3.5 bg-white border border-[#E6DFD5] rounded-2xl flex flex-col gap-2 shadow-xs">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#5C4B40] font-sans">
                            Pilih Tautan untuk <span className="text-amber-700">{w.toUpperCase()}</span> <span className="text-amber-600">*</span>
                          </label>
                          
                          <div className="flex flex-col gap-2">
                            {/* Category Filter */}
                            {linkCategories.length > 0 && (
                              <select
                                value={filterCategory}
                                onChange={(e) => {
                                  const newCat = e.target.value;
                                  setSelectedWebCategories({...selectedWebCategories, [w]: newCat});
                                  const currentVal = selectedWebs[w] || "";
                                  if (currentVal) {
                                    const isStillValid = links.some(l => l.url === currentVal && (!newCat || l.category === newCat));
                                    if (!isStillValid) {
                                      setSelectedWebs(prev => ({...prev, [w]: ""}));
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#5C4B40] bg-[#FAF8F5] font-semibold"
                              >
                                <option value="">Semua Kategori Website</option>
                                {linkCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            )}

                            {/* Main Website dropdown */}
                            <select
                              value={selectedWebs[w] || ""}
                              onChange={(e) => setSelectedWebs({...selectedWebs, [w]: e.target.value})}
                              className="w-full px-3 py-2 border border-[#DCd4c6] rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F] bg-white font-sans"
                            >
                              <option value="">-- Pilih {w.toUpperCase()} --</option>
                              {Object.entries(groupedLinks).map(([category, catLinks]) => (
                                <optgroup key={category} label={category} className="font-semibold text-stone-500 bg-white font-sans">
                                  {catLinks.map(l => {
                                    const isAlreadyUsed = allSelectedWebs.includes(l.url) && selectedWebs[w] !== l.url;
                                    return (
                                      <option 
                                        key={l.id} 
                                        value={l.url} 
                                        disabled={isAlreadyUsed}
                                        className={isAlreadyUsed ? "text-stone-300 font-sans" : "font-normal text-stone-800 font-sans"}
                                      >
                                        {l.title} ({l.url}){isAlreadyUsed ? " — [Sudah Digunakan]" : ""}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer Save Button */}
                <div className="mt-5 pt-3 border-t border-[#E6DFD5]">
                  <button
                    onClick={() => setIsWebSettingsModalOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-[#A07855] to-[#8B5A2B] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Simpan Pengaturan</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
