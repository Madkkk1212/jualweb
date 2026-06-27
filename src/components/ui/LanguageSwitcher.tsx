"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const isEN = lang === "en";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="fixed top-5 right-4 md:top-6 md:right-8 z-[200]"
    >
      <button
        onClick={() => setLang(isEN ? "id" : "en")}
        aria-label={isEN ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
        title={isEN ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
        className="group flex items-center p-1 rounded-full bg-card/90 backdrop-blur-md border border-border/60 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest">
          {/* ID Option */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              !isEN
                ? "bg-accent-blue text-white shadow-soft font-extrabold"
                : "text-foreground/50 hover:text-foreground/80 font-bold"
            }`}
          >
            {/* Indonesia Flag SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 3 2"
              className="w-4 h-3 rounded-sm border border-black/10 shrink-0"
            >
              <rect width="3" height="1" fill="#e70012" />
              <rect width="3" height="1" y="1" fill="#fff" />
            </svg>
            <span>ID</span>
          </div>

          {/* EN Option */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
              isEN
                ? "bg-accent-blue text-white shadow-soft font-extrabold"
                : "text-foreground/50 hover:text-foreground/80 font-bold"
            }`}
          >
            {/* UK Flag SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 50 30"
              className="w-4 h-3 rounded-sm border border-black/10 shrink-0"
            >
              <rect width="50" height="30" fill="#012169" />
              <path d="M0,0 L50,30 M50,0 L0,30" stroke="#fff" strokeWidth="6" />
              <path d="M0,0 L50,30 M50,0 L0,30" stroke="#c8102e" strokeWidth="3" />
              <path d="M25,0 v30 M0,15 h50" stroke="#fff" strokeWidth="10" />
              <path d="M25,0 v30 M0,15 h50" stroke="#c8102e" strokeWidth="6" />
            </svg>
            <span>EN</span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
