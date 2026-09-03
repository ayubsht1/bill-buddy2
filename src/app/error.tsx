"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
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

const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <motion.div 
        className="text-center max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-9xl font-extrabold text-destructive mb-4 select-none"
          variants={itemVariants}
        >
          <motion.span
            className="inline-block"
            variants={pulseVariants}
            animate="animate"
          >
            500
          </motion.span>
        </motion.h1>

        <motion.h2 
          className="text-3xl font-semibold text-foreground mb-6"
          variants={itemVariants}
        >
          Internal Server Error
        </motion.h2>

        <motion.p 
          className="text-lg text-muted-foreground mb-8"
          variants={itemVariants}
        >
          {error.message || "Something went wrong on our end while connecting to the backend services."}
        </motion.p>

        <motion.div variants={itemVariants} className="flex gap-4 justify-center">
          <motion.button
            onClick={() => reset()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium shadow-sm transition-colors duration-200 hover:bg-primary/90"
          >
            Try Again
          </motion.button>

          <Link href="/" className="inline-block px-6 py-3 border border-border text-foreground rounded-md bg-transparent font-medium shadow-sm transition-colors duration-200 hover:bg-muted">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
              Back Home
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ErrorContent), { ssr: false });