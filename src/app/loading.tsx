"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        
        {/* 🌟 Animated Interlocking Rings */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Outer Pulsing Glow */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-16 w-16 rounded-full bg-primary/20"
          />
          
          {/* Middle Rotating Dash Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-12 w-12 rounded-full border-2 border-dashed border-primary/40"
          />

          {/* Inner Fast Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute h-8 w-8 rounded-full border-t-2 border-r-2 border-primary"
          />
        </div>

        {/* 🌟 Elegant Staggered Letters Fade-In */}
        <div className="flex gap-1">
          {"LOADING".split("").map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0.2, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.1, // Staggered sequence delay
                ease: "easeInOut",
              }}
              className="text-xs font-bold tracking-widest text-foreground/80"
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}