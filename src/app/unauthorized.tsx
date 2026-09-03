"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const floatVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
  }
};

function UnauthorizedContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <motion.div className="text-center max-w-xl" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 className="text-9xl font-extrabold text-amber-500 mb-4 select-none" variants={itemVariants}>
          <motion.span className="inline-block" variants={floatVariants} animate="animate">
            401
          </motion.span>
        </motion.h1>

        <motion.h2 className="text-3xl font-semibold text-foreground mb-6" variants={itemVariants}>
          Authentication Required
        </motion.h2>

        <motion.p className="text-lg text-muted-foreground mb-8" variants={itemVariants}>
          You need to be signed in to view this page or perform this action.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link href="/login" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium shadow-sm transition-colors duration-200 hover:bg-primary/90">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
              Log In to Account
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(UnauthorizedContent), { ssr: false });