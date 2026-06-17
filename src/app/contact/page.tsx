"use client";

import { useState } from "react";
import { Mail, MessageCircle, MapPin, Instagram, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

// ── metadata dipindah ke generateMetadata (server) tapi karena "use client"
// kita pakai layout metadata di parent atau buat file terpisah

const contactInfo = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "0895-1461-8737",
    href: siteConfig.whatsapp,
    color: "text-accent-green",
    bg: "bg-accent-green/10",
  },
  {
    icon: Mail,
    label: "Email",
    value: "lumaspace@gmail.com",
    href: "mailto:lumaspace@gmail.com",
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@lumaspace.web.id",
    href: "https://www.instagram.com/lumaspace.web.id/",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: MapPin,
    label: "Lokasi",
    value: "Jambi, Indonesia",
    href: "#",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
];

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    instagram: "",
    message: "",
  });
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.message.trim()) {
      setErrorMsg("Nama, WhatsApp, dan pesan wajib diisi.");
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_submissions").insert([
        {
          name: form.name.trim(),
          whatsapp: form.whatsapp.trim(),
          ig: form.instagram.trim() || "",
          message: form.message.trim(),
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        setErrorMsg("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
        setFormState("error");
        return;
      }

      setFormState("success");
      setForm({ name: "", whatsapp: "", instagram: "", message: "" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setFormState("error");
    }
  };

  return (
    <>
      <div className="pt-16 md:pt-32 min-h-screen bg-transparent relative overflow-hidden">
        {/* Subtle atmospheric glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-24">
            <h1 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
              Mari Kita <br />
              <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">
                Bicara.
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-foreground/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Kami siap membantu menjawab semua keraguan Anda. Pilih jalur
              komunikasi yang paling nyaman bagi Anda.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
            {contactInfo.map((info) => (
              <Link
                key={info.label}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={info.href.startsWith("http") ? "noreferrer" : undefined}
                className="group bg-card p-10 rounded-[2.5rem] border border-border/50 shadow-premium hover:shadow-hover hover:-translate-y-2 transition-all duration-500"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${info.bg} ${info.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
                >
                  <info.icon className="h-8 w-8" />
                </div>
                <h3 className="text-sm font-black text-foreground/40 uppercase tracking-[0.2em] mb-2">
                  {info.label}
                </h3>
                <p className="text-xl font-bold text-foreground break-words">
                  {info.value}
                </p>
              </Link>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto mb-32"
          >
            <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 md:p-14 shadow-premium">
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter mb-3">
                  Kirim Pesan
                </h2>
                <p className="text-foreground/50 font-medium">
                  Isi form di bawah dan kami akan segera menghubungi Anda.
                </p>
              </div>

              {formState === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center gap-6"
                >
                  <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-foreground mb-2">
                      Pesan Terkirim!
                    </h3>
                    <p className="text-foreground/50 font-medium">
                      Terima kasih! Kami akan menghubungi Anda segera.
                    </p>
                  </div>
                  <button
                    onClick={() => setFormState("idle")}
                    className="text-sm font-bold text-accent-blue hover:underline"
                  >
                    Kirim pesan lagi
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-black text-foreground/60 uppercase tracking-[0.15em] mb-3"
                    >
                      Nama Lengkap <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Contoh: Budi Santoso"
                      required
                      className="w-full bg-foreground/[0.03] border border-border/60 rounded-2xl px-5 py-4 text-foreground placeholder:text-foreground/30 font-medium focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/60 transition-all"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-sm font-black text-foreground/60 uppercase tracking-[0.15em] mb-3"
                    >
                      Nomor WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="Contoh: 08xxxxxxxxxx"
                      required
                      className="w-full bg-foreground/[0.03] border border-border/60 rounded-2xl px-5 py-4 text-foreground placeholder:text-foreground/30 font-medium focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/60 transition-all"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label
                      htmlFor="instagram"
                      className="block text-sm font-black text-foreground/60 uppercase tracking-[0.15em] mb-3"
                    >
                      Instagram{" "}
                      <span className="text-foreground/30 normal-case tracking-normal font-medium">
                        (opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/30 font-bold">
                        @
                      </span>
                      <input
                        id="instagram"
                        name="instagram"
                        type="text"
                        value={form.instagram}
                        onChange={handleChange}
                        placeholder="username_instagram"
                        className="w-full bg-foreground/[0.03] border border-border/60 rounded-2xl pl-10 pr-5 py-4 text-foreground placeholder:text-foreground/30 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400/60 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-black text-foreground/60 uppercase tracking-[0.15em] mb-3"
                    >
                      Pesan / Kebutuhan <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Ceritakan kebutuhan website Anda..."
                      required
                      className="w-full bg-foreground/[0.03] border border-border/60 rounded-2xl px-5 py-4 text-foreground placeholder:text-foreground/30 font-medium focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/60 transition-all resize-none"
                    />
                  </div>

                  {/* Error */}
                  {formState === "error" && (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-sm font-medium">{errorMsg}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={formState === "loading"}
                    className="w-full h-14 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.15em] rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-premium hover:shadow-hover hover:-translate-y-0.5"
                  >
                    {formState === "loading" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Kirim Pesan
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
