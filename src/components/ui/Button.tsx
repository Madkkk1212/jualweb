"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "outline" | "ghost" | "cyan" | "green";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-accent-blue text-white shadow-soft hover:shadow-premium hover:bg-accent-blue/90 font-bold",
    outline: "border border-border text-foreground hover:bg-foreground/5 font-bold",
    ghost: "text-foreground/60 hover:text-foreground hover:bg-foreground/5 font-bold",
    cyan: "bg-gradient-to-br from-accent-cyan to-accent-blue text-slate-950 font-black shadow-premium hover:shadow-hover hover:scale-105",
    green: "bg-gradient-to-br from-accent-green to-accent-cyan text-slate-950 font-black shadow-premium hover:shadow-hover hover:scale-105",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg font-semibold",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-2.5xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

