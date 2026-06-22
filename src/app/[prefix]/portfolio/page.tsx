"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit, Save, ExternalLink, ArrowLeft, 
  Image as ImageIcon, Loader2, Sparkles, AlertCircle, CheckCircle, 
  Search, X, ExternalLink as VisitIcon, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PortfolioItem {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  tag: string;
  category: string;
  description: string;
  img: string;
  link?: string;
  github?: string;
}

const CATEGORY_SUGGESTIONS = [
  "E-Commerce", "F&B", "Retail", "Education", "Media", 
  "Company Profile", "Travel Umroh", "Otomotif", "Platform", "Lainnya"
];

export default function PortfolioAdminWorkspace() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  // Auth states
  const [userId, setUserId] = useState<string>("madk");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data states
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Company Profile");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [formTag, setFormTag] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formGithub, setFormGithub] = useState("");
  const [formDesc, setFormDesc] = useState("");
  
  // Image states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  // Confirm delete state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Alert banner states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Verify auth
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prefix tidak dikenal → 404 (jangan bocorkan keberadaan /madk)
    const VALID_PREFIXES = ["madk"];
    if (!VALID_PREFIXES.includes(prefix)) {
      router.replace("/not-found");
      return;
    }

    let validSession: string | null = null;

    try {
      const session = localStorage.getItem("luma_session");
      if (!session || prefix !== session) {
        router.replace(`/workspace/login`);
        return;
      }
      validSession = session;
    } catch {
      // localStorage blocked (incognito / browser policy) — go to login
      router.replace(`/workspace/login`);
      return;
    }

    if (validSession) {
      setUserId(validSession);
      setIsAuthenticated(true);
      loadPortfolios(validSession);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, prefix]);

  // Load portfolios
  const loadPortfolios = async (user: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .eq("user_id", user)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setItems(data.map((p) => ({
          id: p.id,
          created_at: p.created_at,
          user_id: p.user_id,
          title: p.title,
          tag: p.tag || "",
          category: p.category,
          description: p.description,
          img: p.img,
          link: p.link || "",
          github: p.github || "",
        })));
      }
    } catch (err) {
      console.error("Gagal memuat portofolio:", err);
      showToast("Gagal memuat portofolio", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper to compress image client-side to target limit
  const compressImage = (file: File, limit: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Aggressively scale dimension based on file size ratio
          // e.g. 2.6MB -> 100KB = ratio 0.038, sqrt = 0.195, *1.3 = 0.254
          const ratio = limit / file.size;
          const scaleFactor = Math.min(1, Math.sqrt(ratio) * 1.3);

          const canvas = document.createElement("canvas");
          let width = Math.round(img.width * scaleFactor);
          let height = Math.round(img.height * scaleFactor);

          // Hard cap at 1280px on longest side
          const MAX_DIM = 1280;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          // Minimum size guard
          width = Math.max(width, 80);
          height = Math.max(height, 80);

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context error"));
            return;
          }

          // Fill white background to handle transparent PNGs
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Try qualities in fine steps until blob fits under limit
          const qualities = [0.85, 0.72, 0.60, 0.50, 0.40, 0.30, 0.22, 0.15, 0.08];
          let qIdx = 0;

          const tryNextQuality = () => {
            const q = qIdx < qualities.length ? qualities[qIdx] : 0.05;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Canvas toBlob failed"));
                  return;
                }
                if (blob.size <= limit || qIdx >= qualities.length) {
                  const compressedFile = new File(
                    [blob],
                    file.name.replace(/\.[^/.]+$/, "") + ".jpg",
                    { type: "image/jpeg", lastModified: Date.now() }
                  );
                  resolve(compressedFile);
                } else {
                  qIdx++;
                  tryNextQuality();
                }
              },
              "image/jpeg",
              q
            );
          };

          tryNextQuality();
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };


  // Handle file input & compress if > 100KB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const limit = 100 * 1024; // 100KB
    if (file.size > limit) {
      setIsCompressing(true);
      setCompressionInfo("Sedang mengompres gambar agar di bawah 100 KB...");
      setFileError(null);
      
      try {
        const compressed = await compressImage(file, limit);
        setSelectedFile(compressed);
        setCompressionInfo(
          `Gambar berhasil dikompres: dari ${(file.size / 1024).toFixed(1)} KB menjadi ${(compressed.size / 1024).toFixed(1)} KB!`
        );
        
        // Show preview of compressed image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error("Compression error:", err);
        setFileError("Gagal mengompres gambar otomatis. Silakan pilih gambar lain.");
        setSelectedFile(null);
        setPreviewUrl(null);
      } finally {
        setIsCompressing(false);
      }
    } else {
      setFileError(null);
      setCompressionInfo(null);
      setSelectedFile(file);
      
      // Create local preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("Company Profile");
    setCustomCategory("");
    setIsCustomCategory(false);
    setFormTag("");
    setFormLink("");
    setFormGithub("");
    setFormDesc("");
    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(null);
    setCompressionInfo(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    
    if (CATEGORY_SUGGESTIONS.includes(item.category)) {
      setFormCategory(item.category);
      setIsCustomCategory(false);
    } else {
      setFormCategory("Lainnya");
      setCustomCategory(item.category);
      setIsCustomCategory(true);
    }
    
    setFormTag(item.tag);
    setFormLink(item.link || "");
    setFormGithub(item.github || "");
    setFormDesc(item.description);
    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(item.img);
    setIsModalOpen(true);
  };

  // Form submission: handles storage upload and database saves
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    // Determine final category
    const finalCategory = isCustomCategory ? customCategory.trim() : formCategory;
    if (!finalCategory) {
      showToast("Kategori harus dipilih atau diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImgUrl = editingItem ? editingItem.img : "";

      // Upload file to Supabase storage if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop() || "png";
        const randomName = `${Math.random().toString(36).substring(7)}`;
        const fileName = `${userId}_portfolio_${Date.now()}_${randomName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("portfolios")
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error("Gagal mengunggah foto ke storage: " + uploadError.message);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("portfolios")
          .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error("Gagal mendapatkan URL publik untuk foto.");
        }

        finalImgUrl = publicUrlData.publicUrl;
      } else if (!editingItem) {
        throw new Error("Foto portofolio wajib diunggah untuk portofolio baru.");
      }

      // Save to database
      const dbPayload = {
        user_id: userId,
        title: formTitle.trim(),
        tag: formTag.trim() || finalCategory,
        category: finalCategory,
        description: formDesc.trim(),
        img: finalImgUrl,
        link: formLink.trim() || null,
        github: formGithub.trim() || null,
      };

      if (editingItem) {
        // Update record
        const { error: dbError } = await supabase
          .from("portfolios")
          .update(dbPayload)
          .eq("id", editingItem.id);

        if (dbError) throw dbError;
        showToast("Portofolio berhasil diperbarui", "success");
      } else {
        // Insert record
        const { error: dbError } = await supabase
          .from("portfolios")
          .insert([dbPayload]);

        if (dbError) throw dbError;
        showToast("Portofolio baru berhasil ditambahkan", "success");
      }

      // Refresh list and close modal
      loadPortfolios(userId);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      showToast(err instanceof Error ? err.message : "Gagal menyimpan portofolio", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteItem = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      // Find item to delete to clean up its storage file if uploaded
      const target = items.find(item => item.id === deleteTargetId);
      
      // Delete database record first
      const { error: dbError } = await supabase
        .from("portfolios")
        .delete()
        .eq("id", deleteTargetId);

      if (dbError) throw dbError;

      // Clean up storage if it was uploaded to our portfolios bucket
      if (target && target.img.includes("/storage/v1/object/public/portfolios/")) {
        try {
          const parts = target.img.split("/portfolios/");
          const fileName = parts.pop();
          if (fileName) {
            await supabase.storage.from("portfolios").remove([fileName]);
          }
        } catch (storageErr) {
          console.error("Gagal menghapus file dari storage (opsional):", storageErr);
        }
      }

      showToast("Portofolio berhasil dihapus", "success");
      loadPortfolios(userId);
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Gagal menghapus portofolio", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter items based on search input
  const filteredItems = items.filter(item => {
    const term = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      (item.tag && item.tag.toLowerCase().includes(term))
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F4EE]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#5C4B40] animate-spin" />
          <p className="text-sm text-[#7A6F6D] font-medium tracking-wide">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#4A3E3D] font-sans pb-16 relative overflow-hidden">
      
      {/* Glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2D5BFF]/[0.02] rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/[0.02] rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Nav Header */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E6DFD5] px-6 py-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push(`/${prefix}/note`)}
            className="p-2 hover:bg-[#EFEAE2] rounded-xl text-[#7A6F6D] hover:text-[#4A3E3D] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#3C2F2F] tracking-tight">Portofolio Admin</h1>
            <p className="text-[11px] text-[#A89F95] uppercase tracking-wider font-semibold">Workspace: {prefix}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href="/portfolio" 
            target="_blank" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6F0] border border-[#DCd4c6] hover:bg-white text-xs font-semibold text-[#A07855] rounded-xl transition-all shadow-sm"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Lihat Hasil Live
          </a>
        </div>
      </nav>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 border ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 pt-8">
        
        {/* Title area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#3C2F2F] tracking-tight flex items-center gap-2">
              Koleksi Portofolio Kustom <Sparkles className="h-6 w-6 text-[#A07855]" />
            </h2>
            <p className="text-sm text-[#7A6F6D] mt-1 max-w-xl">
              Tambah, edit, dan hapus portofolio Anda secara realtime. Data yang Anda buat akan langsung tampil di halaman portofolio utama.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#5C4B40] hover:bg-[#4A3C33] active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-md self-start md:self-auto shrink-0"
          >
            <Plus className="h-5 w-5" /> Tambah Baru
          </button>
        </div>

        {/* Dashboard stats & search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E6DFD5] p-5 rounded-2.5xl shadow-soft">
            <h4 className="text-xs font-bold text-[#A89F95] uppercase tracking-wider mb-1">Total Portofolio Kustom</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#3C2F2F]">{items.length}</span>
              <span className="text-xs text-[#7A6F6D]">item tersimpan</span>
            </div>
          </div>
          
          <div className="bg-white border border-[#E6DFD5] p-5 rounded-2.5xl shadow-soft col-span-2 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A89F95]" />
              <input
                type="text"
                placeholder="Cari nama project, kategori, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[#EFEAE2] rounded-full text-[#A89F95]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List of items */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#E6DFD5] rounded-2.5xl shadow-soft gap-4">
            <Loader2 className="w-10 h-10 text-[#A07855] animate-spin" />
            <p className="text-sm font-semibold text-[#7A6F6D]">Mengunduh daftar portofolio...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-[#E6DFD5] rounded-2.5xl shadow-soft">
            <div className="w-16 h-16 bg-[#FAF6F0] border border-[#DCd4c6] rounded-2.5xl flex items-center justify-center mb-4 text-[#A89F95]">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-[#3C2F2F] mb-1">
              {searchQuery ? "Tidak menemukan hasil pencarian" : "Belum Ada Portofolio Kustom"}
            </h3>
            <p className="text-sm text-[#7A6F6D] max-w-sm mb-6 leading-relaxed">
              {searchQuery 
                ? "Cobalah mencari dengan kata kunci lain atau bersihkan input pencarian." 
                : "Unggah karya terbaik Anda hari ini. Pastikan foto portofolio maksimal berukuran 100 KB."}
            </p>
            {!searchQuery && (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#A07855] hover:bg-[#8C6747] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Buat Portofolio Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#E6DFD5] rounded-2.5xl overflow-hidden shadow-soft group hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo area */}
                  <div className="aspect-[16/10] bg-[#FAF6F0] relative overflow-hidden border-b border-[#E6DFD5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </div>
                  </div>

                  {/* Text area */}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#A07855] bg-[#FAF6F0] border border-[#DCd4c6] px-2.5 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[#3C2F2F] tracking-tight line-clamp-1 mb-2 group-hover:text-[#A07855] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#7A6F6D] font-medium leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-[#FAF6F0] bg-[#FAF6F0]/30 flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 bg-white hover:bg-emerald-50 text-[#7A6F6D] hover:text-emerald-600 rounded-lg border border-[#E6DFD5] transition-colors"
                        title="Buka Website"
                      >
                        <VisitIcon className="h-4 w-4" />
                      </a>
                    )}
                    {item.github && (
                      <a 
                        href={item.github} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 bg-white hover:bg-slate-50 text-[#7A6F6D] hover:text-slate-800 rounded-lg border border-[#E6DFD5] transition-colors"
                        title="Buka GitHub"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E6DFD5] hover:bg-[#EFEAE2] rounded-lg text-xs font-bold text-[#5C4B40] transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </main>

      {/* --- ADD / EDIT DIALOG MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto pt-10 pb-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSubmitting) setIsModalOpen(false); }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-[#E6DFD5] rounded-3xl shadow-premium w-full max-w-2xl relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-[#FAF6F0] px-6 py-4 border-b border-[#E6DFD5] flex justify-between items-center">
                <h3 className="font-bold text-lg text-[#3C2F2F] tracking-tight">
                  {editingItem ? "Edit Portofolio" : "Tambah Portofolio Baru"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 hover:bg-[#EFEAE2] rounded-full text-[#A89F95] hover:text-[#5C4B40] transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* Form fields grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Nama Project / Judul *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ayam Geprek Luma"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Label Tag (Sub-Info)</label>
                    <input
                      type="text"
                      placeholder="Contoh: F&B - UMKM"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Kategori *</label>
                    <div className="flex gap-2">
                      <select
                        value={isCustomCategory ? "Custom" : formCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "Custom") {
                            setIsCustomCategory(true);
                          } else {
                            setIsCustomCategory(false);
                            setFormCategory(val);
                          }
                        }}
                        className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                      >
                        {CATEGORY_SUGGESTIONS.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Custom">+ Kategori Custom</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Category Input if selected */}
                  <div>
                    {isCustomCategory ? (
                      <>
                        <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Tulis Kategori Custom *</label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan kategori custom..."
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                        />
                      </>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Metode Kategori</label>
                        <div className="text-xs text-[#7A6F6D] pt-2.5 font-medium flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-emerald-500" /> Menggunakan kategori standar.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Link Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Link Github (Opsional)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={formGithub}
                      onChange={(e) => setFormGithub(e.target.value)}
                      className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">Deskripsi Project *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis deskripsi detail tentang apa yang dikerjakan di project ini..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#DCd4c6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#A07855] text-[#4A3E3D] font-sans resize-y"
                  />
                </div>

                {/* Upload Image Section */}
                <div>
                  <label className="block text-xs font-bold text-[#5C4B40] mb-1.5 uppercase tracking-wider">
                    Upload Foto Project * <span className="text-[#A07855] font-normal">(Maksimal 100 KB)</span>
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Preview circle/box */}
                    <div className="w-32 h-20 bg-[#FAF6F0] rounded-xl border border-[#DCd4c6] overflow-hidden flex items-center justify-center shrink-0">
                      {previewUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover object-top" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-[#A89F95]" />
                      )}
                    </div>

                    <div className="w-full">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        required={!editingItem}
                        className="block w-full text-xs text-[#7A6F6D] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#A07855]/10 file:text-[#A07855] hover:file:bg-[#A07855]/20 cursor-pointer"
                      />
                      
                      {/* Size warning / compression status / file name info */}
                      {isCompressing ? (
                        <div className="mt-2 text-xs text-[#A07855] font-semibold flex items-center gap-1.5 animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {compressionInfo}
                        </div>
                      ) : fileError ? (
                        <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fileError}
                        </div>
                      ) : compressionInfo ? (
                        <div className="mt-2 text-xs text-emerald-600 font-semibold flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> {compressionInfo}
                          </div>
                          <span className="text-[10px] text-[#7A6F6D]">Gambar berhasil dikompresi ke JPEG agar pas dengan limit 100 KB.</span>
                        </div>
                      ) : selectedFile ? (
                        <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Ukuran sesuai: {(selectedFile.size / 1024).toFixed(1)} KB. Siap unggah.
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-[#A89F95] leading-normal">
                          Gunakan format JPG, PNG, GIF, atau WebP. Gambar secara otomatis diunggah ke Supabase Storage.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#E6DFD5]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 border border-[#DCd4c6] hover:bg-[#FAF6F0] text-sm font-bold text-[#5C4B40] rounded-xl transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!fileError || (!selectedFile && !editingItem)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#5C4B40] hover:bg-[#4A3C33] text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Simpan Portofolio
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isDeleting) setDeleteTargetId(null); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E6DFD5] rounded-2.5xl p-6 shadow-premium w-full max-w-sm relative z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#3C2F2F] mb-2">Hapus Portofolio?</h3>
              <p className="text-xs text-[#7A6F6D] mb-6 leading-relaxed">
                Tindakan ini permanen. Portofolio kustom ini beserta file gambar yang diunggah akan dihapus selamanya dari Supabase.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 border border-[#DCd4c6] hover:bg-[#FAF6F0] text-xs font-bold text-[#5C4B40] rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menghapus...
                    </>
                  ) : (
                    "Hapus Permanen"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
