import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CTAProps {
  isAuthenticated: boolean;
}

export const CTA = ({ isAuthenticated }: CTAProps) => {
  return (
    <section className="px-6 pb-24 md:px-10 md:pb-32">
      <motion.div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/70 bg-muted/40 px-7 py-14 md:px-16 md:py-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Get started
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Ready to understand your money better?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            Start tracking your expenses, connect with the people you share money with, and get intelligent
            insights into your spending.
          </p>

          <div className="mt-7">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-11 rounded-lg px-7 text-sm shadow-sm">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button size="lg" className="h-11 rounded-lg px-7 text-sm shadow-sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
