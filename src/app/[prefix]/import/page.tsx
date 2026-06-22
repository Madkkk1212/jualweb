"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Building2,
  Download,
  Search,
  Trash2,
  Loader2,
  ArrowLeft,
  Menu,
  X,
  Globe,
  Instagram,
  Facebook,
  Phone,
  FileText,
  Database,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

// Interfaces
interface UploadHistory {
  id: string;
  created_at: string;
  filename: string;
  file_url: string;
  status: string;
  total_rows: number;
  processed_rows: number;
  duplicate_rows: number;
}

interface Business {
  id: string;
  created_at: string;
  upload_id: string;
  name: string;
  contact_name: string;
  category: string;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  has_website: boolean;
  phone: string | null;
  phone_type: string | null; // 'seluler' or 'daerah'
  address: string;
  street: string;
  district: string;
  city: string;
  province: string;
}

interface LogEntry {
  id: string;
  created_at: string;
  log_level: "info" | "warning" | "error";
  message: string;
}

export default function ImportBisnisWorkspace() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  // Auth & User State
  const [userId, setUserId] = useState<string>("madk");
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  // "import" | "all" | "has_website" | "no_website" | "has_ig" | "has_fb" | "mobile" | "landline" | "history"
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [uploads, setUploads] = useState<UploadHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [paginationPage, setPaginationPage] = useState(1);
  const itemsPerPage = 20;

  // Upload/Import States
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseProgress, setParseProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importCategory, setImportCategory] = useState("Umum");
  const [contactCategories, setContactCategories] = useState<string[]>(["Umum", "Travel", "Jual Buku", "Klien", "Supplier", "Teman", "Keluarga"]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logs Modal / View State for selected upload
  const [viewingLogsUploadId, setViewingLogsUploadId] = useState<string | null>(null);
  const [uploadLogs, setUploadLogs] = useState<LogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Check auth session
  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = localStorage.getItem("luma_session");
    if (!session) {
      router.replace(`/workspace/login`);
      return;
    }

    if (prefix !== session) {
      router.replace(`/${session}/import`);
      return;
    }

    setUserId(session);
    loadAllData(session);
  }, [router, prefix]);

  // Handle screen resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch initial data
  const loadAllData = async (user: string) => {
    setIsLoading(true);
    try {
      const [bizRes, uploadsRes, catsRes] = await Promise.all([
        supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user)
          .order("created_at", { ascending: false }),
        supabase
          .from("uploads")
          .select("*")
          .eq("user_id", user)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_categories")
          .select("*")
          .eq("user_id", user)
          .eq("type", "contacts")
      ]);

      if (bizRes.data) setBusinesses(bizRes.data);
      if (uploadsRes.data) setUploads(uploadsRes.data);
      if (catsRes.data && catsRes.data.length > 0) {
        const catData = catsRes.data[0];
        if (catData.categories?.length) {
          setContactCategories(catData.categories);
        }
      }
    } catch (err) {
      console.error("Gagal memuat data Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Log message helper during import
  const logProcess = async (uploadId: string, level: "info" | "warning" | "error", message: string) => {
    const timeStr = new Date().toLocaleTimeString("id-ID");
    const fullMsg = `[${timeStr}] ${message}`;
    setImportLogs(prev => [fullMsg, ...prev]);

    try {
      await supabase.from("processing_logs").insert({
        upload_id: uploadId,
        user_id: userId,
        log_level: level,
        message: fullMsg
      });
    } catch (e) {
      console.error("Gagal menyimpan log:", e);
    }
  };

  // Clean and Classify Phone
  const cleanAndClassifyPhone = (phoneStr: unknown) => {
    if (!phoneStr) return { cleaned: null, type: null };
    const str = String(phoneStr).trim();
    if (str === "" || str === "—" || str === "-") {
      return { cleaned: null, type: null };
    }

    // Clean space, dashes, parentheses
    const digitsOnly = str.replace(/[\s\-\(\)\+]/g, "");

    // Check mobile prefixes (Indonesia: starting with 628, 08, or 8)
    if (/^(628|08|8)\d{8,12}$/.test(digitsOnly)) {
      return { cleaned: str, type: "seluler" };
    }
    return { cleaned: str, type: "daerah" };
  };

  // Indonesian Address Parser
  const parseAddress = (addressStr: unknown) => {
    let street = "";
    let district = "";
    let city = "";
    let province = "";

    if (!addressStr) return { street, district, city, province };
    const cleanAddr = String(addressStr).trim();

    const parts = cleanAddr.split(",").map(p => p.trim());

    // 1. Find Kecamatan
    const districtIdx = parts.findIndex(p => /^(kec\.|kecamatan)\s+/i.test(p));
    if (districtIdx !== -1) {
      district = parts[districtIdx].replace(/^(kec\.|kecamatan)\s+/i, "").trim();
    }

    // 2. Find Kota/Kabupaten
    const cityIdx = parts.findIndex(p => /^(kota|kab\.|kabupaten)\s+/i.test(p));
    if (cityIdx !== -1) {
      city = parts[cityIdx].trim();
    }

    // 3. Find Province
    let provincePart = "";
    if (cityIdx !== -1 && cityIdx < parts.length - 1) {
      provincePart = parts[cityIdx + 1];
    } else if (districtIdx !== -1 && districtIdx < parts.length - 1 && districtIdx !== cityIdx) {
      provincePart = parts[districtIdx + 1];
    } else if (parts.length > 1) {
      provincePart = parts[parts.length - 1];
    }

    if (provincePart) {
      province = provincePart.replace(/\s+\d{5}$/, "").trim(); // strip zip code
      if (/^(kota|kab\.|kabupaten)\s+/i.test(province)) {
        province = "";
      }
    }

    // 4. Street (parts before district or city)
    let stopIdx = parts.length;
    if (districtIdx !== -1) stopIdx = Math.min(stopIdx, districtIdx);
    if (cityIdx !== -1) stopIdx = Math.min(stopIdx, cityIdx);

    if (stopIdx > 0) {
      street = parts.slice(0, stopIdx).join(", ").trim();
    } else {
      street = cleanAddr;
    }

    return { street, district, city, province };
  };

  // Import handler
  const handleImportFile = async (file: File) => {
    if (isImporting) return;
    setIsImporting(true);
    setUploadProgress(0);
    setParseProgress(0);
    setImportLogs([]);

    let uploadRecordId = "";

    try {
      // 1. Create Upload Record in Database (without file_url since it's client-only read)
      const { data: uploadRec, error: uploadRecErr } = await supabase
        .from("uploads")
        .insert({
          user_id: userId,
          filename: file.name,
          status: "processing"
        })
        .select()
        .single();

      if (uploadRecErr || !uploadRec) {
        throw new Error(`Gagal membuat riwayat upload: ${uploadRecErr?.message}`);
      }
      uploadRecordId = uploadRec.id;

      await logProcess(uploadRecordId, "info", `Memulai proses membaca berkas '${file.name}' secara lokal`);

      // Set progress to 50% while reading
      setUploadProgress(50);

      // Parse spreadsheet directly using SheetJS from local file array buffer
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      setUploadProgress(100);
      await logProcess(uploadRecordId, "info", "Berkas berhasil dibaca secara lokal. Mulai mengekstrak data...");
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON row arrays (raw formats)
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
      if (rawRows.length <= 1) {
        throw new Error("File kosong atau tidak memiliki baris data (kecuali header).");
      }

      const headers: string[] = (rawRows[0] as unknown[]).map((header: unknown) => String(header).trim().toLowerCase());
      const dataRows = rawRows.slice(1);

      await logProcess(uploadRecordId, "info", `Menemukan ${dataRows.length} baris data untuk diimpor.`);

      // Map columns indexes dynamically
      // Map columns indexes dynamically
      const colMap = {
        name: headers.findIndex(col => col.includes("nama bisnis") || col === "name" || col === "nama"),
        contact: headers.findIndex(col => col.includes("nama kontak") || col === "contact" || col === "kontak" || col === "contact person"),
        category: headers.findIndex(col => col === "kategori" || col === "category"),
        ig: headers.findIndex(col => col === "instagram" || col === "ig"),
        fb: headers.findIndex(col => col === "facebook" || col === "fb"),
        web: headers.findIndex(col => col === "website" || col === "web"),
        phone: headers.findIndex(col => col === "telepon" || col === "phone" || col === "telp" || col === "telepon bisnis"),
        address: headers.findIndex(col => col === "alamat" || col === "address")
      };

      if (colMap.name === -1) {
        throw new Error("Kolom 'Nama Bisnis' tidak ditemukan di file. Pastikan kolom header benar.");
      }

      // 4. Fetch existing businesses for duplicate check (in-memory hash set)
      await logProcess(uploadRecordId, "info", "Mengambil data bisnis yang sudah ada untuk pengecekan duplikat...");
      const { data: existingBiz, error: existErr } = await supabase
        .from("businesses")
        .select("name, phone, website")
        .eq("user_id", userId);

      if (existErr) {
        throw new Error(`Gagal memvalidasi duplikasi di database: ${existErr.message}`);
      }

      const existingNames = new Set(existingBiz?.map(b => b.name.toLowerCase().trim()) || []);
      const existingPhones = new Set(
        existingBiz?.map(b => b.phone?.replace(/[\s\-\(\)\+]/g, "")).filter(Boolean) || []
      );
      const existingWebsites = new Set(
        existingBiz?.map(b => b.website?.toLowerCase().trim()).filter(Boolean) || []
      );

      const businessesToInsert: Record<string, unknown>[] = [];
      let dupCount = 0;
      let skippedCount = 0;

      await logProcess(uploadRecordId, "info", "Mulai memproses baris data...");

      // Update upload total rows count
      await supabase
        .from("uploads")
        .update({ total_rows: dataRows.length })
        .eq("id", uploadRecordId);

      // Iterate and check
      for (let idx = 0; idx < dataRows.length; idx++) {
        const row = dataRows[idx] as (string | number | boolean | null | undefined)[];
        const rowName = colMap.name !== -1 && row[colMap.name] ? String(row[colMap.name]).trim() : "";
        
        if (!rowName) {
          skippedCount++;
          await logProcess(uploadRecordId, "warning", `Baris ${idx + 2}: Dilewati karena Nama Bisnis kosong.`);
          continue;
        }

        const rawContact = colMap.contact !== -1 && row[colMap.contact] ? String(row[colMap.contact]).trim() : "";
        const rawCategory = importCategory.trim() || "Umum";
        const rawIg = colMap.ig !== -1 && row[colMap.ig] ? String(row[colMap.ig]).trim() : "";
        const rawFb = colMap.fb !== -1 && row[colMap.fb] ? String(row[colMap.fb]).trim() : "";
        const rawWeb = colMap.web !== -1 && row[colMap.web] ? String(row[colMap.web]).trim() : "";
        const rawPhone = colMap.phone !== -1 && row[colMap.phone] ? String(row[colMap.phone]).trim() : "";
        const rawAddress = colMap.address !== -1 && row[colMap.address] ? String(row[colMap.address]).trim() : "";

        // Check duplicate values
        const cleanName = rowName.toLowerCase().trim();
        const { cleaned: cleanPhone, type: phoneType } = cleanAndClassifyPhone(rawPhone);
        const cleanWeb = rawWeb && rawWeb !== "—" && rawWeb !== "-" ? rawWeb.trim() : null;

        let isDuplicate = false;
        let duplicateField = "";

        if (existingNames.has(cleanName)) {
          isDuplicate = true;
          duplicateField = "Nama Bisnis";
        } else if (cleanPhone && existingPhones.has(cleanPhone.replace(/[\s\-\(\)\+]/g, ""))) {
          isDuplicate = true;
          duplicateField = "Nomor Telepon";
        } else if (cleanWeb && existingWebsites.has(cleanWeb.toLowerCase().trim())) {
          isDuplicate = true;
          duplicateField = "Website";
        }

        if (isDuplicate) {
          dupCount++;
          await logProcess(
            uploadRecordId,
            "warning",
            `Baris ${idx + 2}: Melewati '${rowName}' karena duplikat ${duplicateField} dengan data yang sudah ada.`
          );
          continue;
        }

        // Add to local checking set so we block duplicate rows inside the same file upload!
        existingNames.add(cleanName);
        if (cleanPhone) existingPhones.add(cleanPhone.replace(/[\s\-\(\)\+]/g, ""));
        if (cleanWeb) existingWebsites.add(cleanWeb.toLowerCase().trim());

        // Parse address
        const { street, district, city, province } = parseAddress(rawAddress);

        // Social media cleanup
        const instagram = rawIg && rawIg !== "—" && rawIg !== "-" ? rawIg : null;
        const facebook = rawFb && rawFb !== "—" && rawFb !== "-" ? rawFb : null;
        const website = cleanWeb;
        const has_website = !!website;

        businessesToInsert.push({
          upload_id: uploadRecordId,
          user_id: userId,
          name: rowName,
          contact_name: rawContact,
          category: rawCategory,
          instagram,
          facebook,
          website,
          has_website,
          phone: cleanPhone,
          phone_type: phoneType,
          address: rawAddress,
          street,
          district,
          city,
          province
        });
      }

      await logProcess(
        uploadRecordId,
        "info",
        `Pemeriksaan duplikasi selesai. ${businessesToInsert.length} baris valid, ${dupCount} duplikat dilewati, ${skippedCount} kosong.`
      );

      // 5. Bulk insert businesses in chunks
      const chunkSize = 100;
      for (let i = 0; i < businessesToInsert.length; i += chunkSize) {
        const chunk = businessesToInsert.slice(i, i + chunkSize);
        const { error: insertErr } = await supabase.from("businesses").insert(chunk);
        
        if (insertErr) {
          throw new Error(`Gagal menyimpan data bisnis ke database: ${insertErr.message}`);
        }

        const processed = Math.min(i + chunkSize, businessesToInsert.length);
        setParseProgress(Math.round((processed / businessesToInsert.length) * 100));

        await supabase
          .from("uploads")
          .update({
            processed_rows: processed,
            duplicate_rows: dupCount
          })
          .eq("id", uploadRecordId);
      }

      // Success finished
      await supabase
        .from("uploads")
        .update({ status: "completed" })
        .eq("id", uploadRecordId);

      await logProcess(uploadRecordId, "info", `Seluruh proses impor sukses! Berhasil menambahkan ${businessesToInsert.length} bisnis baru.`);
      setParseProgress(100);

      // Refresh list
      loadAllData(userId);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (uploadRecordId) {
        await logProcess(uploadRecordId, "error", `Impor gagal: ${errMsg}`);
        await supabase
          .from("uploads")
          .update({ status: "failed" })
          .eq("id", uploadRecordId);
      }
      alert(`Gagal memproses file: ${errMsg}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Delete business
  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("Hapus data bisnis ini?")) return;
    setBusinesses(prev => prev.filter(b => b.id !== id));
    if (selectedBusinesses.has(id)) {
      const newSet = new Set(selectedBusinesses);
      newSet.delete(id);
      setSelectedBusinesses(newSet);
    }
    await supabase.from("businesses").delete().eq("id", id).eq("user_id", userId);
  };

  const handleSelectBusiness = (id: string) => {
    const newSet = new Set(selectedBusinesses);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBusinesses(newSet);
  };

  const handleSelectAllFiltered = () => {
    const pageIds = paginatedBusinesses.map(b => b.id);
    const allPageSelected = pageIds.every(id => selectedBusinesses.has(id));
    
    const newSet = new Set(selectedBusinesses);
    if (allPageSelected) {
      pageIds.forEach(id => newSet.delete(id));
    } else {
      pageIds.forEach(id => newSet.add(id));
    }
    setSelectedBusinesses(newSet);
  };

  const handleBulkDelete = async () => {
    const count = selectedBusinesses.size;
    if (count === 0) return;
    if (!confirm(`Hapus ${count} data bisnis terpilih secara permanen?`)) return;

    setIsLoading(true);
    try {
      const idsToDelete = Array.from(selectedBusinesses);
      const { error } = await supabase
        .from("businesses")
        .delete()
        .in("id", idsToDelete);

      if (error) {
        throw new Error(error.message);
      }

      // Success
      setBusinesses(prev => prev.filter(b => !selectedBusinesses.has(b.id)));
      setSelectedBusinesses(new Set());
      alert(`Berhasil menghapus ${count} data bisnis.`);
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete upload history
  const handleDeleteUpload = async (id: string) => {
    if (!confirm("Hapus riwayat upload ini? Menghapus riwayat ini juga akan menghapus seluruh data bisnis yang dimasukkan dalam sesi impor ini.")) return;
    setUploads(prev => prev.filter(u => u.id !== id));
    // Businesses cascade delete automatically if referencing upload_id with ON DELETE CASCADE
    setBusinesses(prev => prev.filter(b => b.upload_id !== id));
    await supabase.from("uploads").delete().eq("id", id).eq("user_id", userId);
  };

  // View Import Logs
  const handleViewLogs = async (uploadId: string) => {
    setViewingLogsUploadId(uploadId);
    setLoadingLogs(true);
    setUploadLogs([]);
    try {
      const { data } = await supabase
        .from("processing_logs")
        .select("*")
        .eq("upload_id", uploadId)
        .order("created_at", { ascending: false });

      if (data) setUploadLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Export to Excel / CSV using SheetJS
  const handleExportData = (dataToExport: Business[], type: "xlsx" | "csv") => {
    if (dataToExport.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const exportRows = dataToExport.map((row, idx) => ({
      "No": idx + 1,
      "Nama Bisnis": row.name,
      "Nama Kontak": row.contact_name || "",
      "Instagram": row.instagram || "",
      "Facebook": row.facebook || "",
      "Website": row.website || "",
      "Nomor Telepon": row.phone || "",
      "Tipe Telepon": row.phone_type === "seluler" ? "Seluler" : row.phone_type === "daerah" ? "Nomor Daerah" : "",
      "Alamat Lengkap": row.address || "",
      "Jalan": row.street || "",
      "Kecamatan": row.district || "",
      "Kota/Kabupaten": row.city || "",
      "Provinsi": row.province || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Bisnis");

    if (type === "xlsx") {
      XLSX.writeFile(workbook, `data_bisnis_${prefix}_${Date.now()}.xlsx`);
    } else {
      // Export as CSV
      XLSX.writeFile(workbook, `data_bisnis_${prefix}_${Date.now()}.csv`, { bookType: "csv" });
    }
  };

  // Drag-and-drop file uploader handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImportFile(e.target.files[0]);
    }
  };

  // --- Calculations & Filters ---
  // Stats Counters
  const totalBisnis = businesses.length;
  const totalHasWeb = businesses.filter(b => b.has_website).length;
  const totalNoWeb = totalBisnis - totalHasWeb;
  const totalIg = businesses.filter(b => b.instagram && b.instagram !== "—").length;
  const totalFb = businesses.filter(b => b.facebook && b.facebook !== "—").length;
  const totalMobile = businesses.filter(b => b.phone_type === "seluler").length;
  const totalLandline = businesses.filter(b => b.phone_type === "daerah").length;

  // Filter dynamic list of cities & categories
  const uniqueCities = Array.from(new Set(businesses.map(b => b.city).filter(Boolean))).sort() as string[];
  const uniqueCategories = Array.from(new Set(businesses.map(b => b.category).filter(Boolean))).sort() as string[];

  // Filtered rows display logic
  const filteredBusinesses = businesses.filter(b => {
    const cleanSearch = searchQuery.toLowerCase().trim();
    const matchSearch =
      b.name.toLowerCase().includes(cleanSearch) ||
      (b.contact_name || "").toLowerCase().includes(cleanSearch) ||
      (b.phone || "").includes(cleanSearch);

    const matchCity = selectedCity ? b.city === selectedCity : true;
    const matchCategory = selectedCategory ? b.category === selectedCategory : true;

    // Filter dynamic menu routes
    if (activeTab === "has_website") return matchSearch && matchCity && matchCategory && b.has_website;
    if (activeTab === "no_website") return matchSearch && matchCity && matchCategory && !b.has_website;
    if (activeTab === "has_ig") return matchSearch && matchCity && matchCategory && b.instagram && b.instagram !== "—";
    if (activeTab === "has_fb") return matchSearch && matchCity && matchCategory && b.facebook && b.facebook !== "—";
    if (activeTab === "mobile") return matchSearch && matchCity && matchCategory && b.phone_type === "seluler";
    if (activeTab === "landline") return matchSearch && matchCity && matchCategory && b.phone_type === "daerah";

    return matchSearch && matchCity && matchCategory;
  });

  // Pagination calculations
  const totalFiltered = filteredBusinesses.length;
  const totalPages = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const paginatedBusinesses = filteredBusinesses.slice(
    (paginationPage - 1) * itemsPerPage,
    paginationPage * itemsPerPage
  );

  // Set page back to 1 if search/filter changes
  useEffect(() => {
    setPaginationPage(1);
  }, [searchQuery, selectedCity, selectedCategory, activeTab]);

  return (
    <div className="flex h-screen bg-[#F8F4EE] overflow-hidden font-sans relative text-[#4A3E3D]">
      
      {/* ─── LOADING MASK ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#FAF6F0] flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[#A07855]" />
            <span className="text-[#7A6F6D] text-sm font-semibold">Memuat Data Bisnis...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR NAVIGATION ─── */}
      <div
        className={`w-[250px] bg-[#FAF6F0] border-r border-[#DCd4c6] flex flex-col h-full z-40 flex-shrink-0 absolute md:relative transition-all duration-300 ${
          sidebarOpen ? "left-0" : "-left-[250px] md:left-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/${prefix}/note`)}
              className="p-1.5 bg-white rounded-lg border border-[#DCd4c6] text-[#7A6F6D] hover:text-[#4A3E3D] hover:bg-[#F0EAE1] transition-colors"
              title="Kembali ke Catatan"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-serif font-bold text-base text-[#3C2F2F] tracking-wide">
              Luma Bisnis
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-[#EFEAE2] rounded-md transition-colors text-[#7A6F6D]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User profile section */}
        <div className="p-4 border-b border-[#E6DFD5] bg-[#FDFBF7]/50">
          <p className="text-xs text-[#A89F95] font-semibold uppercase tracking-wider">Active Workspace</p>
          <p className="text-sm font-bold text-[#3C2F2F] truncate flex items-center gap-1.5 mt-0.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            {userId}
          </p>
        </div>

        {/* Sidebar Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest px-2 mb-2">Import Menu</h3>
          
          <button
            onClick={() => setActiveTab("import")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeTab === "import"
                ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F]"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/30"
            }`}
          >
            <UploadCloud className="h-4 w-4 text-sky-600" />
            <span>Import Bisnis</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "all"
                ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F]"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#A07855]" />
              <span>Semua Bisnis</span>
            </div>
            <span className="text-[10px] bg-stone-200/60 text-[#5C4B40] px-1.5 py-0.5 rounded-full">{totalBisnis}</span>
          </button>

          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest px-2 pt-4 mb-2">Filter Website</h3>
          
          <button
            onClick={() => setActiveTab("has_website")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "has_website"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-green-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span>Sudah Punya Website</span>
            </div>
            <span className="text-[10px] bg-green-100/50 text-green-700 px-1.5 py-0.5 rounded-full">{totalHasWeb}</span>
          </button>

          <button
            onClick={() => setActiveTab("no_website")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "no_website"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-amber-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-500" />
              <span>Belum Punya Website</span>
            </div>
            <span className="text-[10px] bg-amber-100/50 text-amber-700 px-1.5 py-0.5 rounded-full">{totalNoWeb}</span>
          </button>

          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest px-2 pt-4 mb-2">Media Sosial</h3>

          <button
            onClick={() => setActiveTab("has_ig")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "has_ig"
                ? "bg-purple-50 border-purple-200 text-purple-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-purple-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-purple-600" />
              <span>Ada Instagram</span>
            </div>
            <span className="text-[10px] bg-purple-100/50 text-purple-700 px-1.5 py-0.5 rounded-full">{totalIg}</span>
          </button>

          <button
            onClick={() => setActiveTab("has_fb")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "has_fb"
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-blue-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span>Ada Facebook</span>
            </div>
            <span className="text-[10px] bg-blue-100/50 text-blue-700 px-1.5 py-0.5 rounded-full">{totalFb}</span>
          </button>

          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest px-2 pt-4 mb-2">Nomor Telepon</h3>

          <button
            onClick={() => setActiveTab("mobile")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "mobile"
                ? "bg-teal-50 border-teal-200 text-teal-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-teal-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-teal-600" />
              <span>Nomor Seluler</span>
            </div>
            <span className="text-[10px] bg-teal-100/50 text-teal-700 px-1.5 py-0.5 rounded-full">{totalMobile}</span>
          </button>

          <button
            onClick={() => setActiveTab("landline")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "landline"
                ? "bg-orange-50 border-orange-200 text-orange-800"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-orange-50/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-600" />
              <span>Nomor Daerah</span>
            </div>
            <span className="text-[10px] bg-orange-100/50 text-orange-700 px-1.5 py-0.5 rounded-full">{totalLandline}</span>
          </button>

          <h3 className="text-[10px] font-bold text-[#A89F95] uppercase tracking-widest px-2 pt-4 mb-2">Riwayat</h3>

          <button
            onClick={() => setActiveTab("history")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between border ${
              activeTab === "history"
                ? "bg-[#EFEAE2] border-[#C8BEAE] text-[#3C2F2F]"
                : "bg-transparent border-transparent text-[#7A6F6D] hover:bg-[#EFEAE2]/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-zinc-600" />
              <span>Riwayat Upload</span>
            </div>
            <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded-full">{uploads.length}</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E6DFD5] text-center bg-[#FDFBF7]/30">
          <span className="text-[9px] text-[#A89F95] uppercase tracking-wider font-semibold">
            Luma Developer
          </span>
        </div>
      </div>

      {/* Backdrop overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/10 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* ─── MAIN WORKSPACE CANVAS ─── */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        
        {/* Workspace Top Header */}
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
            <span className="text-xs font-semibold text-[#A89F95]">
              {activeTab === "import"
                ? "Upload & Impor File Bisnis"
                : activeTab === "history"
                ? "Riwayat Sesi Impor Data"
                : "Database & Direktori Bisnis"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAllData(userId)}
              className="p-2 hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-xl text-[#7A6F6D] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-[#FAF6F0] bg-[#A07855] px-2.5 py-1 rounded-full border border-[#906845] flex items-center gap-1 font-semibold select-none">
              <Sparkles className="h-3 w-3" /> Workspace Importer
            </span>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto bg-[#F8F4EE] p-4 md:p-6 space-y-6">
          
          {/* STATS SUMMARY BAR (Hidden for Import and History tab) */}
          {activeTab !== "import" && activeTab !== "history" && (
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Total Bisnis</span>
                <span className="text-xl font-bold text-[#3C2F2F] mt-1">{totalBisnis}</span>
              </div>
              <div className="bg-green-50/50 p-3 rounded-2xl border border-green-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-green-700 uppercase">Punya Web</span>
                <span className="text-xl font-bold text-green-700 mt-1">{totalHasWeb}</span>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Belum Web</span>
                <span className="text-xl font-bold text-amber-700 mt-1">{totalNoWeb}</span>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Instagram</span>
                <span className="text-xl font-bold text-purple-700 mt-1">{totalIg}</span>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Facebook</span>
                <span className="text-xl font-bold text-blue-700 mt-1">{totalFb}</span>
              </div>
              <div className="bg-teal-50/50 p-3 rounded-2xl border border-teal-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-teal-700 uppercase">Seluler</span>
                <span className="text-xl font-bold text-teal-700 mt-1">{totalMobile}</span>
              </div>
              <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-[10px] font-bold text-orange-700 uppercase">Daerah</span>
                <span className="text-xl font-bold text-orange-700 mt-1">{totalLandline}</span>
              </div>
            </div>
          )}

          {/* DYNAMIC TAB BODY */}
          
          {/* TAB 1: IMPORT BISNIS */}
          {activeTab === "import" && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Uploader Box */}
              <div className="bg-white rounded-3xl border border-[#E6DFD5] p-6 shadow-sm">
                <h2 className="text-base font-bold text-[#3C2F2F] mb-1">Unggah Dokumen Bisnis</h2>
                <p className="text-xs text-[#7A6F6D] mb-4">
                  Unggah file Excel (`.xlsx`, `.xls`), CSV, atau file spreadsheet HTML hasil scraping (seperti `TEGAL.xls`). Dokumen harus memiliki baris header berisi kolom-kolom seperti Nama Bisnis, Telepon, Instagram, Facebook, Website, dan Alamat.
                </p>

                {/* Category Selection Field */}
                <div className="mb-5 bg-[#FAF6F0] p-4 rounded-2xl border border-[#DCd4c6]/60">
                  <label className="block text-[10px] font-bold text-[#5C4B40] uppercase tracking-wider mb-1.5">
                    Kategori untuk Impor Ini
                  </label>
                  
                  {!isCustomCategory ? (
                    <select
                      value={importCategory}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomCategory(true);
                          setImportCategory(""); // clear so they can write
                        } else {
                          setImportCategory(e.target.value);
                        }
                      }}
                      disabled={isImporting}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F] font-semibold shadow-xs"
                    >
                      {contactCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">➕ Tulis Kategori Baru (Kustom)...</option>
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={importCategory}
                          onChange={(e) => setImportCategory(e.target.value)}
                          placeholder="Ketik kategori baru (contoh: Travel Tegal, Kuliner, dll.)"
                          disabled={isImporting}
                          className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F] font-semibold shadow-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setImportCategory(contactCategories[0] || "Umum");
                          }}
                          disabled={isImporting}
                          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-[#DCd4c6] text-[#5C4B40] text-xs font-bold rounded-xl transition-colors"
                        >
                          Pilih yang Ada
                        </button>
                      </div>
                      <p className="text-[9px] text-[#A89F95]">
                        * Kategori baru yang Anda ketik akan otomatis digunakan untuk seluruh kontak dalam sesi impor ini.
                      </p>
                    </div>
                  )}
                  
                  <p className="text-[9px] text-[#A89F95] mt-1.5">
                    * Seluruh kontak bisnis dalam berkas ini akan ditandai dengan kategori tersebut di menu WA Blaster.
                  </p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-sky-500 bg-sky-50/30"
                      : isImporting
                      ? "border-stone-300 bg-stone-50 cursor-not-allowed"
                      : "border-[#DCd4c6] hover:border-[#A07855] bg-transparent"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    disabled={isImporting}
                  />

                  {isImporting ? (
                    <Loader2 className="h-10 w-10 text-sky-500 animate-spin mb-4" />
                  ) : (
                    <UploadCloud className="h-12 w-12 text-[#A89F95] mb-4 group-hover:text-[#A07855]" />
                  )}

                  <p className="text-sm font-bold text-[#3C2F2F] text-center">
                    {isImporting ? "Sedang memproses dokumen..." : "Tarik & Lepas file di sini atau Klik untuk memilih"}
                  </p>
                  <p className="text-xs text-[#A89F95] mt-1 text-center">
                    Mendukung berkas format .xlsx, .xls, .csv hingga 10MB
                  </p>
                </div>

                {/* Progress Indicators */}
                {isImporting && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#5C4B40] mb-1">
                        <span>Mengunggah file ke Supabase Storage</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-[#5C4B40] mb-1">
                        <span>Pengecekan Duplikat & Parsing ke Database</span>
                        <span>{parseProgress}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${parseProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Importer Log Console */}
              {(importLogs.length > 0 || isImporting) && (
                <div className="bg-stone-900 rounded-3xl border border-stone-800 p-5 shadow-lg flex flex-col h-[350px]">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
                    <span className="text-xs font-mono font-bold text-stone-400">Proses Impor Log Console</span>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                  </div>
                  
                  <div className="flex-1 overflow-y-auto font-mono text-xs text-stone-300 space-y-1.5 flex flex-col-reverse">
                    {importLogs.map((log, idx) => {
                      const isWarning = log.includes("Melewati") || log.includes("dilewati");
                      const isError = log.includes("gagal") || log.includes("Gagal");
                      return (
                        <p
                          key={idx}
                          className={
                            isError
                              ? "text-red-400"
                              : isWarning
                              ? "text-amber-400"
                              : "text-stone-300"
                          }
                        >
                          {log}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RIWAYAT UPLOAD */}
          {activeTab === "history" && (
            <div className="bg-white rounded-3xl border border-[#E6DFD5] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#E6DFD5]">
                <h2 className="text-base font-bold text-[#3C2F2F]">Riwayat Sesi Impor</h2>
                <p className="text-xs text-[#7A6F6D]">Daftar unggahan berkas bisnis serta hasil pemrosesan.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6F0] border-b border-[#E6DFD5] text-[10px] font-bold text-[#5C4B40] uppercase">
                      <th className="p-4">Tanggal Upload</th>
                      <th className="p-4">Nama File</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Total Baris</th>
                      <th className="p-4 text-center">Impor Sukses</th>
                      <th className="p-4 text-center">Duplikat</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {uploads.map((up) => (
                      <tr key={up.id} className="hover:bg-stone-50/50">
                        <td className="p-4 text-[#7A6F6D] font-medium font-mono">
                          {new Date(up.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 font-bold text-[#3C2F2F]">
                          {up.filename}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            up.status === "completed"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : up.status === "failed"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                          }`}>
                            {up.status === "completed" ? "Selesai" : up.status === "failed" ? "Gagal" : "Memproses"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-semibold text-[#5C4B40]">{up.total_rows || 0}</td>
                        <td className="p-4 text-center font-bold text-green-600">{up.processed_rows || 0}</td>
                        <td className="p-4 text-center font-semibold text-amber-600">{up.duplicate_rows || 0}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleViewLogs(up.id)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-[#5C4B40] font-bold rounded-lg transition-colors text-[10px]"
                          >
                            Lihat Log
                          </button>
                          <button
                            onClick={() => handleDeleteUpload(up.id)}
                            className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Upload"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {uploads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#A89F95] italic">
                          Belum ada riwayat berkas diunggah.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3+: TABLE LIST OF BUSINESSES (ALL / FILTERED) */}
          {activeTab !== "import" && activeTab !== "history" && (
            <div className="bg-white rounded-3xl border border-[#E6DFD5] overflow-hidden shadow-sm flex flex-col">
              
              {/* Table Filters Header */}
              <div className="p-4 border-b border-[#E6DFD5] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAF9F6]">
                <div className="flex flex-1 w-full gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#A89F95]" />
                    <input
                      type="text"
                      placeholder="Cari nama bisnis, kontak, telepon..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] text-[#3C2F2F]"
                    />
                  </div>

                  {/* Filter City */}
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="text-xs bg-white border border-[#DCd4c6] rounded-xl py-2 px-3 text-[#5C4B40] font-semibold focus:outline-none focus:ring-1 focus:ring-[#A07855]"
                  >
                    <option value="">Semua Kota/Kabupaten</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>

                  {/* Filter Category */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs bg-white border border-[#DCd4c6] rounded-xl py-2 px-3 text-[#5C4B40] font-semibold focus:outline-none focus:ring-1 focus:ring-[#A07855]"
                  >
                    <option value="">Semua Kategori</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Exports Actions */}
                <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                  {selectedBusinesses.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors border border-red-700 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Terpilih ({selectedBusinesses.size})</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleExportData(filteredBusinesses, "xlsx")}
                    className="flex-1 md:flex-initial py-2 px-3 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Ekspor Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleExportData(filteredBusinesses, "csv")}
                    className="flex-1 md:flex-initial py-2 px-3 bg-stone-100 hover:bg-stone-200 text-[#5C4B40] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#DCd4c6] transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Ekspor CSV</span>
                  </button>
                </div>
              </div>

              {/* Responsive Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF6F0] border-b border-[#E6DFD5] text-[10px] font-bold text-[#5C4B40] uppercase">
                      <th className="p-4 w-[40px]">
                        <input
                          type="checkbox"
                          checked={paginatedBusinesses.length > 0 && paginatedBusinesses.every(b => selectedBusinesses.has(b.id))}
                          onChange={handleSelectAllFiltered}
                          className="rounded border-[#DCd4c6] text-[#A07855] focus:ring-[#A07855] cursor-pointer h-3.5 w-3.5"
                        />
                      </th>
                      <th className="p-4 w-[50px]">No</th>
                      <th className="p-4 min-w-[200px]">Nama Bisnis</th>
                      <th className="p-4 min-w-[150px]">Kontak</th>
                      <th className="p-4 min-w-[150px]">Telepon</th>
                      <th className="p-4 min-w-[150px]">Media Sosial</th>
                      <th className="p-4 min-w-[180px]">Website</th>
                      <th className="p-4 min-w-[300px]">Alamat Lengkap</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {paginatedBusinesses.map((biz, index) => (
                      <tr key={biz.id} className="hover:bg-stone-50/50">
                        <td className="p-4 w-[40px]">
                          <input
                            type="checkbox"
                            checked={selectedBusinesses.has(biz.id)}
                            onChange={() => handleSelectBusiness(biz.id)}
                            className="rounded border-[#DCd4c6] text-[#A07855] focus:ring-[#A07855] cursor-pointer h-3.5 w-3.5"
                          />
                        </td>
                        <td className="p-4 text-[#A89F95] font-semibold font-mono">
                          {(paginationPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4 font-bold text-[#3C2F2F]">
                          {biz.name}
                        </td>
                        <td className="p-4 text-[#7A6F6D] font-medium">
                          {biz.contact_name || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-[#5C4B40]">{biz.phone || "—"}</span>
                            {biz.phone_type && (
                              <span className={`inline-flex self-start px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                biz.phone_type === "seluler"
                                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                                  : "bg-orange-50 text-orange-700 border border-orange-200"
                              }`}>
                                {biz.phone_type === "seluler" ? "Seluler" : "Daerah"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 text-[10px]">
                            {biz.instagram && biz.instagram !== "—" ? (
                              <span className="flex items-center gap-1 text-purple-600 font-semibold">
                                <Instagram className="h-3 w-3" />
                                {biz.instagram}
                              </span>
                            ) : null}
                            {biz.facebook && biz.facebook !== "—" ? (
                              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                <Facebook className="h-3 w-3" />
                                {biz.facebook}
                              </span>
                            ) : null}
                            {(!biz.instagram || biz.instagram === "—") && (!biz.facebook || biz.facebook === "—") && (
                              <span className="text-stone-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {biz.website && biz.website !== "—" ? (
                            <a
                              href={biz.website.startsWith("http") ? biz.website : `https://${biz.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-semibold flex items-center gap-1 hover:underline max-w-[150px] truncate"
                              title={biz.website}
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="truncate">{biz.website}</span>
                            </a>
                          ) : (
                            <span className="text-amber-600 font-semibold flex items-center gap-1 text-[10px]">
                              Tidak ada website
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1 max-w-[280px]">
                            <p className="text-stone-700 leading-normal line-clamp-2" title={biz.address}>
                              {biz.address || "—"}
                            </p>
                            {(biz.street || biz.district || biz.city || biz.province) && (
                              <div className="flex flex-wrap gap-1 text-[9px] text-[#A89F95] font-semibold">
                                {biz.district && <span className="bg-[#FAF6F0] border border-[#DCd4c6] px-1 rounded">Kec: {biz.district}</span>}
                                {biz.city && <span className="bg-[#FAF6F0] border border-[#DCd4c6] px-1 rounded">{biz.city}</span>}
                                {biz.province && <span className="bg-[#FAF6F0] border border-[#DCd4c6] px-1 rounded">{biz.province}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDeleteBusiness(biz.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Data Bisnis"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {totalFiltered === 0 && (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-[#A89F95] italic">
                          Tidak ada data bisnis ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-[#E6DFD5] flex items-center justify-between bg-[#FAF9F6] text-xs">
                  <span className="text-[#7A6F6D] font-medium">
                    Menampilkan <strong>{Math.min(totalFiltered, (paginationPage - 1) * itemsPerPage + 1)}-{Math.min(totalFiltered, paginationPage * itemsPerPage)}</strong> dari <strong>{totalFiltered}</strong> bisnis
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPaginationPage(prev => Math.max(prev - 1, 1))}
                      disabled={paginationPage === 1}
                      className="px-3 py-1.5 bg-white border border-[#DCd4c6] rounded-lg text-[#5C4B40] font-bold disabled:opacity-50 transition-all hover:bg-stone-50"
                    >
                      Sebelumnya
                    </button>
                    <div className="flex items-center px-3 font-semibold text-[#3C2F2F]">
                      Halaman {paginationPage} dari {totalPages}
                    </div>
                    <button
                      onClick={() => setPaginationPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={paginationPage === totalPages}
                      className="px-3 py-1.5 bg-white border border-[#DCd4c6] rounded-lg text-[#5C4B40] font-bold disabled:opacity-50 transition-all hover:bg-stone-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ─── IMPORT LOGS MODAL DIALOG ─── */}
      <AnimatePresence>
        {viewingLogsUploadId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E6DFD5] shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="p-4 border-b border-[#E6DFD5] flex justify-between items-center bg-[#FAF6F0]">
                <h3 className="font-bold text-sm text-[#3C2F2F] flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-amber-600" />
                  Log Pemrosesan Dokumen
                </h3>
                <button
                  onClick={() => setViewingLogsUploadId(null)}
                  className="p-1 hover:bg-stone-200 rounded-lg text-[#7A6F6D] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 bg-stone-950 font-mono text-xs space-y-2 text-stone-200">
                {loadingLogs ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#A89F95]" />
                    <span className="text-[#A89F95] font-sans">Mengunduh logs...</span>
                  </div>
                ) : uploadLogs.length === 0 ? (
                  <p className="text-stone-400 italic py-4 text-center">Tidak ada catatan log ditemukan.</p>
                ) : (
                  uploadLogs.map((log) => {
                    const isWarn = log.log_level === "warning";
                    const isErr = log.log_level === "error";
                    return (
                      <p
                        key={log.id}
                        className={
                          isErr
                            ? "text-red-400"
                            : isWarn
                            ? "text-amber-400"
                            : "text-stone-300"
                        }
                      >
                        {log.message}
                      </p>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-[#E6DFD5] flex justify-end bg-[#FAF9F6]">
                <button
                  onClick={() => setViewingLogsUploadId(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#5C4B40] font-bold rounded-xl transition-all border border-[#DCd4c6] text-xs"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
