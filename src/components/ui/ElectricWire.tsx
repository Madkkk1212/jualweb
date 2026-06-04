"use client";

import { motion } from "framer-motion";

export const ElectricWire = () => {
  return (
    <div className="mt-12 md:mt-20 w-full relative h-16 flex items-center">
      {/* Background faint line */}
      <div className="absolute left-0 right-0 h-[1px] bg-accent-blue/10" />

      {/* Jagged electricity SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 500 40"
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <defs>
          <linearGradient id="electricGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="10%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="50%" stopColor="rgba(96, 165, 250, 1)" />
            <stop offset="90%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <motion.path
          d="M0 20 L100 20 L110 5 L125 35 L140 20 L250 20 L265 0 L285 40 L300 20 L400 20 L410 10 L420 30 L430 20 L500 20"
          fill="none"
          stroke="url(#electricGlow)"
          strokeWidth="2"
          filter="url(#glow)"
          initial={{ pathLength: 0, pathOffset: 1 }}
          animate={{ pathLength: 1, pathOffset: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Secondary overlapping spark for more chaos */}
        <motion.path
          d="M0 20 L80 20 L95 10 L110 30 L120 20 L300 20 L315 5 L330 35 L345 20 L450 20 L460 5 L475 35 L485 20 L500 20"
          fill="none"
          stroke="rgba(147, 197, 253, 0.8)"
          strokeWidth="1.5"
          filter="url(#glow)"
          initial={{ pathLength: 0, pathOffset: 1, opacity: 0 }}
          animate={{ pathLength: 1, pathOffset: 0, opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
            delay: 0.3,
          }}
        />
      </svg>
      
      {/* Decorative dots at ends */}
      <div className="absolute left-0 w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]" />
      <div className="absolute right-0 w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]" />
    </div>
  );
};
