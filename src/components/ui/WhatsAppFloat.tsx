"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export const WhatsAppFloat = () => {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[120]">
      <Link href="https://wa.me/6289514618737" target="_blank" rel="noopener noreferrer">
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-accent-green/15 rounded-full md:rounded-2xl animate-ping" />

          <div className="glass bg-zinc-950/70 border border-accent-green/20 hover:border-accent-green/40 hover:bg-zinc-900/80 transition-all duration-300 px-4 py-4 md:px-5 rounded-full md:rounded-2xl shadow-premium text-accent-green flex items-center gap-3 font-bold">
            <MessageCircle className="h-6 w-6 md:h-7 md:w-7 fill-accent-green/10" />
            <span className="hidden md:inline text-white">Chat WhatsApp</span>
          </div>

          <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity glass px-4 py-2 rounded-lg border-white/10 whitespace-nowrap text-sm font-bold text-white shadow-2xl pointer-events-none">
            Konsultasi gratis, respon cepat.
          </div>
        </motion.div>
      </Link>
    </div>
  );
};