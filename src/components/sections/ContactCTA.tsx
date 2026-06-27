"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import Link from "next/link";
import { Instagram, ArrowRight, MessageCircle, ShieldCheck, Zap, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const instagramUrl = "https://www.instagram.com/lumaspace.web.id/";
const whatsappUrl = "https://wa.me/6289514618737";

const trustIcons = [Clock, Zap, ShieldCheck];

export const ContactCTA = () => {
  const { t } = useLanguage();
  const tr = t("contactCta");

  const trustSignals = [
    { icon: trustIcons[0], text: tr.trust1 },
    { icon: trustIcons[1], text: tr.trust2 },
    { icon: trustIcons[2], text: tr.trust3 },
  ];

  return (
    <section id="contact-cta" className="py-24 px-6 relative overflow-hidden bg-transparent">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-blue/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto bg-card p-10 md:p-20 rounded-[3rem] border border-border/50 shadow-premium text-center relative z-10 overflow-hidden"
      >
        {/* Decor */}
        <div className="absolute -top-10 -right-10 p-20 opacity-[0.02] pointer-events-none">
          <MessageCircle className="w-96 h-96 text-accent-blue" />
        </div>

        {/* Online Status */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent-green/5 border border-accent-green/10 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-green"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-green">{tr.onlineNow}</span>
        </div>

        <h2 className="text-4xl md:text-7xl font-black text-foreground mb-8 tracking-tighter leading-[0.95]">
          {tr.heading} <br />
          <span className="text-gradient-blue text-glow-blue italic">{tr.headingHighlight}</span>
        </h2>

        {/* Trust Signals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-14 max-w-4xl mx-auto">
          {trustSignals.map((signal, i) => (
            <div key={i} className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-foreground/[0.03] border border-border/40 transition-colors hover:border-accent-blue/20">
              <signal.icon className="h-5 w-5 text-accent-blue" />
              <span className="text-sm font-bold text-foreground/70 uppercase tracking-widest">{signal.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href={whatsappUrl} target="_blank" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full h-16 px-10 shadow-premium hover:shadow-hover group">
              {tr.cta1}
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href={instagramUrl} target="_blank" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full h-16 px-10 border-border/80 hover:bg-foreground/5">
              <Instagram className="h-5 w-5 mr-2" />
              {tr.cta2}
            </Button>
          </Link>
        </div>

        <div className="mt-12 text-xs font-bold uppercase tracking-[0.2em] text-foreground/30">
          {tr.footnote}
        </div>
      </motion.div>
    </section>
  );
};
