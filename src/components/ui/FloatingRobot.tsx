"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FloatingRobot() {
  return (
    <motion.div
      className="fixed bottom-24 left-4 z-50 md:bottom-8 md:left-8 cursor-pointer"
      animate={{
        y: [0, -15, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      title="Halo! Saya asisten virtual Luma"
    >
      <div className="relative w-80 h-80 md:w-96 md:h-96 drop-shadow-2xl">
        <Image
          src="/img/robotnya.png"
          alt="Robot Assistant"
          fill
          className="object-contain hover:scale-150 transition-transform duration-300"
          unoptimized // Remove if you want Next.js to optimize, but assuming local file for now
        />
      </div>
    </motion.div>
  );
}
