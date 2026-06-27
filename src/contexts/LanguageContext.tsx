"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations, { Lang } from "@/lib/translations";

// ── Types ────────────────────────────────────────────────────────────────────
type Section = keyof typeof translations.id;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Typed: t("hero") returns the hero translation object */
  t: <K extends Section>(section: K) => typeof translations.id[K];
}

// ── Context ──────────────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "luma_lang";

// ── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "id" || stored === "en") {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  }, []);

  const t = useCallback(
    <K extends Section>(section: K): typeof translations.id[K] => {
      return translations[lang][section] as typeof translations.id[K];
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
