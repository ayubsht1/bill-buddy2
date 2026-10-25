import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { STEPS } from "@/lib/landing";

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

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            variants={fadeInUp}
          >
            Simple by design
          </motion.p>
          <motion.h2
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            variants={fadeInUp}
          >
            From everyday expenses to smarter decisions.
          </motion.h2>
          <motion.p
            className="mt-4 text-sm leading-7 text-muted-foreground md:text-base"
            variants={fadeInUp}
          >
            Track your spending, share expenses, stay connected, and let Bill Buddy help you understand
            your financial activity.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-14 grid gap-5 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {STEPS.map(({ label, title, description }) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              className="relative"
            >
              <Card className="h-full rounded-2xl border-border/70 bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {label}
                </div>
                <h3 className="mt-6 text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
