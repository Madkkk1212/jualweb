"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, Briefcase, Tag, Layers, Instagram } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export const BottomNav = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const tr = t("bottomNav");

  const navItems = [
    { name: tr.home, href: "/", icon: Home, external: false },
    { name: tr.services, href: "/services", icon: Layers, external: false },
    { name: tr.pricing, href: "/pricing", icon: Tag, external: false },
    { name: tr.portfolio, href: "/portfolio", icon: Briefcase, external: false },
    {
      name: tr.instagram,
      href: "https://www.instagram.com/lumaspace.web.id/",
      icon: Instagram,
      external: true,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-2xl p-2 flex items-center justify-around pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = !item.external && pathname === item.href;
          const isInstagram = item.name === tr.instagram;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
              className="relative flex flex-col items-center justify-center py-2 px-1 transition-all flex-1"
            >
              <div
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  isInstagram
                    ? "text-purple-400"
                    : isActive
                    ? "text-accent-blue"
                    : "text-foreground/40"
                )}
              >
                <item.icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isActive || isInstagram ? "scale-110" : "scale-100"
                  )}
                />
              </div>

              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  isInstagram
                    ? "opacity-100 translate-y-0 text-purple-400"
                    : isActive
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                )}
              >
                {item.name}
              </span>

              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-accent-blue/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
};
