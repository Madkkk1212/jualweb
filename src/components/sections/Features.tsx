"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Zap, Shield, Globe2, MessageCircle, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/* ── Icon mapping (order must match translations.features.items) ── */
const iconList = [Zap, Shield, Globe2, MessageCircle, Palette];
const iconColorList = ["#92400E", "#1E3A8A", "#164E63", "#064E3B", "#3B0764"];

/* ── Tilt hook ───────────────────────────────────────────── */
const useTilt = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 24 });
  const sy = useSpring(my, { stiffness: 200, damping: 24 });
  const rotX = useTransform(sy, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotY = useTransform(sx, [-0.5, 0.5], ["-5deg", "5deg"]);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };
  return { ref, rotX, rotY, onMove, onLeave };
};

/* ── True frosted glass card ────────────────────────────── */
type FeatureItem = { title: string; desc: string; icon: React.ElementType; iconColor: string };
const FeatureCard = ({ item, i }: { item: FeatureItem; i: number }) => {
  const { ref, rotX, rotY, onMove, onLeave } = useTilt();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "1000px" }}
      className="group"
    >
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        <div
          className="relative h-full overflow-hidden rounded-3xl p-7 cursor-default"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 100%)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            border: "1.5px solid rgba(255,255,255,0.75)",
            boxShadow: [
              "0 8px 32px rgba(0,0,0,0.07)",
              "0 1.5px 0 rgba(255,255,255,1) inset",       /* top shine */
              "0 -1px 0 rgba(255,255,255,0.25) inset",     /* bottom edge */
              "1.5px 0 0 rgba(255,255,255,0.4) inset",     /* left edge */
              "-1.5px 0 0 rgba(255,255,255,0.2) inset",    /* right edge */
            ].join(", "),
          }}
        >
          {/* Specular highlight — top shimmer band */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none rounded-t-3xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.0) 100%)",
            }}
          />

          {/* Thin bright border line at top */}
          <div
            className="absolute top-0 left-8 right-8 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,1), transparent)" }}
          />

          {/* Icon */}
          <div
            className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.60), rgba(255,255,255,0.20))",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.80)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <item.icon className="h-5 w-5" style={{ color: item.iconColor }} />
          </div>

          <h3 className="relative z-10 text-base font-black text-foreground mb-2 tracking-tight">
            {item.title}
          </h3>
          <p className="relative z-10 text-sm text-foreground/55 leading-relaxed font-medium">
            {item.desc}
          </p>

          {/* Subtle bottom glass reflection */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none rounded-b-3xl"
            style={{
              background: "linear-gradient(0deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main section ────────────────────────────────────────── */
export const Features = () => {
  const { t } = useLanguage();
  const tr = t("features");
  const items = tr.items.map((item, i) => ({
    ...item,
    icon: iconList[i],
    iconColor: iconColorList[i],
  }));

  return (
    <section
      className="relative py-28 md:py-40 px-4 sm:px-6 overflow-hidden bg-transparent"
    >
      {/* ════════════════════════════════════════════════════
          BACKGROUND LAYER — all visual effects live here
          ════════════════════════════════════════════════════ */}

      {/* Large soft blobs — clearly visible brand colors */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-15%", left: "-10%",
          width: "75vw", height: "75vw",
          maxWidth: 900, maxHeight: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45,91,255,0.18) 0%, rgba(45,91,255,0.08) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%", right: "-5%",
          width: "65vw", height: "65vw",
          maxWidth: 750, maxHeight: 750,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%", left: "42%",
          width: "45vw", height: "45vw",
          maxWidth: 550, maxHeight: 550,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.13) 0%, rgba(0,229,255,0.04) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "3%",
          width: "35vw", height: "35vw",
          maxWidth: 420, maxHeight: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.12) 0%, rgba(217,119,6,0.04) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Oversized concentric ring silhouettes — top right */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "-10%", right: "-8%", width: "60vw", maxWidth: 720, opacity: 0.12 }}
        viewBox="0 0 600 600" fill="none"
      >
        <circle cx="480" cy="120" r="320" stroke="#2D5BFF" strokeWidth="2" />
        <circle cx="480" cy="120" r="240" stroke="#2D5BFF" strokeWidth="1.5" />
        <circle cx="480" cy="120" r="160" stroke="#7C3AED" strokeWidth="1.2" />
        <circle cx="480" cy="120" r="80"  stroke="#7C3AED" strokeWidth="0.8" />
      </svg>

      {/* Ellipse silhouette — bottom left */}
      <svg
        className="absolute pointer-events-none"
        style={{ bottom: "-8%", left: "-5%", width: "50vw", maxWidth: 620, opacity: 0.11 }}
        viewBox="0 0 520 420" fill="none"
      >
        <ellipse cx="80" cy="350" rx="380" ry="220" stroke="#00E5FF" strokeWidth="2" />
        <ellipse cx="80" cy="350" rx="260" ry="145" stroke="#00E5FF" strokeWidth="1.4" />
        <ellipse cx="80" cy="350" rx="140" ry="80"  stroke="#7C3AED" strokeWidth="1" />
      </svg>

      {/* Hexagon silhouette — mid-section */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "15%", left: "25%", width: "48vw", maxWidth: 580, opacity: 0.10 }}
        viewBox="0 0 200 200" fill="none"
      >
        <polygon points="100,10 185,55 185,145 100,190 15,145 15,55" stroke="#2D5BFF" strokeWidth="1.5" />
        <polygon points="100,35 160,67.5 160,132.5 100,165 40,132.5 40,67.5" stroke="#7C3AED" strokeWidth="1" />
        <polygon points="100,60 135,80 135,120 100,140 65,120 65,80" stroke="#00E5FF" strokeWidth="0.7" />
      </svg>

      {/* Flowing wave lines — full width, top third */}
      <svg
        className="absolute pointer-events-none w-full"
        style={{ top: "10%", left: 0, opacity: 0.15 }}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120" fill="none"
      >
        <path d="M0 60 C240 10 480 110 720 60 C960 10 1200 110 1440 60" stroke="#2D5BFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M0 80 C240 30 480 130 720 80 C960 30 1200 130 1440 80" stroke="#7C3AED" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Flowing wave lines — bottom third */}
      <svg
        className="absolute pointer-events-none w-full"
        style={{ bottom: "8%", left: 0, opacity: 0.14 }}
        preserveAspectRatio="none"
        viewBox="0 0 1440 120" fill="none"
      >
        <path d="M0 60 C360 110 720 10 1080 60 C1260 85 1380 40 1440 60" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M0 80 C360 130 720 30 1080 80 C1260 105 1380 60 1440 80" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Abstract arc — decorative, center-right */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "35%", right: "2%", width: "32vw", maxWidth: 400, opacity: 0.12 }}
        viewBox="0 0 300 400" fill="none"
      >
        <path d="M280 20 Q20 200 280 380" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        <path d="M250 20 Q-10 200 250 380" stroke="#2D5BFF" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M220 20 Q-40 200 220 380" stroke="#00E5FF" strokeWidth="0.9" strokeLinecap="round" />
      </svg>

      {/* ════════════════════════════════════════════════════
          FOREGROUND — content
          ════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.90)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
            </span>
            <span className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.24em]">
              {tr.badge}
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-[5rem] font-black tracking-tighter text-foreground mb-6 leading-[0.93]">
            {tr.heading}{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #1E3A8A 0%, #2D5BFF 40%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {tr.subtitle}
            </span>
          </h2>
          
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {items.map((item, i) => (
            <FeatureCard key={item.title} item={item} i={i} />
          ))}


        </div>
      </div>
    </section>
  );
};
