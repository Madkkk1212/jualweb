"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Zap, Shield, Crown, GraduationCap } from "lucide-react";
import { Button } from "../ui/Button";
import Link from "next/link";
import { siteConfig } from "@/lib/seo";
import { useLanguage } from "@/contexts/LanguageContext";

const planIcons = [Zap, Crown, Star, GraduationCap];
const planVariants = ["outline", "primary", "cyan", "green"] as const;

export const Pricing = () => {
  const { t } = useLanguage();
  const tr = t("pricing");

  return (
    <section id="pricing" className="py-12 md:py-32 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/[0.03] rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/5 border border-accent-blue/10 mb-6 font-bold text-xs text-accent-blue uppercase tracking-[0.2em]"
          >
            {tr.badge}
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
            {tr.heading} <br />
            <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">{tr.headingHighlight}</span>
          </h2>
          <p className="text-lg md:text-2xl text-foreground/50 max-w-3xl mx-auto font-medium leading-relaxed">
            {tr.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tr.plans.map((plan, i) => {
            const Icon = planIcons[i];
            const variant = planVariants[i];
            const isActive = i === 1;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`group flex flex-col bg-card p-1 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] ${
                  isActive ? "border-accent-blue shadow-premium ring-8 ring-accent-blue/5 z-10" : "border-border/50 shadow-soft"
                }`}
              >
                <div className="flex-1 flex flex-col p-8 md:p-10 rounded-[2.2rem] bg-card overflow-hidden relative">
                  {isActive && (
                    <div className="absolute top-4 right-4 bg-accent-blue text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-premium">
                      <Star className="h-3 w-3 fill-white" /> {tr.mostRecommended}
                    </div>
                  )}

                  <div className="mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${isActive ? "bg-accent-blue/10 text-accent-blue" : "bg-foreground/5 text-foreground/40"} flex items-center justify-center mb-6 transition-colors group-hover:scale-110 duration-500`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                        {i === 0 ? "299K" : i === 1 ? "499K" : i === 2 ? "899K" : "1.4M+"}
                      </span>
                      <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest">
                        / {i === 3 ? tr.periodEstimate : tr.period}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground/50 leading-relaxed min-h-[60px]">
                      {plan.desc}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 group/item">
                        <div className={`mt-1 p-0.5 rounded-full ${isActive ? "bg-accent-blue/10 text-accent-blue" : "bg-accent-green/10 text-accent-green"} group-hover/item:scale-125 transition-transform`}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[15px] text-foreground/70 font-medium leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={siteConfig.whatsapp} target="_blank" className="mt-auto">
                    <Button
                      variant={variant}
                      className={`w-full py-6 text-base font-black shadow-lg ${isActive ? "bg-accent-blue hover:bg-accent-blue/90" : ""}`}
                    >
                      {tr.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-20 glass p-10 rounded-[3rem] border border-border/50 flex flex-col md:flex-row items-center justify-between gap-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 rounded-[2rem] bg-accent-green/10 flex items-center justify-center shadow-inner relative shrink-0">
              <Shield className="h-10 w-10 text-accent-green" />
              <div className="absolute inset-0 bg-accent-green/20 blur-2xl rounded-full" />
            </div>
            <div>
              <h4 className="text-2xl md:text-3xl font-black text-foreground mb-2 tracking-tight">{tr.guarantee}</h4>
              <p className="text-lg text-foreground/50 font-medium leading-relaxed max-w-2xl">
                {tr.guaranteeDesc}
              </p>
            </div>
          </div>
          <Link href={siteConfig.whatsapp} target="_blank">
            <Button variant="green" size="lg" className="px-10 h-16 text-lg font-black rounded-2xl shadow-premium">{tr.guaranteeCta}</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
