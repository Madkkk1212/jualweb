"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const Terminal = () => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const commands = [
      "npm install lumaspace",
      "🚀 Menginstal paket & dependensi...",
      "📦 Berhasil menambahkan 42 paket",
      "Menginisialisasi konfigurasi Next.js...",
      "Vercel: Mempublikasikan website ke server produksi...",
      "✅ Website berhasil online! https://luma.dev",
    ];
    let index = 0;
    const interval = setInterval(() => {
      if (index < commands.length) {
        setLines((prev: string[]) => [...prev, commands[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl bg-card rounded-xl overflow-hidden border border-border shadow-2xl font-mono text-sm">
      {/* Terminal Header */}
      <div className="bg-foreground/5 px-4 py-2 flex items-center gap-2 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-foreground/40 text-xs ml-4 font-semibold uppercase tracking-widest">
          bash — lumaspace
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-6 h-64 overflow-y-auto custom-scrollbar">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2 mb-2"
          >
            <span className="text-accent-cyan font-bold">$</span>
            <span className={line && line.startsWith("✅") ? "text-accent-green font-semibold" : "text-foreground/90"}>
              {line}
            </span>
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-accent-blue ml-1"
        />
      </div>
    </div>
  );
};
