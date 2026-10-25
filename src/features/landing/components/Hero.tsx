import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HeroProps {
  status: string;
  isAuthenticated: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 18 },
  },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const Hero = ({ status, isAuthenticated }: HeroProps) => {
  return (
    <section
      className="relative flex min-h-[760px] items-center overflow-hidden bg-cover bg-center px-6 pt-20 md:min-h-[800px] md:px-10"
      style={{ backgroundImage: "url('/hero2.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/40 to-transparent" />

      <motion.div
        className="relative z-10 mx-auto w-full max-w-6xl"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-3xl">
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              Personal and shared expenses, in one place
            </span>
          </motion.div>

          <motion.h1
            className="mt-7 max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl"
            variants={fadeInUp}
          >
            Manage your money.
            <span className="block text-primary">Stay connected.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg"
            variants={fadeInUp}
          >
            Bill Buddy brings personal expense tracking, shared expenses, messaging, analytics, and
            AI-powered insights together in one simple place.
          </motion.p>

          <motion.div className="mt-8 flex flex-col gap-3 sm:flex-row" variants={fadeInUp}>
            {status === "loading" ? (
              <div className="h-11 w-40 rounded-lg bg-white/10" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-11 rounded-lg px-6 text-sm shadow-lg">
                  Open Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="h-11 rounded-lg px-6 text-sm shadow-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-lg border-white/25 bg-white/10 px-6 text-sm text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                  >
                    See how it works
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/55"
            variants={fadeInUp}
          >
            <span>Track your spending</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>Share expenses</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>AI-powered insights</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
