"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, Briefcase, Tag, Layers, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Layanan", href: "/services", icon: Layers },
    { name: "Harga", href: "/pricing", icon: Tag },
    { name: "Portofolio", href: "/portfolio", icon: Briefcase },
    { name: "Kontak", href: "/contact", icon: MessageCircle },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-2xl p-2 flex items-center justify-around pointer-events-auto"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-2 px-1 transition-all flex-1"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "text-accent-blue" : "text-foreground/40"
              )}>
                <item.icon className={cn(
                  "h-6 w-6 transition-transform duration-300",
                  isActive ? "scale-110" : "scale-100"
                )} />
              </div>
              
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
              )}>
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
