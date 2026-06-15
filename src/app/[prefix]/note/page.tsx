"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, Search, FileText, Link2, Users, Plus, Trash2, 
  ExternalLink, Menu, X, Calendar, Phone, Mail, Folder,
  CheckCircle, Globe, Instagram, Facebook, Youtube, HardDrive, 
  BookOpen, Sparkles, Lock, LockOpen, ShieldAlert, Eye, EyeOff,
  Settings, Tag, Loader2, MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Password untuk catatan rahasia
const SECRET_PASSWORD = "madk0912";

// Note interface
interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
  isSecret?: boolean;
}

// Link interface
interface StoredLink {
  id: string;
  title: string;
  url: string;
  category: string;
}

// Contact interface
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
}

interface UserProfile {
  email: string;
  name: string;
}

// Default categories
const DEFAULT_LINK_CATEGORIES = ["Website", "Instagram", "Facebook", "YouTube", "Google Drive", "TikTok", "Lainnya"];
const DEFAULT_CONTACT_CATEGORIES = ["Umum", "Travel", "Jual Buku", "Klien", "Supplier", "Teman", "Keluarga"];

export default function NotesWorkspace() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  // Auth & Data states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [links, setLinks] = useState<StoredLink[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"notes" | "links" | "contacts">("notes");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"dashboard" | "notes" | "links" | "contacts">("dashboard");

  // Category filter per tab
  const [notesCatFilter, setNotesCatFilter] = useState("");
  const [linksCatFilter, setLinksCatFilter] = useState("");
  const [contactsCatFilter, setContactsCatFilter] = useState("");

  // Editor states
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Secret note states
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<string[]>([]);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [pendingNoteId, setPendingNoteId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Modals state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkCategory, setNewLinkCategory] = useState("");

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactCategory, setNewContactCategory] = useState("");

  // Custom categories state
  const [linkCategories, setLinkCategories] = useState<string[]>(DEFAULT_LINK_CATEGORIES);
  const [contactCategories, setContactCategories] = useState<string[]>(DEFAULT_CONTACT_CATEGORIES);

  // Category manager modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalType, setCategoryModalType] = useState<"links" | "contacts">("contacts");
  const [newCategoryName, setNewCategoryName] = useState("");

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Helper: get current user_id from session
  const getUserId = () => (typeof window !== "undefined" ? localStorage.getItem("luma_session") || "madk" : "madk");

  // Load session & user data from Supabase
  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = localStorage.getItem("luma_session");
    if (!session) {
      router.replace(`/workspace/login`);
      return;
    }

    if (prefix !== session) {
      router.replace(`/${session}/note`);
      return;
    }

    setCurrentUser({ email: session, name: session });
    loadFromSupabase(session);
  }, [router, prefix]);

  const loadFromSupabase = async (userId: string) => {
    setIsLoading(true);
    try {
      const [notesRes, linksRes, contactsRes, catsRes] = await Promise.all([
        supabase.from("notes").select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
        supabase.from("links").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("contacts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_categories").select("*").eq("user_id", userId),
      ]);

      if (notesRes.data) {
        const mapped: Note[] = notesRes.data.map((n) => ({
          id: n.id,
          title: n.title,
          category: n.category,
          content: n.content,
          updatedAt: n.updated_at,
          isSecret: n.is_secret,
        }));
        setNotes(mapped);
        if (mapped.length > 0) setSelectedNoteId(mapped[0].id);
      }

      if (linksRes.data) {
        setLinks(linksRes.data.map((l) => ({
          id: l.id, title: l.title, url: l.url, category: l.category,
        })));
      }

      if (contactsRes.data) {
        setContacts(contactsRes.data.map((c) => ({
          id: c.id, name: c.name, phone: c.phone,
          email: c.email || "", category: c.category || "Umum",
        })));
      }

      if (catsRes.data) {
        const lc = catsRes.data.find((c) => c.type === "links");
        const cc = catsRes.data.find((c) => c.type === "contacts");
        if (lc?.categories?.length) setLinkCategories(lc.categories);
        if (cc?.categories?.length) setContactCategories(cc.categories);
      }
    } catch (err) {
      console.error("Supabase load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Adjust sidebar responsive state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // call initially
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Trigger visual auto-save spinner
  const triggerAutoSaveIndicator = () => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  // Log out handler
  const handleLogout = () => {
    localStorage.removeItem("luma_session");
    router.replace(`/${prefix}/login`);
  };

  // Handle clicking a note in sidebar - check lock state
  const handleNoteClick = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isSecret && !unlockedNoteIds.includes(noteId)) {
      // Need to unlock first
      setPendingNoteId(noteId);
      setPasswordInput("");
      setPasswordError("");
      setShowPassword(false);
      setLockModalOpen(true);
    } else {
      setSelectedNoteId(noteId);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  // Toggle secret status on active note
  const handleToggleSecret = () => {
    if (!selectedNoteId) return;
    const note = notes.find(n => n.id === selectedNoteId);
    if (!note) return;

    const nowSecret = !note.isSecret;
    const updatedAt = new Date().toISOString();
    const updatedNotes = notes.map(n =>
      n.id === selectedNoteId ? { ...n, isSecret: nowSecret, updatedAt } : n
    );

    setNotes(updatedNotes);
    triggerAutoSaveIndicator();
    if (nowSecret) setUnlockedNoteIds(prev => prev.filter(id => id !== selectedNoteId));

    supabase.from("notes").update({ is_secret: nowSecret, updated_at: updatedAt })
      .eq("id", selectedNoteId).eq("user_id", getUserId()).then(({ error }) => {
        if (error) console.error("Toggle secret error:", error);
      });
  };

  // Handle password unlock submit
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      if (pendingNoteId) {
        setUnlockedNoteIds(prev => [...prev, pendingNoteId]);
        setSelectedNoteId(pendingNoteId);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
      setLockModalOpen(false);
      setPendingNoteId(null);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("Password salah. Coba lagi.");
    }
  };

  // Notes CRUD
  const handleCreateNote = async () => {
    const userId = getUserId();
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Catatan Tanpa Judul",
      category: "Lainnya",
      content: "",
      updatedAt: new Date().toISOString(),
      isSecret: false,
    };

    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setActiveTab("notes");
    triggerAutoSaveIndicator();
    if (window.innerWidth < 768) setSidebarOpen(false);

    const { error } = await supabase.from("notes").insert({
      id: newNote.id, user_id: userId,
      title: newNote.title, category: newNote.category,
      content: newNote.content, is_secret: false,
      updated_at: newNote.updatedAt,
    });
    if (error) console.error("Insert note error:", error);
  };

  const dbSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateNote = (field: "title" | "content" | "category", value: string) => {
    if (!selectedNoteId) return;
    const updatedAt = new Date().toISOString();

    const updatedNotes = notes.map((note) =>
      note.id === selectedNoteId
        ? { ...note, [field]: value, updatedAt }
        : note
    );

    // Bubble active note to top
    const idx = updatedNotes.findIndex(n => n.id === selectedNoteId);
    if (idx > 0) {
      const [active] = updatedNotes.splice(idx, 1);
      updatedNotes.unshift(active);
    }

    setNotes(updatedNotes);
    triggerAutoSaveIndicator();

    const noteToSave = updatedNotes.find(n => n.id === selectedNoteId) || updatedNotes[0];

    // Debounce DB write for text fields
    if (field === "content" || field === "title") {
      if (dbSaveTimeoutRef.current) clearTimeout(dbSaveTimeoutRef.current);
      dbSaveTimeoutRef.current = setTimeout(() => {
        supabase.from("notes").update({ [field]: value, updated_at: updatedAt })
          .eq("id", selectedNoteId).eq("user_id", getUserId()).then(({ error }) => {
            if (error) console.error("Update note error:", error);
          });
      }, 600);
    } else {
      supabase.from("notes").update({ [field]: value, updated_at: updatedAt })
        .eq("id", selectedNoteId).eq("user_id", getUserId()).then(({ error }) => {
          if (error) console.error("Update note error:", error);
        });
    }

    void noteToSave;
  };

  const handleDeleteNote = async (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(notes.filter(n => n.id !== id)[0]?.id || null);
    }
    await supabase.from("notes").delete().eq("id", id).eq("user_id", getUserId());
  };

  // Link CRUD
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) formattedUrl = "https://" + formattedUrl;

    const newLink: StoredLink = {
      id: Date.now().toString(),
      title: newLinkTitle.trim(),
      url: formattedUrl,
      category: newLinkCategory || linkCategories[0] || "Website",
    };

    setLinks(prev => [newLink, ...prev]);
    setNewLinkTitle(""); setNewLinkUrl(""); setNewLinkCategory(""); setLinkModalOpen(false);

    const { error } = await supabase.from("links").insert({
      id: newLink.id, user_id: getUserId(),
      title: newLink.title, url: newLink.url, category: newLink.category,
    });
    if (error) console.error("Insert link error:", error);
  };

  const handleDeleteLink = async (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
    await supabase.from("links").delete().eq("id", id).eq("user_id", getUserId());
  };

  // Contact CRUD
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      email: newContactEmail.trim(),
      category: newContactCategory || contactCategories[0] || "Umum",
    };

    setContacts(prev => [newContact, ...prev]);
    setNewContactName(""); setNewContactPhone(""); setNewContactEmail("");
    setNewContactCategory(""); setContactModalOpen(false);

    const { error } = await supabase.from("contacts").insert({
      id: newContact.id, user_id: getUserId(),
      name: newContact.name, phone: newContact.phone,
      email: newContact.email, category: newContact.category,
    });
    if (error) console.error("Insert contact error:", error);
  };

  const handleDeleteContact = async (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    await supabase.from("contacts").delete().eq("id", id).eq("user_id", getUserId());
  };

  // Category management via Supabase
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const trimmed = newCategoryName.trim();
    const userId = getUserId();

    if (categoryModalType === "links") {
      if (linkCategories.includes(trimmed)) return;
      const updated = [...linkCategories, trimmed];
      setLinkCategories(updated);
      await supabase.from("user_categories").upsert(
        { user_id: userId, type: "links", categories: updated },
        { onConflict: "user_id,type" }
      );
    } else {
      if (contactCategories.includes(trimmed)) return;
      const updated = [...contactCategories, trimmed];
      setContactCategories(updated);
      await supabase.from("user_categories").upsert(
        { user_id: userId, type: "contacts", categories: updated },
        { onConflict: "user_id,type" }
      );
    }
    setNewCategoryName("");
  };

  const handleDeleteCategory = async (cat: string) => {
    const userId = getUserId();
    if (categoryModalType === "links") {
      const updated = linkCategories.filter(c => c !== cat);
      setLinkCategories(updated);
      await supabase.from("user_categories").upsert(
        { user_id: userId, type: "links", categories: updated },
        { onConflict: "user_id,type" }
      );
    } else {
      const updated = contactCategories.filter(c => c !== cat);
      setContactCategories(updated);
      await supabase.from("user_categories").upsert(
        { user_id: userId, type: "contacts", categories: updated },
        { onConflict: "user_id,type" }
      );
    }
  };

  // Filtered data based on search bar query + category filter
  const filteredNotes = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = notesCatFilter ? n.category === notesCatFilter : true;
    return matchSearch && matchCat;
  });

  const filteredLinks = links.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = linksCatFilter ? l.category === linksCatFilter : true;
    return matchSearch && matchCat;
  });

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = contactsCatFilter ? (c.category || "") === contactsCatFilter : true;
    return matchSearch && matchCat;
  });

  // Unique categories from actual data (for filter chips)
  const notesCats = Array.from(new Set(notes.filter(n => !n.isSecret).map(n => n.category).filter(Boolean)));
  const linksCats = Array.from(new Set(links.map(l => l.category).filter(Boolean)));
  const contactsCats = Array.from(new Set(contacts.map(c => c.category).filter(Boolean)));

  // Helper: get display initial for contact category
  const getContactCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      "Travel": "bg-sky-100 text-sky-700 border-sky-200",
      "Jual Buku": "bg-amber-100 text-amber-700 border-amber-200",
      "Klien": "bg-purple-100 text-purple-700 border-purple-200",
      "Supplier": "bg-orange-100 text-orange-700 border-orange-200",
      "Teman": "bg-green-100 text-green-700 border-green-200",
      "Keluarga": "bg-rose-100 text-rose-700 border-rose-200",
    };
    return colors[cat] || "bg-[#F0EAE1] text-[#A07855] border-[#DCd4c6]";
  };

  // Helper values for active note
  const activeNote = notes.find((n) => n.id === selectedNoteId) || null;

  // Format date helper (Indonesian Locale)
  const formatDate = (isoStr: string) => {
    if (!isoStr) return "";
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Get link icon helper
  const getLinkIcon = (category: string) => {
    switch (category) {
      case "Instagram": return <Instagram className="h-4 w-4 text-[#C13584]" />;
      case "Facebook": return <Facebook className="h-4 w-4 text-[#1877F2]" />;
      case "YouTube": return <Youtube className="h-4 w-4 text-[#FF0000]" />;
      case "Google Drive": return <HardDrive className="h-4 w-4 text-[#34A853]" />;
      case "TikTok": return <Globe className="h-4 w-4 text-stone-800" />;
      default: return <Globe className="h-4 w-4 text-[#A07855]" />;
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
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-[#FAF6F0] flex flex-col items-center justify-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#5C4B40] flex items-center justify-center text-[#F8F4EE] font-serif font-bold text-xl shadow-lg">
              L
            </div>
            <div className="flex items-center gap-2 text-[#7A6F6D] text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat workspace...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── RPG FANTASY MOBILE DASHBOARD ─── */}
      {mobileView === "dashboard" && (
        <div className="flex md:hidden w-full h-full flex-col relative overflow-hidden bg-[#2D4A22]">
          {/* Fantasy Forest Background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=1080&auto=format&fit=crop')" }}
          />
          {/* Top Vignette / Gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1A2E11]/90 via-transparent to-[#1A2E11]" />

          <div className="relative z-10 flex flex-col h-full w-full p-4 overflow-y-auto">
            {/* Wooden Logo Sign */}
            <div className="flex flex-col items-center mt-6 mb-8">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-[#8B5A2B] rounded-xl transform rotate-2"></div>
                <div className="relative bg-gradient-to-b from-[#6B3E11] to-[#3A2008] border-2 border-[#D4A373] px-6 py-3 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.2)]">
                  <h1 className="font-serif font-black text-3xl text-center bg-gradient-to-b from-[#FFEAA7] via-[#FDCB6E] to-[#E17055] bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    LumaNoted
                  </h1>
                </div>
                {/* Sign hangers */}
                <div className="absolute -top-3 left-4 w-1.5 h-6 bg-zinc-800 rounded-sm"></div>
                <div className="absolute -top-3 right-4 w-1.5 h-6 bg-zinc-800 rounded-sm"></div>
                <div className="absolute -top-5 left-3.5 w-2.5 h-2.5 rounded-full bg-stone-400"></div>
                <div className="absolute -top-5 right-3.5 w-2.5 h-2.5 rounded-full bg-stone-400"></div>
              </div>
              <div className="mt-2 bg-[#D4A373] text-[#4A2F11] font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded shadow-md border-b-2 border-[#8B5A2B]">
                ✦ Workspace ✦
              </div>
            </div>

            <p className="text-center text-amber-50 font-medium mb-6 drop-shadow-md text-sm">
              Kelola sumber daya di hutan ajaibmu.
            </p>

            {/* RPG 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-auto">
              
              {/* Box 1: Notes */}
              <button 
                onClick={() => { setActiveTab("notes"); setMobileView("notes"); }}
                className="relative group bg-gradient-to-b from-[#5C3A21] to-[#3A2210] border-[3px] border-[#8B5A2B] rounded-lg p-3 shadow-[0_8px_15px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[110px]"
              >
                <div className="absolute inset-0 bg-[#A67C52] opacity-0 group-active:opacity-20 transition-opacity rounded-sm" />
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                
                <FileText className="h-8 w-8 text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2" />
                <span className="font-bold text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">{notes.length}</span>
                <span className="text-[10px] text-amber-200/80 font-semibold uppercase tracking-wide mt-1">Catatan Tersimpan</span>
              </button>

              {/* Box 2: Links */}
              <button 
                onClick={() => { setActiveTab("links"); setMobileView("links"); }}
                className="relative group bg-gradient-to-b from-[#5C3A21] to-[#3A2210] border-[3px] border-[#8B5A2B] rounded-lg p-3 shadow-[0_8px_15px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[110px]"
              >
                <div className="absolute inset-0 bg-[#A67C52] opacity-0 group-active:opacity-20 transition-opacity rounded-sm" />
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                
                <Link2 className="h-8 w-8 text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2" />
                <span className="font-bold text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">{links.length}</span>
                <span className="text-[10px] text-amber-200/80 font-semibold uppercase tracking-wide mt-1">Link Penting</span>
              </button>

              {/* Box 3: Contacts */}
              <button 
                onClick={() => { setActiveTab("contacts"); setMobileView("contacts"); }}
                className="relative group bg-gradient-to-b from-[#5C3A21] to-[#3A2210] border-[3px] border-[#8B5A2B] rounded-lg p-3 shadow-[0_8px_15px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[110px]"
              >
                <div className="absolute inset-0 bg-[#A67C52] opacity-0 group-active:opacity-20 transition-opacity rounded-sm" />
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                
                <Users className="h-8 w-8 text-[#FFD700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-2" />
                <span className="font-bold text-2xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">{contacts.length}</span>
                <span className="text-[10px] text-amber-200/80 font-semibold uppercase tracking-wide mt-1">Total Relasi</span>
              </button>

              {/* Box 4: Create Note */}
              <button 
                onClick={() => { handleCreateNote(); setMobileView("notes"); }}
                className="relative group bg-gradient-to-b from-[#285A22] to-[#12310C] border-[3px] border-[#448B39] rounded-lg p-3 shadow-[0_8px_15px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[110px]"
              >
                <div className="absolute inset-0 bg-[#59B24D] opacity-0 group-active:opacity-20 transition-opacity rounded-sm" />
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-zinc-800 rounded-full border border-zinc-600 shadow-sm" />
                
                <div className="h-8 w-8 mb-2 rounded-full bg-gradient-to-b from-[#FDE68A] to-[#D97706] flex items-center justify-center shadow-[0_0_15px_rgba(253,230,138,0.6)]">
                  <Plus className="h-5 w-5 text-amber-900" />
                </div>
                <span className="font-bold text-[13px] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-tight text-center">Buat<br/>Catatan</span>
              </button>

            </div>

            {/* Mascot & Dialog Bubble */}
            <div className="relative mt-8 h-[160px] flex items-end justify-end">
              {/* Dialog Bubble */}
              <div className="absolute bottom-[80px] right-[70px] z-20">
                <div className="bg-[#FAF6F0] text-[#3C2F2F] text-xs font-bold px-4 py-3 rounded-2xl rounded-br-none border-2 border-[#D4A373] shadow-lg max-w-[200px]">
                  Hai kawan! Siap mengelola misimu hari ini?
                </div>
              </div>
              
              {/* Mascot Image (Bunny) */}
              <div className="w-[120px] h-[120px] relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Rabbit.png" 
                  alt="Mascot Bunny"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Settings Button (bottom left) */}
            <div className="absolute bottom-6 left-6 z-20">
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-stone-700 to-stone-900 border-2 border-stone-500 shadow-lg flex items-center justify-center text-stone-300 active:scale-95 transition-transform"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ORIGINAL DESKTOP & CONTENT UI ─── */}
      <div className={`w-full h-full flex-col md:flex-row ${mobileView === "dashboard" ? "hidden md:flex" : "flex"}`}>
        
        {/* Mobile Header (Only visible when mobileView is NOT dashboard) */}
        <div className="md:hidden flex-none bg-[#FAF6F0] border-b border-[#DCd4c6] p-3 flex items-center justify-between z-20 shadow-sm relative">
          <button 
            onClick={() => setMobileView("dashboard")}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-[#DCd4c6] rounded-xl text-xs font-bold text-[#5C4B40] shadow-sm active:scale-95 transition-all"
          >
            ← Menu
          </button>
          <span className="font-serif font-bold text-sm text-[#3C2F2F] tracking-wide absolute left-1/2 -translate-x-1/2">
            Luma Notes
          </span>
        </div>

        <div className="flex w-full flex-1 overflow-hidden">
          {/* ─── SIDEBAR drawer ─── */}
          <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[280px] bg-[#FAF6F0] border-r border-[#DCd4c6] flex flex-col h-full z-40 flex-shrink-0 absolute md:relative"
          >
            {/* Sidebar Header with branding and collapse */}
            <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#5C4B40] flex items-center justify-center text-[#F8F4EE] font-serif font-bold text-sm">
                  L
                </div>
                <span className="font-serif font-bold text-base text-[#3C2F2F] tracking-wide">
                  Luma Notes
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 hover:bg-[#EFEAE2] rounded-md transition-colors text-[#7A6F6D]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Profile Info section */}
            <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7]/50">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-sm font-semibold text-[#3C2F2F] truncate">
                    {currentUser?.name || "Memuat..."}
                  </p>
                  <p className="text-xs text-[#A89F95] truncate">
                    {currentUser?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Keluar akun"
                  className="p-2 bg-[#FAF6F0] hover:bg-red-50 hover:text-red-700 border border-[#DCd4c6] rounded-xl text-[#7A6F6D] transition-all duration-200 active:scale-95 flex-shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick search input */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#A89F95]" />
                <input
                  type="text"
                  placeholder="Cari sesuatu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FDFBF7] border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-[#A89F95] hover:text-[#5C4B40] text-xs font-semibold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Category Tabs */}
            <div className="px-3 pb-2 flex gap-1 border-b border-[#E6DFD5]">
              <button
                onClick={() => { setActiveTab("notes"); setSearchQuery(""); setNotesCatFilter(""); }}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 border ${
                  activeTab === "notes"
                    ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F] font-medium"
                    : "bg-[#FAF6F0] border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/50 hover:text-[#3C2F2F]"
                }`}
              >
                <FileText className="h-4 w-4 mb-1" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Catatan</span>
              </button>
              <button
                onClick={() => { setActiveTab("links"); setSearchQuery(""); setLinksCatFilter(""); }}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 border ${
                  activeTab === "links"
                    ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F] font-medium"
                    : "bg-[#FAF6F0] border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/50 hover:text-[#3C2F2F]"
                }`}
              >
                <Link2 className="h-4 w-4 mb-1" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Link</span>
              </button>
              <button
                onClick={() => { setActiveTab("contacts"); setSearchQuery(""); setContactsCatFilter(""); }}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 border ${
                  activeTab === "contacts"
                    ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F] font-medium"
                    : "bg-[#FAF6F0] border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/50 hover:text-[#3C2F2F]"
                }`}
              >
                <Users className="h-4 w-4 mb-1" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Kontak</span>
              </button>
              <button
                onClick={() => router.push(`/${prefix}/whatsapp`)}
                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200 border bg-[#FAF6F0] border-transparent text-green-600 hover:bg-green-50 hover:text-green-700`}
              >
                <MessageCircle className="h-4 w-4 mb-1" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">WA</span>
              </button>
            </div>

            {/* List panel (Scrollable) */}
            <div className="flex-grow overflow-y-auto p-2 space-y-1">
              
              {/* Catatan List */}
              {activeTab === "notes" && (
                <>
                  <button
                    onClick={handleCreateNote}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-xs text-[#5C4B40] font-medium transition-all duration-200 mb-2 hover:shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> Catatan Baru
                  </button>

                  {/* Category filter chips */}
                  {notesCats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-[#F0EAE2]">
                      <button
                        onClick={() => setNotesCatFilter("")}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                          notesCatFilter === ""
                            ? "bg-[#5C4B40] text-[#FAF6F0] border-[#5C4B40]"
                            : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                        }`}
                      >
                        Semua
                      </button>
                      {notesCats.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNotesCatFilter(notesCatFilter === cat ? "" : cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                            notesCatFilter === cat
                              ? "bg-[#A07855] text-white border-[#A07855]"
                              : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#A89F95] font-light">
                      Tidak ada catatan.
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const isLocked = note.isSecret && !unlockedNoteIds.includes(note.id);
                      return (
                      <div
                        key={note.id}
                        onClick={() => handleNoteClick(note.id)}
                        className={`group p-2.5 rounded-xl cursor-pointer transition-all duration-150 relative border ${
                          selectedNoteId === note.id
                            ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F]"
                            : "bg-[#FAF6F0] border-transparent text-[#5C4B40] hover:bg-[#EFEAE2]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            {note.isSecret && (
                              isLocked
                                ? <Lock className="h-2.5 w-2.5 text-[#A07855] flex-shrink-0" />
                                : <LockOpen className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />
                            )}
                            <h3 className={`font-medium text-xs truncate flex-1 pr-1 font-serif ${
                              isLocked ? "text-[#A89F95] italic" : ""
                            }`}>
                              {isLocked ? "••••••••" : (note.title || "Catatan Tanpa Judul")}
                            </h3>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#A89F95] hover:text-red-600 rounded transition-opacity"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[#A89F95]">
                          <span>{formatDate(note.updatedAt)}</span>
                          {note.isSecret ? (
                            <span className="px-1.5 bg-[#F0EAE1] border border-[#DCd4c6] rounded text-[9px] font-semibold text-[#A07855] flex items-center gap-0.5">
                              <Lock className="h-2 w-2" /> Rahasia
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 bg-[#FAF6F0]/80 rounded border border-[#E6DFD5] text-[9px] font-semibold text-[#A07855]">
                              {note.category}
                            </span>
                          )}
                        </div>
                      </div>
                      );
                    })
                  )}
                </>
              )}

              {/* Links List Overview */}
              {activeTab === "links" && (
                <>
                  <div className="flex gap-1 mb-2">
                    <button
                      onClick={() => { setNewLinkCategory(linkCategories[0] || "Website"); setLinkModalOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-xs text-[#5C4B40] font-medium transition-all duration-200 hover:shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Link
                    </button>
                    <button
                      onClick={() => { setCategoryModalType("links"); setNewCategoryName(""); setCategoryModalOpen(true); }}
                      title="Kelola Kategori Link"
                      className="p-2 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-[#7A6F6D] hover:text-[#5C4B40] transition-all"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Category filter chips */}
                  {linksCats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-[#F0EAE2]">
                      <button
                        onClick={() => setLinksCatFilter("")}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                          linksCatFilter === ""
                            ? "bg-[#5C4B40] text-[#FAF6F0] border-[#5C4B40]"
                            : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                        }`}
                      >
                        Semua
                      </button>
                      {linksCats.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setLinksCatFilter(linksCatFilter === cat ? "" : cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                            linksCatFilter === cat
                              ? "bg-[#A07855] text-white border-[#A07855]"
                              : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredLinks.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#A89F95] font-light">
                      Tidak ada link disimpan.
                    </div>
                  ) : (
                    filteredLinks.map((link) => (
                      <div
                        key={link.id}
                        className="group p-2.5 rounded-xl border border-transparent hover:border-[#DCd4c6] bg-[#FDFBF7] flex items-center justify-between gap-2 shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 bg-[#FAF6F0] rounded-lg border border-[#E6DFD5] flex-shrink-0">
                            {getLinkIcon(link.category)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-[#3C2F2F] truncate pr-1">
                              {link.title}
                            </h4>
                            <p className="text-[10px] text-[#A89F95] truncate max-w-[130px]">
                              {link.url.replace(/^https?:\/\/(www\.)?/, "")}
                            </p>
                            <span className="text-[9px] text-[#A07855] font-medium">{link.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#A89F95] hover:text-[#5C4B40] rounded transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 text-[#A89F95] hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* Contacts List Overview */}
              {activeTab === "contacts" && (
                <>
                  <div className="flex gap-1 mb-2">
                    <button
                      onClick={() => { setNewContactCategory(""); setContactModalOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-xs text-[#5C4B40] font-medium transition-all duration-200 hover:shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Kontak
                    </button>
                    <button
                      onClick={() => { setCategoryModalType("contacts"); setNewCategoryName(""); setCategoryModalOpen(true); }}
                      title="Kelola Kategori Kontak"
                      className="p-2 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-[#7A6F6D] hover:text-[#5C4B40] transition-all"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Category filter chips */}
                  {contactsCats.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-[#F0EAE2]">
                      <button
                        onClick={() => setContactsCatFilter("")}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                          contactsCatFilter === ""
                            ? "bg-[#5C4B40] text-[#FAF6F0] border-[#5C4B40]"
                            : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                        }`}
                      >
                        Semua
                      </button>
                      {contactsCats.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setContactsCatFilter(contactsCatFilter === cat ? "" : cat)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                            contactsCatFilter === cat
                              ? "bg-[#A07855] text-white border-[#A07855]"
                              : "bg-[#FAF6F0] text-[#7A6F6D] border-[#DCd4c6] hover:bg-[#EFEAE2]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#A89F95] font-light">
                      Tidak ada kontak.
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="group p-2.5 rounded-xl border border-transparent hover:border-[#DCd4c6] bg-[#FDFBF7] flex items-center justify-between gap-1 shadow-sm transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h4 className="text-xs font-semibold text-[#3C2F2F] truncate">
                              {contact.name}
                            </h4>
                          </div>
                          <p className="text-[10px] text-[#7A6F6D] truncate">
                            {contact.phone}
                          </p>
                          {contact.category && (
                            <span className={`inline-flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${getContactCategoryColor(contact.category)}`}>
                              <Tag className="h-2 w-2" />{contact.category}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#A89F95] hover:text-red-600 rounded transition-opacity flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </>
              )}

            </div>

            {/* Sidebar Footer credit */}
            <div className="p-3 border-t border-[#E6DFD5] text-center bg-[#FDFBF7]/30">
              <span className="text-[9px] text-[#A89F95] uppercase tracking-wider font-semibold">
                Luma Developer
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-stone-900/10 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* ─── MAIN CANVAS ─── */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar details */}
        <header className="h-[57px] bg-[#FAF8F5] border-b border-[#DCd4c6] px-4 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 hover:bg-[#EFEAE2] rounded-xl border border-[#DCd4c6] text-[#7A6F6D] transition-colors duration-200"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <span className="text-xs font-medium tracking-wide text-[#A89F95]">
              {activeTab === "notes" ? "Editor Catatan" : activeTab === "links" ? "Penyimpanan Link" : "Kontak Penting"}
            </span>
          </div>

          {/* Saving Status (Debounced notification) */}
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {isSaving && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/50 py-1 px-2.5 rounded-full"
                >
                  <CheckCircle className="h-3 w-3 text-emerald-600 animate-pulse" />
                  <span>Tersimpan otomatis</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Quick action info badge */}
            <span className="text-[10px] text-[#FAF6F0] bg-[#A07855] px-2 py-0.5 rounded-full border border-[#906845] flex items-center gap-1 font-medium select-none">
              <Sparkles className="h-2.5 w-2.5" /> Workspace
            </span>
          </div>
        </header>

        {/* Dynamic Canvas Container (Content) */}
        <div className="flex-grow overflow-y-auto bg-[#F8F4EE] relative p-6 md:p-8">
          
          {/* 1. CATATAN EDIT VIEW */}
          {activeTab === "notes" && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              {activeNote ? (
                <div className="flex-grow flex flex-col space-y-4 h-full">
                  {/* Category + Date bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#A89F95] pb-2 border-b border-[#E6DFD5]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Folder className="h-3.5 w-3.5 text-[#A07855]" />
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Kategori:</span>
                      <select
                        value={activeNote.category}
                        onChange={(e) => handleUpdateNote("category", e.target.value)}
                        className="bg-[#FAF6F0] border border-[#DCd4c6] rounded-lg text-xs py-0.5 px-2 text-[#5C4B40] font-medium focus:outline-none focus:ring-1 focus:ring-[#A07855]"
                      >
                        <option value="Ide Bisnis">💡 Ide Bisnis</option>
                        <option value="Daftar Tugas">📋 Daftar Tugas</option>
                        <option value="Informasi Client">🤝 Informasi Client</option>
                        <option value="Catatan Meeting">📅 Catatan Meeting</option>
                        <option value="Lainnya">📝 Lainnya</option>
                      </select>

                      {/* Secret toggle button */}
                      <button
                        onClick={handleToggleSecret}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          activeNote.isSecret
                            ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                            : "bg-[#FAF6F0] border-[#DCd4c6] text-[#7A6F6D] hover:bg-[#EFEAE2] hover:text-[#5C4B40]"
                        }`}
                        title={activeNote.isSecret ? "Jadikan tidak rahasia" : "Jadikan rahasia"}
                      >
                        {activeNote.isSecret
                          ? <><Lock className="h-2.5 w-2.5" /> Rahasia</>
                          : <><LockOpen className="h-2.5 w-2.5" /> Tidak Rahasia</>
                        }
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="h-3 w-3" />
                        <span>Diperbarui: {formatDate(activeNote.updatedAt)}</span>
                      </div>
                      <span className="text-[10px] border-l border-[#DCd4c6] pl-3">
                        {activeNote.content.split(/\s+/).filter(Boolean).length} kata
                      </span>
                    </div>
                  </div>

                  {/* Notion-style Title */}
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNote("title", e.target.value)}
                    placeholder="Judul Catatan..."
                    className="w-full text-2xl md:text-3xl font-bold font-serif bg-transparent text-[#3C2F2F] border-none outline-none focus:ring-0 placeholder-[#C0B8AD] py-1"
                  />

                  {/* Canvas Body Editor */}
                  <div className="flex-grow">
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => handleUpdateNote("content", e.target.value)}
                      placeholder="Mulai menulis catatan di sini... (Ide bisnis, todo list, catatan meeting, detail client)"
                      className="w-full h-[calc(100vh-250px)] bg-transparent text-[#4A3E3D] border-none outline-none focus:ring-0 placeholder-[#C0B8AD]/70 resize-none font-sans leading-relaxed text-sm md:text-base focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 mt-12">
                  <div className="p-4 bg-[#FAF6F0] rounded-full border border-[#DCd4c6] mb-4">
                    <BookOpen className="h-8 w-8 text-[#A07855]" />
                  </div>
                  <h3 className="font-serif font-semibold text-lg text-[#3C2F2F]">
                    Mulai Bekerja di Canvas Catatan
                  </h3>
                  <p className="text-xs text-[#7A6F6D] mt-1 max-w-sm font-light">
                    Buat catatan baru atau pilih catatan yang sudah ada di sidebar untuk mulai merancang ide-ide Anda.
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className="mt-4 inline-flex items-center gap-2 py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Buat Catatan Pertama
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. SAVED LINKS DISPLAY GRID */}
          {activeTab === "links" && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4 mb-6">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#3C2F2F]">
                    Link Simpanan Penting
                  </h2>
                  <p className="text-xs text-[#7A6F6D] mt-1 font-light">
                    Kelola link penting seperti Google Drive client, media sosial, dan materi lainnya.
                  </p>
                </div>
                <button
                  onClick={() => setLinkModalOpen(true)}
                  className="inline-flex items-center gap-2 py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Link
                </button>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="text-center py-12 bg-[#FAF6F0]/50 border border-dashed border-[#DCd4c6] rounded-2xl p-6">
                  <Link2 className="h-8 w-8 text-[#A07855] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-[#3C2F2F]">Belum ada link tersimpan</p>
                  <p className="text-xs text-[#7A6F6D] mt-1 font-light">Simpan tautan eksternal Anda untuk akses cepat.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLinks.map((link) => (
                    <div
                      key={link.id}
                      className="bg-[#FAF8F5] border border-[#DCd4c6] hover:border-[#C8BEAE] rounded-xl p-4 shadow-soft hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#F0EAE1] rounded-lg text-[10px] font-semibold text-[#A07855] border border-[#E6DFD5] flex items-center gap-1">
                            {getLinkIcon(link.category)}
                            {link.category}
                          </span>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1 hover:bg-red-50 text-[#A89F95] hover:text-red-600 rounded transition-colors"
                            title="Hapus Link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="font-serif font-semibold text-sm text-[#3C2F2F] tracking-wide line-clamp-1">
                          {link.title}
                        </h3>
                        <p className="text-xs text-[#7A6F6D] truncate mt-1 select-all hover:text-[#5C4B40] font-light">
                          {link.url}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#E6DFD5] flex justify-end">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5C4B40] hover:text-[#A07855] transition-colors"
                        >
                          Buka Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. CONTACT DIRECTORY VIEW */}
          {activeTab === "contacts" && (
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4 mb-6">
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#3C2F2F]">
                    Direktori Kontak Penting
                  </h2>
                  <p className="text-xs text-[#7A6F6D] mt-1 font-light">
                    Kumpulan kontak penting client, mitra bisnis, atau relasi proyek.
                  </p>
                </div>
                <button
                  onClick={() => { setNewContactCategory(""); setContactModalOpen(true); }}
                  className="inline-flex items-center gap-2 py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] rounded-xl text-xs font-medium transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Kontak
                </button>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 bg-[#FAF6F0]/50 border border-dashed border-[#DCd4c6] rounded-2xl p-6">
                  <Users className="h-8 w-8 text-[#A07855] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-[#3C2F2F]">Belum ada kontak disimpan</p>
                  <p className="text-xs text-[#7A6F6D] mt-1 font-light">Simpan kontak client untuk mempermudah komunikasi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => {
                    // Clean phone number for WhatsApp link
                    const rawPhone = contact.phone.replace(/[^\d+]/g, "");
                    const waPhone = rawPhone.startsWith("+") 
                      ? rawPhone.slice(1) 
                      : rawPhone.startsWith("0") 
                        ? "62" + rawPhone.slice(1) 
                        : rawPhone;
                    
                    const waLink = `https://api.whatsapp.com/send?phone=${waPhone}&text=Halo%20${encodeURIComponent(contact.name)}`;

                    return (
                      <div
                        key={contact.id}
                        className="bg-[#FAF8F5] border border-[#DCd4c6] hover:border-[#C8BEAE] rounded-xl p-5 shadow-soft hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#EFEAE2] border border-[#C8BEAE] flex items-center justify-center font-bold text-xs text-[#5C4B40] font-serif uppercase">
                              {contact.name.charAt(0)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {contact.category && (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[9px] font-semibold border ${getContactCategoryColor(contact.category)}`}>
                                  <Tag className="h-2 w-2" />{contact.category}
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-1 hover:bg-red-50 text-[#A89F95] hover:text-red-600 rounded transition-colors"
                                title="Hapus Kontak"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <h3 className="font-serif font-bold text-sm text-[#3C2F2F]">
                            {contact.name}
                          </h3>
                          
                          <div className="mt-4 space-y-2 text-xs text-[#7A6F6D]">
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-2 hover:text-[#5C4B40] transition-colors"
                            >
                              <Phone className="h-3.5 w-3.5 text-[#A89F95] flex-shrink-0" />
                              <span>{contact.phone}</span>
                            </a>
                            {contact.email ? (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 hover:text-[#5C4B40] transition-colors truncate"
                              >
                                <Mail className="h-3.5 w-3.5 text-[#A89F95] flex-shrink-0" />
                                <span className="truncate">{contact.email}</span>
                              </a>
                            ) : (
                              <div className="flex items-center gap-2 text-[#C0B8AD] truncate">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>-</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Routing API */}
                        <div className="mt-5 pt-3 border-t border-[#E6DFD5] flex gap-2">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-lg text-xs font-semibold text-[#5C4B40] transition-all"
                          >
                            <svg className="h-3.5 w-3.5 text-emerald-600 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.589 0 10.137-4.502 10.14-10.022.002-2.674-1.03-5.188-2.907-7.07C16.528 1.63 14.032.588 11.4 5.88c-5.59 0-10.14 4.504-10.143 10.024-.001 1.705.469 3.374 1.362 4.887l-.92 3.364 3.448-.905zm12.355-7.234c-.305-.153-1.802-.889-2.083-.99-.281-.101-.486-.153-.69.153-.205.305-.792.99-.97 1.193-.178.203-.356.228-.661.076-.305-.152-1.288-.475-2.453-1.514-.906-.809-1.517-1.807-1.695-2.112-.178-.305-.019-.469.133-.62.137-.136.305-.356.458-.533.152-.178.203-.305.305-.508.102-.203.051-.381-.025-.533-.076-.153-.69-1.66-.945-2.27-.248-.598-.501-.518-.69-.527-.178-.009-.382-.01-.587-.01-.205 0-.537.076-.818.381-.281.305-1.074 1.05-1.074 2.56 0 1.511 1.099 2.969 1.251 3.172.152.203 2.163 3.303 5.24 4.63.732.315 1.304.503 1.749.645.735.234 1.403.201 1.932.122.589-.088 1.802-.736 2.057-1.448.256-.71.256-1.32.18-1.448-.076-.128-.282-.203-.587-.356z"/>
                            </svg>
                            Kirim WA
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      </div>
      </div>

      {/* ─── ADD LINK MODAL ─── */}
      <AnimatePresence>
        {linkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLinkModalOpen(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-md p-6 relative z-10 shadow-premium"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DFD5]">
                <h3 className="font-serif font-bold text-base text-[#3C2F2F]">
                  Tambah Tautan Baru
                </h3>
                <button
                  onClick={() => setLinkModalOpen(false)}
                  className="p-1 hover:bg-[#EFEAE2] rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-[#A89F95]" />
                </button>
              </div>

              <form onSubmit={handleAddLink} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Nama Tautan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dokumen Drive Project"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    URL Tautan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: drive.google.com/..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Kategori Platform
                  </label>
                  <select
                    value={newLinkCategory}
                    onChange={(e) => setNewLinkCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F]"
                  >
                    {linkCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalOpen(false)}
                    className="py-2 px-4 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] text-xs font-semibold rounded-xl text-[#5C4B40] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Simpan Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── ADD CONTACT MODAL ─── */}
      <AnimatePresence>
        {contactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContactModalOpen(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-md p-6 relative z-10 shadow-premium"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DFD5]">
                <h3 className="font-serif font-bold text-base text-[#3C2F2F]">
                  Tambah Kontak Baru
                </h3>
                <button
                  onClick={() => setContactModalOpen(false)}
                  className="p-1 hover:bg-[#EFEAE2] rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-[#A89F95]" />
                </button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Nama Kontak
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Budi Pratama"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789 atau +6281234..."
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Email Kontak (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: name@example.com"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                    Kategori Kontak
                  </label>
                  <select
                    value={newContactCategory || contactCategories[0]}
                    onChange={(e) => setNewContactCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F]"
                  >
                    {contactCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="py-2 px-4 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] text-xs font-semibold rounded-xl text-[#5C4B40] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] text-xs font-semibold rounded-xl transition-all shadow-sm"
                  >
                    Simpan Kontak
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── KELOLA KATEGORI MODAL ─── */}
      <AnimatePresence>
        {categoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCategoryModalOpen(false)}
              className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E6DFD5]">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#A07855]" />
                  <h3 className="font-serif font-bold text-base text-[#3C2F2F]">
                    Kelola Kategori {categoryModalType === "links" ? "Link" : "Kontak"}
                  </h3>
                </div>
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-1 hover:bg-[#EFEAE2] rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-[#A89F95]" />
                </button>
              </div>

              {/* Existing categories list */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto mb-4 pr-1">
                {(categoryModalType === "links" ? linkCategories : contactCategories).map(cat => (
                  <div
                    key={cat}
                    className="flex items-center justify-between px-3 py-2 bg-[#FAF6F0] border border-[#E6DFD5] rounded-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3 text-[#A07855]" />
                      <span className="text-xs font-medium text-[#3C2F2F]">{cat}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-[#A89F95] hover:text-red-600 rounded transition-colors"
                      title="Hapus kategori"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new category */}
              <div className="border-t border-[#E6DFD5] pt-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F6D] mb-2">
                  Tambah Kategori Baru
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory(); } }}
                    placeholder="Nama kategori baru..."
                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] text-[#3C2F2F]"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-2 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── LOCK / PASSWORD MODAL ─── */}
      <AnimatePresence>
        {lockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setLockModalOpen(false); setPendingNoteId(null); }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex flex-col items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
                  <ShieldAlert className="h-7 w-7 text-amber-600" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif font-bold text-base text-[#3C2F2F]">
                    Catatan Rahasia 🔒
                  </h3>
                  <p className="text-xs text-[#7A6F6D] mt-1">
                    Masukkan password untuk membuka catatan ini
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
                    placeholder="Masukkan password..."
                    autoFocus
                    className={`w-full py-2.5 pl-4 pr-10 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      passwordError
                        ? "border-red-400 focus:ring-red-200"
                        : "border-[#DCd4c6] focus:ring-[#A07855]/30 focus:border-[#A07855]"
                    } text-[#3C2F2F] placeholder-[#C0B8AD]`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-2.5 text-[#A89F95] hover:text-[#5C4B40] transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {passwordError && (
                    <motion.p
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: [0, -6, 6, -6, 6, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-xs text-red-600 font-medium flex items-center gap-1"
                    >
                      ❌ {passwordError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setLockModalOpen(false); setPendingNoteId(null); setPasswordError(""); }}
                    className="flex-1 py-2 px-4 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] text-xs font-semibold rounded-xl text-[#5C4B40] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] text-[#F8F4EE] text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <LockOpen className="h-3 w-3" /> Buka
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
