"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, LayoutGrid, ShoppingBag, Building2 } from "lucide-react";

export const Services = () => {
  const services = [
    {
      title: "Landing Page Konversi Tinggi",
      desc: "Halaman promosi tunggal yang dirancang khusus untuk mengubah pengunjung menjadi pembeli. Fokus pada psikologi desain dan alur konversi yang terstruktur.",
      icon: Target,
      color: "text-accent-blue",
      features: ["Copywriting Persuasif", "Mobile Optimized", "Integrasi Pixel & Analytics", "WhatsApp CRM Link"]
    },
    {
      title: "Profil Perusahaan Profesional",
      desc: "Bangun otoritas dan kepercayaan klien dengan website profil perusahaan yang elegan, informatif, dan mencerminkan identitas brand Anda.",
      icon: Building2,
      color: "text-purple-400",
      features: ["Custom Branding", "Halaman Layanan Lengkap", "Profil Tim & Portfolio", "SEO Page Structure"]
    },
    {
      title: "Toko Online Modern (E-Commerce)",
      desc: "Toko online modern dengan pengelolaan produk yang mudah, sistem keranjang belanja, dan integrasi pengiriman otomatis untuk bisnis Anda.",
      icon: ShoppingBag,
      color: "text-accent-green",
      features: ["Katalog Produk Dinamis", "Sistem Checkout Simpel", "Payment Gateway Ready", "Dashboard Penjualan"]
    },
    {
      title: "Ekosistem & Sistem Kustom",
      desc: "Solusi platform khusus untuk edukasi, media berita, atau manajemen internal bisnis yang membutuhkan sistem database dan interaksi kompleks.",
      icon: LayoutGrid,
      color: "text-accent-cyan",
      features: ["Sistem CMS Custom", "Database Management", "User Authentication", "Scalability Ready"]
    },
  ];

  return (
    <section id="services" className="py-12 md:py-32 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.03] rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/10 mb-6 font-bold text-xs text-accent-blue uppercase tracking-widest"
          >
            Solusi Digital
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
            Solusi yang <br />
            <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">Tepat Sasaran.</span>
          </h2>
          <p className="text-lg md:text-2xl text-foreground/50 max-w-3xl mx-auto font-medium leading-relaxed">
            Kami tidak hanya membuat website, kami membangun infrastruktur digital 
            yang dirancang untuk meningkatkan kredibilitas dan profitabilitas bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-card p-10 md:p-14 rounded-[3rem] border border-border/50 shadow-premium hover:shadow-hover hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                <service.icon className="h-40 w-40 text-foreground" />
              </div>

              <div className="relative z-10">
                <div className="p-5 rounded-2.5xl bg-foreground/[0.03] border border-border group-hover:bg-accent-blue/5 transition-colors shrink-0 w-fit mb-10">
                  <service.icon className={`h-12 w-12 ${service.color}`} />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">{service.title}</h3>
                <p className="text-lg md:text-xl text-foreground/50 leading-relaxed font-medium mb-10 max-w-xl">
                  {service.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-blue/40" />
                      <span className="text-sm font-bold text-foreground/60 uppercase tracking-widest">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
