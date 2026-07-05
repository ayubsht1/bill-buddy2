"use client";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';

// 1. Declare animation variants safely with strict explicit types
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

const floatVariants: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// 2. Wrap the core component structure
function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
      <motion.div 
        className="text-center max-w-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-9xl font-extrabold text-primary mb-4 select-none"
          variants={itemVariants}
        >
          <motion.span
            className="inline-block"
            variants={floatVariants}
            animate="animate"
          >
            404
          </motion.span>
        </motion.h1>
        
        <motion.h2 
          className="text-3xl font-semibold text-foreground mb-6"
          variants={itemVariants}
        >
          Page Not Found
        </motion.h2>
        
        <motion.p 
          className="text-lg text-muted-foreground mb-8"
          variants={itemVariants}
        >
          Oops! It looks like the page you are looking for doesn't exist.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Link href="/" className="inline-block px-6 py-3 border border-primary text-primary rounded-md bg-transparent font-medium shadow-sm transition-colors duration-200 hover:bg-primary/10">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              Go to Homepage
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 3. Disable SSR parsing exclusively for this client animated layout view
export default dynamic(() => Promise.resolve(NotFoundContent), {
  ssr: false,
});