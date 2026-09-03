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

const shakeVariants: Variants = {
  animate: {
    rotate: [0, -3, 3, -3, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

function ForbiddenContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <motion.div className="text-center max-w-xl" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 className="text-9xl font-extrabold text-destructive mb-4 select-none" variants={itemVariants}>
          <motion.span className="inline-block" variants={shakeVariants} animate="animate">
            403
          </motion.span>
        </motion.h1>

        <motion.h2 className="text-3xl font-semibold text-foreground mb-6" variants={itemVariants}>
          Access Forbidden
        </motion.h2>

        <motion.p className="text-lg text-muted-foreground mb-8" variants={itemVariants}>
          You do not have the required permissions or roles to access this resource.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link href="/" className="inline-block px-6 py-3 border border-border text-foreground rounded-md bg-transparent font-medium shadow-sm transition-colors duration-200 hover:bg-muted">
            <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
              Return to Dashboard
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ForbiddenContent), { ssr: false });