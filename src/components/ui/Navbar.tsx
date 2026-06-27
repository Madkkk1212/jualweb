"use client";

import React, { useState, useEffect } from "react";
import { Instagram } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();
  const tr = t("navbar");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: tr.home, href: "/" },
    { name: tr.portfolio, href: "/portfolio" },
    { name: tr.services, href: "/services" },
    { name: tr.pricing, href: "/pricing" },
    { name: tr.process, href: "/process" },
    { name: tr.faq, href: "/faq" },
    { name: tr.contact, href: "/contact" },
  ];

  if (!mounted) return null;

  return (
    <nav
      className={cn(
        "fixed top-3 sm:top-4 left-1/2 z-50 transition-all duration-500 ease-out w-[95%] max-w-7xl",
        isScrolled
          ? "opacity-100 -translate-x-1/2 translate-y-0"
          : "opacity-0 -translate-x-1/2 -translate-y-[150%] pointer-events-none"
      )}
    >
      <div
        className={cn(
          "px-4 sm:px-6 py-3 rounded-2xl flex items-center justify-between border transition-all duration-300 gap-3 glass border-border/50 shadow-premium"
        )}
      >
        <Link href="/" className="flex items-center gap-2 group min-w-0">
          <span className="text-base sm:text-xl font-bold tracking-tighter text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
            <span className="text-accent-blue font-mono">&lt;</span>
            LumaSpace
            <span className="text-accent-blue font-mono"> /&gt;</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/60 hover:text-accent-blue transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="https://www.instagram.com/lumaspace.web.id/"
            target="_blank"
            className="hidden md:inline-flex p-2 rounded-xl border border-border/50 hover:bg-foreground/5 transition-colors text-foreground/60 hover:text-accent-blue"
          >
            <Instagram className="h-4 w-4" />
          </Link>

          <Link href="https://wa.me/6289514618737" target="_blank" className="hidden sm:block">
            <Button size="sm" variant="primary">
              {tr.cta}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};