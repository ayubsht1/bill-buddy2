"use client";

import dynamic from 'next/dynamic';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

function GlobalErrorContent({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
        <motion.div 
          className="text-center max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 className="text-8xl font-black text-destructive mb-4" variants={itemVariants}>
            System Error
          </motion.h1>

          <motion.h2 className="text-2xl font-bold text-foreground mb-4" variants={itemVariants}>
            Critical Application Failure
          </motion.h2>

          <motion.p className="text-muted-foreground mb-8" variants={itemVariants}>
            An unrecoverable error occurred within the core application layout.
          </motion.p>

          <motion.div variants={itemVariants}>
            <motion.button
              onClick={() => reset()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-destructive text-destructive-foreground rounded-md font-medium shadow-sm transition-colors hover:bg-destructive/90"
            >
              Reload Application
            </motion.button>
          </motion.div>
        </motion.div>
      </body>
    </html>
  );
}

export default dynamic(() => Promise.resolve(GlobalErrorContent), { ssr: false });