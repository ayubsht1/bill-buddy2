"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function EmailVerified() {
  // Stagger configurations for a smooth top-down reveal sequence
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

 const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  } as const; // 🌟 Explicitly locks literal types like "spring"
  

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 bg-background">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center text-center space-y-6 rounded-2xl border bg-card p-8 md:p-10 shadow-sm relative overflow-hidden">
          
          {/* 🌟 1. Animated Success Badge with pulsing ring */}
          <div className="relative">
            {/* Soft pulsing background ripple */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            />
            
            {/* Pop-in Checkmark Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 12,
                delay: 0.2,
              }}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 z-10"
            >
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </motion.div>
          </div>

          {/* 🌟 2. Heading Content (Fades up after badge) */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your email has been successfully verified. You can now access all features of Bill Buddy.
            </p>
          </motion.div>

          {/* 🌟 3. Action Button with interactive hover physics */}
          <motion.div variants={itemVariants} className="w-full pt-2">
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
            >
              <Link
                href="/auth/login"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Proceed to Login
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}