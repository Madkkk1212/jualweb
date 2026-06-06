"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";

const instagramUrl = "https://www.instagram.com/lumaspace.web.id/";
const whatsappUrl = "https://wa.me/6289514618737";



export const Footer = () => {
  return (
    <footer className="py-20 px-6 border-t border-border bg-card relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2">
              <span className="text-accent-blue font-mono">&lt;</span>
              LumaSpace
              <span className="text-accent-blue font-mono"> /&gt;</span>
            </Link>
            <p className="text-lg text-foreground/50 font-medium max-w-md leading-relaxed">
              Partner pembuatan website yang membantu bisnis terlihat lebih profesional,
              lebih dipercaya, dan lebih siap menerima order dari calon pelanggan.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={whatsappUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-green/10 px-4 py-3 text-accent-green hover:bg-accent-green hover:text-black transition-all duration-300 font-bold"
              >
                <MessageCircle className="h-5 w-5" />
                Chat WhatsApp
              </Link>
              <Link
                href={instagramUrl}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-3 text-foreground/70 hover:bg-accent-blue hover:text-white transition-all duration-300 font-bold"
              >
                <Instagram className="h-5 w-5" />
                @lumaspace.web.id
              </Link>
              <Link
                href="mailto:lumaspace@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground/5 px-4 py-3 text-foreground/70 hover:bg-accent-blue hover:text-white transition-all duration-300 font-bold"
              >
                <Mail className="h-5 w-5" />
                Email
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Layanan</h4>
            <ul className="space-y-4">
              {[
                { label: "Landing Page", href: "/services" },
                { label: "E-Commerce", href: "/services" },
                { label: "Company Profile", href: "/services" },
                { label: "Portofolio", href: "/portfolio" },
                { label: "Kontak", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-foreground/50 hover:text-accent-blue transition-colors font-medium">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Kontak Kami</h4>
            <ul className="space-y-4">
              <li><Link href={whatsappUrl} target="_blank" className="text-foreground/50 hover:text-accent-green transition-colors font-medium">WhatsApp: 0895-1461-8737</Link></li>
              <li><Link href={instagramUrl} target="_blank" className="text-foreground/50 hover:text-accent-blue transition-colors font-medium">Instagram: @lumaspace.web.id</Link></li>
              <li><Link href="mailto:lumaspace@gmail.com" className="text-foreground/50 hover:text-accent-blue transition-colors font-medium">Email: lumaspace@gmail.com</Link></li>
              <li className="text-foreground/50 font-medium">Jambi, Indonesia</li>
            </ul>
          </div>
          
          
          
          
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-foreground/30 font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} LumaSpace. Membantu Pertumbuhan Bisnis Anda.
          </div>
          <div className="flex gap-8 text-xs font-bold text-foreground/40 uppercase tracking-widest">
            <Link href="#" className="hover:text-foreground">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-foreground">Ketentuan Layanan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};