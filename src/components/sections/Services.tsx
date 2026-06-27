"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, LayoutGrid, ShoppingBag, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const serviceIcons = [Target, Building2, ShoppingBag, LayoutGrid];
const serviceColors = ["text-accent-blue", "text-purple-400", "text-accent-green", "text-accent-cyan"];

export const Services = () => {
  const { t } = useLanguage();
  const tr = t("services");

  const services = tr.items.map((item, i) => ({
    ...item,
    icon: serviceIcons[i],
    color: serviceColors[i],
  }));

  return (
    <section id="services" className="py-12 md:py-32 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/[0.03] rounded-full blur-[150px] -z-10 pointer-events-none" />

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
          <p className="text-lg md:text-2xl text-foreground/50 max-w-3xl mx-auto font-medium leading-relaxed">
            {tr.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-card p-10 md:p-14 rounded-[3rem] border border-border/50 shadow-premium hover:shadow-hover hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                <service.icon className="h-40 w-40 text-foreground" />
              </div>

              <div className="relative z-10">
                <div className="p-5 rounded-2.5xl bg-foreground/[0.03] border border-border group-hover:bg-accent-blue/5 transition-colors shrink-0 w-fit mb-10">
                  <service.icon className={`h-12 w-12 ${service.color}`} />
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6 tracking-tight">{service.title}</h3>
                <p className="text-lg md:text-xl text-foreground/50 leading-relaxed font-medium mb-10 max-w-xl">
                  {service.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-blue/40" />
                      <span className="text-sm font-bold text-foreground/60 uppercase tracking-widest">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
