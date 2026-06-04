"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { siteConfig } from "@/lib/seo";
import { faqs } from "@/data/faqs";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-12 md:py-32 px-6 bg-transparent relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-600/[0.03] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/10 mb-6 font-bold text-xs text-accent-blue uppercase tracking-widest"
          >
            Tanya Jawab
          </motion.div>
          <h2 className="text-4xl md:text-8xl font-black text-foreground mb-8 tracking-tighter leading-[0.9]">
            Ada <br />
            <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10 italic">Pertanyaan?</span>
          </h2>
          <p className="text-lg md:text-2xl text-foreground/50 max-w-2xl mx-auto font-medium leading-relaxed">
            Temukan jawaban untuk pertanyaan yang paling sering diajukan mengenai layanan kami.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                openIndex === i ? "bg-card border-accent-blue/40 shadow-premium" : "bg-card/50 border-border/50 hover:border-accent-blue/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-8 md:p-10 text-left flex items-center justify-between transition-colors"
                aria-expanded={openIndex === i}
              >
                <div className="flex items-center gap-6">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    openIndex === i ? "bg-accent-blue text-white shadow-premium" : "bg-foreground/5 text-foreground/40"
                  }`}>
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <span className="text-xl md:text-2xl font-bold text-foreground pr-8">{item.q}</span>
                </div>
                <div className={`shrink-0 p-3 rounded-full transition-all duration-500 ${
                  openIndex === i ? "bg-accent-blue text-white rotate-180" : "bg-foreground/5 text-foreground/40"
                }`}>
                  {openIndex === i ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="px-10 pb-10 pt-2 text-lg md:text-xl text-foreground/50 font-medium leading-relaxed border-t border-border/20 mx-10">
                      <p className="pt-8">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           className="mt-20 text-center p-12 rounded-[3rem] bg-foreground/[0.02] border border-border/40"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">Masih punya pertanyaan lain?</h3>
          <p className="text-lg text-foreground/50 mb-8 font-medium">Tim kami siap membantu menjawab keraguan Anda secara langsung via WhatsApp.</p>
          <Link href={siteConfig.whatsapp} target="_blank">
            <Button variant="outline" size="lg" className="rounded-2xl px-12 border-border/60 hover:border-accent-blue/40 font-black tracking-tight">
              Tanya via WhatsApp
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
