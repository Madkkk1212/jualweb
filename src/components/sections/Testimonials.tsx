"use client";

import React from "react";
import { Star, Quote, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Review = {
  name: string;
  role: string;
  content: string;
  rating: number;
};

const TestimonialCard = ({ review }: { review: Review }) => (
  <div className="w-[85vw] md:w-[400px] lg:w-[450px] shrink-0 bg-card p-10 rounded-2.5xl border border-border shadow-soft relative group hover:shadow-premium transition-all duration-300">
    <Quote className="absolute top-8 right-8 h-10 w-10 text-accent-blue opacity-10 group-hover:opacity-20 transition-opacity" />

    <div className="flex gap-1 mb-6">
      {[...Array(review.rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-accent-cyan text-accent-cyan" />
      ))}
    </div>

    <p className="text-lg text-foreground/70 italic leading-relaxed mb-8 font-medium">
      &quot;{review.content}&quot;
    </p>

    <div className="flex items-center gap-4 border-t border-border pt-8">
      <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center border border-border">
        <User className="h-6 w-6 text-foreground/30" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-foreground leading-none">{review.name}</h4>
        <p className="text-sm font-bold text-accent-blue mt-1 uppercase tracking-widest leading-none">{review.role}</p>
      </div>
    </div>
  </div>
);

export const Testimonials = () => {
  const { t } = useLanguage();
  const tr = t("testimonials");

  const reviews: Review[] = tr.reviews.map((r) => ({
    ...r,
    rating: 5,
  }));

  return (
    <section id="testimonials" className="py-32 px-6 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/5 border border-accent-blue/10 mb-6 font-bold text-xs text-accent-blue uppercase tracking-widest">
            {tr.badge}
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-foreground mb-8 tracking-tighter">
            {tr.heading} <span className="text-gradient-blue text-glow-blue underline decoration-accent-blue/10">{tr.headingHighlight}</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto font-medium">
            {tr.subtitle}
          </p>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 50s linear infinite;
          }
          .marquee-container:hover .animate-marquee-track {
            animation-play-state: paused;
          }
        ` }} />

        <div className="relative w-full overflow-hidden marquee-container flex pb-4 pt-4">
          <div className="animate-marquee-track gap-8 md:gap-10 pr-8 md:pr-10">
            {[...reviews, ...reviews].map((review, i) => (
              <TestimonialCard key={`track1-${review.name}-${i}`} review={review} />
            ))}
          </div>
          <div className="animate-marquee-track gap-8 md:gap-10 pr-8 md:pr-10" aria-hidden="true">
            {[...reviews, ...reviews].map((review, i) => (
              <TestimonialCard key={`track2-${review.name}-${i}`} review={review} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};