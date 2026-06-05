"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PIXEL_SIZE = 4;

/* ── Pixel font via CSS image-rendering trick ── */
const pixelStyle: React.CSSProperties = {
  fontFamily: "'Courier New', Courier, monospace",
  imageRendering: "pixelated",
};

/* ── Tiny pixel block ── */
const Px = ({
  color = "#2D5BFF",
  size = PIXEL_SIZE,
  opacity = 1,
}: {
  color?: string;
  size?: number;
  opacity?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      opacity,
      flexShrink: 0,
      imageRendering: "pixelated",
    }}
  />
);

/* ── Pixel progress bar ── */
const PixelBar = ({
  value,
  max = 100,
  color,
  label,
  sublabel,
}: {
  value: number;
  max?: number;
  color: string;
  label: string;
  sublabel: string;
}) => {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const blocks = 16;
  const filled = Math.round((animated / max) * blocks);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ ...pixelStyle, color: "rgba(15,23,42,0.5)" }}
        >
          {label}
        </span>
        <span
          className="text-[10px] font-black"
          style={{ ...pixelStyle, color }}
        >
          {sublabel}
        </span>
      </div>
      <div className="flex gap-[2px]">
        {Array.from({ length: blocks }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "100%",
              height: 8,
              backgroundColor: i < filled ? color : "rgba(15,23,42,0.07)",
              transition: `background-color ${0.05 * i}s ease`,
              imageRendering: "pixelated",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Pixel card decoration (corner brackets) ── */
const PixelCorners = ({ color = "#2D5BFF" }: { color?: string }) => (
  <>
    {/* top-left */}
    <div className="absolute top-0 left-0 pointer-events-none">
      <div style={{ width: 12, height: 3, backgroundColor: color }} />
      <div style={{ width: 3, height: 9, backgroundColor: color }} />
    </div>
    {/* top-right */}
    <div className="absolute top-0 right-0 pointer-events-none flex flex-col items-end">
      <div style={{ width: 12, height: 3, backgroundColor: color }} />
      <div style={{ width: 3, height: 9, backgroundColor: color }} />
    </div>
    {/* bottom-left */}
    <div className="absolute bottom-0 left-0 pointer-events-none flex flex-col justify-end">
      <div style={{ width: 3, height: 9, backgroundColor: color }} />
      <div style={{ width: 12, height: 3, backgroundColor: color }} />
    </div>
    {/* bottom-right */}
    <div className="absolute bottom-0 right-0 pointer-events-none flex flex-col items-end justify-end">
      <div style={{ width: 3, height: 9, backgroundColor: color }} />
      <div style={{ width: 12, height: 3, backgroundColor: color }} />
    </div>
  </>
);

/* ── Blinking cursor ── */
const BlinkCursor = () => {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <span
      style={{
        display: "inline-block",
        width: 9,
        height: 18,
        backgroundColor: on ? "#2D5BFF" : "transparent",
        verticalAlign: "middle",
        marginLeft: 2,
        imageRendering: "pixelated",
      }}
    />
  );
};

/* ── Scanline overlay ── */
const Scanlines = () => (
  <div
    className="absolute inset-0 pointer-events-none z-10"
    style={{
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.025) 3px, rgba(0,0,0,0.025) 4px)",
    }}
  />
);

/* ── Floating pixel particles ── */
const PixelParticle = ({
  x,
  y,
  color,
  delay,
}: {
  x: number;
  y: number;
  color: string;
  delay: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: 4, height: 4, backgroundColor: color, imageRendering: "pixelated" }}
    animate={{ y: [0, -18, 0], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: 3 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/* ── Stat feature cards ── */
const feats = [
  {
    icon: "⚡",
    title: "Sangat Cepat",
    desc: "Optimasi khusus untuk waktu muat instan.",
    color: "#FBBF24",
    code: "SPEED_MAX",
    val: 98,
  },
  {
    icon: "🔍",
    title: "SEO Terpadu",
    desc: "Struktur pencarian agar bisnis unggul di Google.",
    color: "#2D5BFF",
    code: "SEO_SCORE",
    val: 95,
  },
  {
    icon: "🛡️",
    title: "Keamanan Lapis",
    desc: "Enkripsi modern dan proteksi data terbaik.",
    color: "#10B981",
    code: "SEC_LEVEL",
    val: 100,
  },
  {
    icon: "🚀",
    title: "Sistem Tumbuh",
    desc: "Arsitektur yang mampu berkembang bersama bisnis.",
    color: "#A855F7",
    code: "SCALE_UP",
    val: 92,
  },
];

const techRows = [
  { label: "Antarmuka", value: "Sistem Modern", color: "#2D5BFF", pct: 97 },
  { label: "Visual", value: "Desain Adaptif", color: "#00E5FF", pct: 92 },
  { label: "Cloud", value: "Server Global", color: "#10B981", pct: 88 },
  { label: "Interaksi", value: "Animasi Halus", color: "#A855F7", pct: 94 },
];

export const TechStack = () => {
  const particles = [
    { x: 10, y: 20, color: "#2D5BFF", delay: 0 },
    { x: 80, y: 15, color: "#00E5FF", delay: 0.8 },
    { x: 60, y: 70, color: "#A855F7", delay: 1.4 },
    { x: 25, y: 80, color: "#10B981", delay: 0.4 },
    { x: 90, y: 55, color: "#FBBF24", delay: 1.9 },
    { x: 45, y: 35, color: "#2D5BFF", delay: 2.3 },
  ];

  return (
    <section
      id="tech"
      className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-transparent"
    >
      {/* floating pixels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <PixelParticle key={i} {...p} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 border-2"
            style={{
              ...pixelStyle,
              borderColor: "#2D5BFF",
              backgroundColor: "rgba(45,91,255,0.06)",
              imageRendering: "pixelated",
            }}
          >
            <Px color="#2D5BFF" size={6} />
            <span
              className="text-[10px] font-black uppercase tracking-[0.25em]"
              style={{ ...pixelStyle, color: "#2D5BFF" }}
            >
              LAYANAN PEMBUATAN WEBSITE 
            </span>
            <Px color="#2D5BFF" size={6} />
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground mb-4 leading-tight"
          >
            Website Cepat.{" "}
            <span style={{ ...pixelStyle, color: "#2D5BFF" }}>
              Hasil Maksimal.
            </span>
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto font-medium leading-relaxed">
            Kami tidak menggunakan template murahan. Setiap baris kode dirancang
            secara khusus untuk memastikan website Anda bukan hanya cantik, tapi
            juga mesin pertumbuhan bisnis.
          </p>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── LEFT: Pixel terminal card ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* CRT screen wrapper */}
            <div
              className="relative rounded-none overflow-hidden"
              style={{
                border: "3px solid #0F172A",
                boxShadow: "6px 6px 0px #0F172A, inset 0 0 60px rgba(45,91,255,0.04)",
                backgroundColor: "#FAFAF7",
                imageRendering: "pixelated",
              }}
            >
              <Scanlines />

              {/* Title bar */}
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b-2"
                style={{ borderColor: "#0F172A", backgroundColor: "#0F172A" }}
              >
                <div className="flex items-center gap-2">
                  <Px color="#EF4444" size={10} />
                  <Px color="#FBBF24" size={10} />
                  <Px color="#10B981" size={10} />
                </div>
                <span
                  className="text-[10px] font-black text-white uppercase tracking-widest"
                  style={pixelStyle}
                >
                  ARSITEKTUR_MODERN.exe
                </span>
                <span
                  className="text-[10px] text-white/40"
                  style={pixelStyle}
                >
                  ■□□
                </span>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8">
                {/* Prompt line */}
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className="text-xs font-black"
                    style={{ ...pixelStyle, color: "#10B981" }}
                  >
                    LUMA@WEB:~$
                  </span>
                  <span
                    className="text-xs font-black text-slate-800"
                    style={pixelStyle}
                  >
                    run system-check --all
                  </span>
                  <BlinkCursor />
                </div>

                {/* Progress bars */}
                <div
                  className="p-4 mb-4 border-2"
                  style={{
                    borderColor: "rgba(15,23,42,0.1)",
                    backgroundColor: "rgba(15,23,42,0.02)",
                    imageRendering: "pixelated",
                  }}
                >
                  {techRows.map((row) => (
                    <PixelBar
                      key={row.label}
                      label={row.label}
                      sublabel={row.value}
                      value={row.pct}
                      color={row.color}
                    />
                  ))}
                </div>

                {/* Status line */}
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 8, height: 8, backgroundColor: "#10B981", imageRendering: "pixelated" }}
                  />
                  <span
                    className="text-[11px] font-black"
                    style={{ ...pixelStyle, color: "#10B981" }}
                  >
                    SISTEM BERJALAN OPTIMAL — 100%
                  </span>
                </div>

                {/* Pixel deco grid bottom */}
                <div className="flex gap-[2px] mt-5 opacity-20">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <Px
                      key={i}
                      color={["#2D5BFF", "#00E5FF", "#10B981", "#A855F7"][i % 4]}
                      size={5}
                    />
                  ))}
                </div>
              </div>

              {/* pixel corners */}
              <PixelCorners color="#2D5BFF" />
            </div>
          </motion.div>

          {/* ── RIGHT: Feature cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feats.map((f, i) => (
              <motion.div
                key={f.code}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="relative group cursor-default"
              >
                <div
                  className="relative overflow-hidden h-full"
                  style={{
                    border: "2px solid #0F172A",
                    boxShadow: `4px 4px 0px ${f.color}55`,
                    backgroundColor: "#FAFAF7",
                    imageRendering: "pixelated",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <Scanlines />
                  {/* top bar */}
                  <div
                    className="flex items-center justify-between px-3 py-1.5 border-b-2"
                    style={{
                      borderColor: "#0F172A",
                      backgroundColor: "#0F172A",
                    }}
                  >
                    <span
                      className="text-[9px] font-black tracking-widest uppercase"
                      style={{ ...pixelStyle, color: f.color }}
                    >
                      {f.code}
                    </span>
                    <div className="flex gap-[3px]">
                      <Px color={f.color} size={5} opacity={0.4} />
                      <Px color={f.color} size={5} opacity={0.7} />
                      <Px color={f.color} size={5} />
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-4 relative z-10">
                    {/* Icon pixel-box */}
                    <div
                      className="flex items-center justify-center mb-3"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: `${f.color}15`,
                        border: `2px solid ${f.color}40`,
                        imageRendering: "pixelated",
                      }}
                    >
                      <span className="text-xl leading-none">{f.icon}</span>
                    </div>

                    <h4
                      className="font-black text-slate-900 text-sm mb-1"
                      style={pixelStyle}
                    >
                      {f.title}
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                      {f.desc}
                    </p>

                    {/* Mini pixel bar */}
                    <div className="flex gap-[2px]">
                      {Array.from({ length: 12 }).map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.08 + j * 0.03 }}
                          style={{
                            flex: 1,
                            height: 5,
                            backgroundColor:
                              j < Math.round((f.val / 100) * 12)
                                ? f.color
                                : "rgba(15,23,42,0.08)",
                            imageRendering: "pixelated",
                            transformOrigin: "bottom",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span
                        className="text-[8px] font-black text-slate-400"
                        style={pixelStyle}
                      >
                        0%
                      </span>
                      <span
                        className="text-[8px] font-black text-slate-900"
                        style={pixelStyle}
                      >
                        {f.val}%
                      </span>
                    </div>
                  </div>

                  <PixelCorners color={f.color} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
