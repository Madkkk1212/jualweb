"use client";

import React, { useRef } from "react";
import { Button } from "../ui/Button";
import { ElectricWire } from "../ui/ElectricWire";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const tr = t("hero");

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center pt-8 md:pt-10 pb-4 md:pb-8 px-4 sm:px-6 overflow-hidden bg-transparent">
      {/* Premium abstract background silhouettes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Abstract oversized Hexagon */}
        <svg className="absolute -top-[10%] -right-[5%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] text-accent-blue/30 transform rotate-12" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5" stroke="currentColor" strokeWidth="0.2" />
        </svg>

        {/* Curved elegant wave left side */}
        <svg className="absolute top-[10%] -left-[10%] w-[90vw] h-[90vw] max-w-[1000px] max-h-[1000px] text-accent-blue/30" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-50,100 C20,150 80,0 150,50 C220,100 250,200 300,150" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M-50,120 C10,170 70,20 140,70 C210,120 240,220 290,170" stroke="currentColor" strokeWidth="0.25" strokeLinecap="round" />
        </svg>

        {/* Thin flowing lines bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-[25vh] text-accent-blue/40" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96" stroke="currentColor" strokeWidth="1" />
          <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,176C960,171,1056,181,1152,197.3C1248,213,1344,235,1392,245.3L1440,256" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        {/* Soft gradient fade to blend the top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80 pointer-events-none" />
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center z-10 transition-all duration-700">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 text-center lg:text-left order-2 lg:order-1"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:inline-flex max-w-full items-center gap-2 px-3 py-2 rounded-full bg-foreground/[0.03] border border-border/50 mb-6 md:mb-10 shadow-soft backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-foreground/60 uppercase tracking-[0.18em] sm:tracking-[0.2em] text-left sm:text-center">
              {tr.badge}
            </span>
          </motion.div>

          <h1 className="text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6 md:mb-10 leading-[1.05] lg:-ml-1">
            <span className="block text-foreground/90 font-extrabold text-[1.9rem] sm:text-4xl md:text-5xl lg:text-6xl tracking-tight mb-1 leading-tight">
              {tr.headline1}
            </span>
            <span className="block relative">
              <span className="text-gradient-hero drop-shadow-sm">
                {tr.headline2}
              </span>
              {" "}
              <span className="relative inline-block">
                <span className="text-foreground">{tr.headline3}</span>
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" preserveAspectRatio="none">
                  <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2D5BFF"/>
                      <stop offset="1" stopColor="#00E5FF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
            <span className="block text-[1.5rem] sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground/50 tracking-normal mt-2 leading-snug">
              {tr.headline4}{" "}
              <span className="text-gradient-hero font-black">{tr.headline5}</span>
            </span>
          </h1>

          {/* Google SEO badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center lg:justify-start mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/40 border border-sky-400/20 shadow-soft backdrop-blur-sm">
              {/* Google logo mini */}
              <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-xs font-bold text-sky-400">{tr.seoBadge1}</span>
              <span className="w-px h-4 bg-white/10"/>
              <span className="text-xs font-bold text-sky-300">{tr.seoBadge2}</span>
            </div>
          </motion.div>

          <p className="text-base sm:text-lg md:text-2xl text-foreground/70 mb-8 md:mb-12 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0">
            {tr.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center lg:justify-start">
            <Link href="/portfolio" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 text-base md:text-lg shadow-premium hover:shadow-hover group">
                {tr.cta1} <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://wa.me/6289514618737" target="_blank" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 text-base md:text-lg border-border/60 hover:border-accent-blue/40 bg-white/5 backdrop-blur-sm">
                {tr.cta2}
              </Button>
            </Link>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative z-20 perspective-1000 flex flex-col items-center justify-center lg:justify-end py-4 md:py-20 order-1 lg:order-2"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex flex-col items-center gap-3 mb-6"
          >
            {/* Badge 1: Label */}
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-foreground/[0.03] border border-border/50 shadow-soft backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-foreground/60 uppercase tracking-[0.18em] sm:tracking-[0.2em] text-center">
                {tr.badge}
              </span>
            </div>
            {/* Badge 2: Google */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-950/40 border border-sky-400/20 shadow-soft backdrop-blur-sm">
              <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-xs font-bold text-sky-400">{tr.seoBadge1}</span>
              <span className="w-px h-4 bg-white/10"/>
              <span className="text-xs font-bold text-sky-300">{tr.seoBadge2}</span>
            </div>
          </motion.div>

          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative w-full max-w-[400px] sm:max-w-[550px] lg:max-w-[650px] h-[350px] sm:h-[500px] md:h-[600px] lg:h-[650px] -translate-x-2 lg:-translate-x-8 -translate-y-32 lg:-translate-y-64"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-gradient-to-tr from-accent-blue/20 via-purple-500/15 to-transparent rounded-full blur-[90px] md:blur-[120px] pointer-events-none opacity-70" />

            <motion.div
              style={{ translateZ: "50px" }}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-[350px] h-[350px] md:w-[650px] md:h-[650px] drop-shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: "spring", bounce: 0.5 }}
                  className="absolute top-4 sm:top-10 -left-4 sm:-left-10 md:left-10 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-3 rounded-2xl rounded-bl-none shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)] border border-accent-blue/20 z-30 max-w-[200px]"
                >
                  <p className="text-xs sm:text-sm font-bold leading-tight">
                    {tr.robotMsg}
                  </p>
                  <div className="absolute bottom-[-8px] left-0 w-4 h-4 bg-white dark:bg-zinc-800 border-b border-l border-accent-blue/20 rounded-bl-sm transform rotate-[-45deg]"></div>
                </motion.div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/img/robotnya.png"
                  alt="Robot Assistant"
                  className="w-full h-full object-contain object-top"
                />
              </div>
            </motion.div>
          </motion.div>
          <div className="absolute top-[60%] lg:top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] sm:w-[120vw] z-[-1] opacity-80 mix-blend-screen pointer-events-none">
            <ElectricWire />
          </div>
        </motion.div>
      </div>


    </section>
  );
};