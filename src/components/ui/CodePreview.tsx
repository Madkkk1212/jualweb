"use client";

import React from "react";
import { motion } from "framer-motion";

export const CodePreview = () => {
  const codeLines = [
    { text: "import", color: "text-purple-400" },
    { text: " { NextPage } ", color: "text-accent-blue" },
    { text: "from", color: "text-purple-400" },
    { text: " 'next';", color: "text-accent-green" },
    { text: "", color: "" },
    { text: "const", color: "text-purple-400" },
    { text: " LumaSpace", color: "text-yellow-400" },
    { text: " = () => {", color: "text-foreground" },
    { text: "  return (", color: "text-foreground" },
    { text: "    <HeroSection", color: "text-accent-blue" },
    { text: "      title='Cepat & Premium'", color: "text-accent-cyan" },
    { text: "      withNext={true}", color: "text-accent-green" },
    { text: "    />", color: "text-accent-blue" },
    { text: "  );", color: "text-foreground" },
    { text: "};", color: "text-foreground" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg bg-card rounded-xl overflow-hidden border border-border shadow-2xl font-mono text-sm"
    >
      {/* Code Header */}
      <div className="bg-foreground/5 px-4 py-2 flex items-center justify-between border-b border-border">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <div className="text-foreground/30 text-xs">page.tsx</div>
      </div>

      {/* Code Body */}
      <div className="p-6">
        {codeLines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-foreground/20 select-none text-right w-4">{i + 1}</span>
            <span className={line.color}>{line.text}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
