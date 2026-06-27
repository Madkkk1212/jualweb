"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Figma, Code2, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const stepIcons = [MessageSquare, Figma, Code2, Rocket];
const stepColors = ["text-accent-blue", "text-accent-cyan", "text-accent-green", "text-purple-500"];
const stepBgs = ["bg-accent-blue/5", "bg-accent-cyan/5", "bg-accent-green/5", "bg-purple-500/5"];

export const Process = () => {
  const { t } = useLanguage();
  const tr = t("process");

  const steps = tr.steps.map((step, i) => ({
    ...step,
    icon: stepIcons[i],
    color: stepColors[i],
    bg: stepBgs[i],
  }));

  return (
    <section id="process" className="py-12 md:py-32 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-red-600/[0.03] rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/10 mb-6 font-bold text-xs text-accent-blue uppercase tracking-widest"
          >
            {tr.badge}
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
            {tr.heading} <br />
            <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">{tr.headingHighlight}</span>
          </h2>
          <p className="text-lg md:text-2xl text-foreground/50 max-w-3xl mx-auto font-medium">
            {tr.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Background Path Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-border to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative group text-center z-10"
            >
              <div className={`mx-auto w-28 h-28 rounded-[2.5rem] ${step.bg} border border-border/50 shadow-premium flex items-center justify-center mb-10 relative group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500`}>
                <step.icon className={`h-12 w-12 ${step.color}`} />
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-foreground text-background text-sm font-black flex items-center justify-center shadow-premium rotate-12 group-hover:rotate-0 transition-transform">
                  0{i + 1}
                </div>
              </div>

              <h3 className="text-2xl font-black text-foreground mb-6 tracking-tight">{step.title}</h3>
              <p className="text-lg text-foreground/50 leading-relaxed max-w-[280px] mx-auto font-medium">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
