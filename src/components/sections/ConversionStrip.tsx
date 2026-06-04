"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock3, ShieldCheck, MessageCircleMore } from "lucide-react";
import Link from "next/link";

const whatsappUrl = "https://wa.me/6289514618737";

export const ConversionStrip = () => {
  const items = [
    { icon: Clock3, title: "Respon Cepat", desc: "Cocok untuk calon klien yang ingin langsung tanya harga dan kebutuhan website." },
    { icon: ShieldCheck, title: "Lebih Meyakinkan", desc: "Copy, desain, dan struktur halaman dibuat untuk menaikkan trust bisnis Anda." },
    { icon: MessageCircleMore, title: "Langsung Konsultasi", desc: "Tidak perlu ribet. Tinggal chat WhatsApp, jelaskan kebutuhan, lalu kami bantu arahkan paketnya." },
  ];

  return (
    <section className="px-4 sm:px-6 py-6 md:py-8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto rounded-[1.5rem] md:rounded-[2rem] border border-accent-blue/20 bg-[linear-gradient(135deg,rgba(10,18,35,0.95),rgba(10,10,10,0.92))] p-5 sm:p-6 md:p-10 shadow-premium"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-10 items-center">
          <div>
            <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.18em] md:tracking-[0.25em] text-accent-blue">Closing Booster</p>
            <h2 className="mt-3 md:mt-4 text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.02]">
              Semakin cepat calon pelanggan yakin,
              <span className="text-gradient-blue"> semakin besar peluang mereka chat.</span>
            </h2>
            <p className="mt-4 md:mt-6 max-w-2xl text-sm sm:text-base md:text-lg font-medium leading-relaxed text-white/65">
              Karena itu halaman ini kami arahkan untuk satu tujuan utama: membuat bisnis Anda terlihat profesional,
              lalu mendorong pengunjung mengambil tindakan lewat WhatsApp.
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:p-5">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="rounded-xl bg-accent-blue/10 p-3 text-accent-blue shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-white/60">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}

            <Link href={whatsappUrl} target="_blank" className="inline-flex w-full items-center justify-center rounded-2xl bg-accent-green px-5 md:px-6 py-4 text-xs md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-black transition-transform hover:scale-[1.01] text-center">
              Chat WhatsApp Sekarang
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};