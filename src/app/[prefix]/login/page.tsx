"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LogIn, ShieldAlert, Key, User } from "lucide-react";

// Seed data with 'madk' user
const SEED_ACCOUNTS = [
  {
    email: "madk",
    password: "madk",
    name: "Madk",
    notes: [
      {
        id: "1",
        title: "💡 Ide Bisnis Luma Space",
        category: "Ide Bisnis",
        content: "1. Kembangkan template website modern berbasis Next.js untuk dealer mobil.\n2. Layanan langganan bulanan perawatan website untuk UMKM Jambi.\n3. Integrasi chatbot AI WhatsApp untuk customer support.",
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
      },
      {
        id: "2",
        title: "📋 Tugas Minggu Ini",
        category: "Daftar Tugas",
        content: "- Selesaikan desain portfolio untuk PT Gemilang Aksara Sejahtera.\n- Follow up client Atuna Umroh tentang data galeri foto.\n- Buat rancangan harga paket web custom.",
        updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      },
      {
        id: "3",
        title: "🤝 Informasi Client - Dealer Mobil Jambi",
        category: "Informasi Client",
        content: "Nama Client: Pak Budi Pratama\nKebutuhan: Web dealer mobil terintegrasi WhatsApp.\nStatus: Desain awal disetujui. Butuh input data mobil bekas.",
        updatedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      }
    ],
    links: [
      {
        id: "1",
        title: "LumaSpace Main Site",
        url: "https://luma.space",
        category: "Website",
      },
      {
        id: "2",
        title: "Instagram LumaSpace",
        url: "https://instagram.com/lumaspace",
        category: "Instagram",
      },
      {
        id: "3",
        title: "Dokumen Kontrak Klien",
        url: "https://drive.google.com/drive/folders/demo",
        category: "Google Drive",
      }
    ],
    contacts: [
      {
        id: "1",
        name: "Budi Pratama (Dealer Mobil)",
        phone: "+628123456789",
        email: "budi.dealer@example.com",
      },
      {
        id: "2",
        name: "Siti Rahma (Atuna Umroh)",
        phone: "+628987654321",
        email: "siti.rahma@example.com",
      }
    ],
  }
];

interface WorkspaceAccount {
  email: string;
  password?: string;
  name: string;
  notes?: Array<{ id: string; title: string; category: string; content: string; updatedAt: string }>;
  links?: Array<{ id: string; title: string; url: string; category: string }>;
  contacts?: Array<{ id: string; name: string; phone: string; email: string }>;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const prefix = (params?.prefix as string) || "workspace";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Seed data & Auth Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("luma_session");
      if (session) {
        router.replace(`/${session}/note`);
        return;
      }
      
      if (prefix !== "workspace") {
        router.replace(`/workspace/login`);
        return;
      }

      const existingAccounts = localStorage.getItem("luma_accounts");
      if (!existingAccounts) {
        localStorage.setItem("luma_accounts", JSON.stringify(SEED_ACCOUNTS));
      } else {
        try {
          const accounts = JSON.parse(existingAccounts);
          const hasMadk = Array.isArray(accounts) && accounts.some((acc: WorkspaceAccount) => acc.email === "madk");
          if (!hasMadk) {
            const updated = Array.isArray(accounts) ? [...accounts, SEED_ACCOUNTS[0]] : SEED_ACCOUNTS;
            localStorage.setItem("luma_accounts", JSON.stringify(updated));
          }
        } catch {
          localStorage.setItem("luma_accounts", JSON.stringify(SEED_ACCOUNTS));
        }
      }
    }
  }, [router, prefix]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (typeof window === "undefined") return;

    setTimeout(() => {
      const accounts: WorkspaceAccount[] = JSON.parse(localStorage.getItem("luma_accounts") || "[]");

      // Handle Login
      const user = accounts.find(
        (acc: WorkspaceAccount) => acc.email.toLowerCase() === username.toLowerCase().trim() && acc.password === password
      );

      if (user) {
        localStorage.setItem("luma_session", user.email);
        setSuccess("Login berhasil! Mengalihkan...");
        setTimeout(() => {
          router.replace(`/${prefix}/note`);
        }, 800);
      } else {
        setError("Username atau password salah.");
        setLoading(false);
      }
    }, 500); // Visual delay for premium feel
  };

  const handleDemoFill = () => {
    setUsername("madk");
    setPassword("madk");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F4EE] px-4 select-none">
      <div className="w-full max-w-md">
        {/* Workspace Title branding */}
        <div className="text-center mb-8">
          <span className="text-xs tracking-[0.2em] text-[#A07855] font-semibold uppercase">
            Personal Workspace
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-[#3C2F2F] mt-1 font-serif">
            Luma Notes
          </h1>
          <p className="text-sm text-[#7A6F6D] mt-2 font-light">
            Sistem catatan pribadi yang aman dan terorganisir.
          </p>
        </div>

        {/* Auth Box Container */}
        <div className="bg-[#FAF8F5] border border-[#DCd4c6] rounded-2xl shadow-soft p-8 relative overflow-hidden transition-all duration-300">
          <h2 className="text-sm font-semibold tracking-wide text-[#5C4B40] uppercase border-b border-[#E6DFD5] pb-3 mb-6">
            Masuk ke Workspace
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#A89F95]" />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] transition-all text-[#3C2F2F]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A6F6D] mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#A89F95]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#DCd4c6] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A07855] focus:border-[#A07855] placeholder-[#C0B8AD] transition-all text-[#3C2F2F]"
                  required
                />
              </div>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50/70 border border-red-200/50 rounded-xl text-red-700 text-xs mt-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50/70 border border-emerald-200/50 rounded-xl text-emerald-700 text-xs mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#5C4B40] hover:bg-[#4E3F35] disabled:bg-[#A89F95] text-[#F8F4EE] rounded-xl font-medium text-sm transition-all duration-200 shadow-sm mt-4 active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#F8F4EE] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Masuk ke Workspace
                </>
              )}
            </button>
          </form>

          {/* Quick-fill helper for demo */}
          <div className="mt-6 pt-6 border-t border-[#E6DFD5] text-center">
            <p className="text-xs text-[#A89F95] mb-2">
              Ingin mencoba langsung?
            </p>
            <button
              type="button"
              onClick={handleDemoFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#EFEAE2] border border-[#DCd4c6] rounded-lg text-xs text-[#5C4B40] font-medium transition-colors active:scale-95"
            >
              Gunakan Akun Demo (madk)
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-[#A89F95] hover:text-[#5C4B40] transition-colors"
          >
            ← Kembali ke Landing Page Utama
          </a>
        </div>
      </div>
    </div>
  );
}
