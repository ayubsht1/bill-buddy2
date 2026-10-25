import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UseCasesProps {
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

export const UseCases = () => {
  return (
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div
            className="flex flex-col justify-between gap-6 md:flex-row md:items-end"
            variants={fadeInUp}
          >
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Built around real life
              </p>
              <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                One app for the money you manage every day.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Whether you're tracking your own spending, sharing expenses, or talking with the people
              involved, Bill Buddy keeps everything connected.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Personal",
                description: "Track everyday spending, subscriptions, shopping, food, transport, and more.",
              },
              {
                number: "02",
                title: "Shared",
                description: "Manage rent, dinners, trips, groceries, and other expenses with the people you share them with.",
              },
              {
                number: "03",
                title: "Connected",
                description: "Message people, discuss expenses, and keep financial conversations connected to your activity.",
              },
            ].map(({ number, title, description }) => (
              <motion.div
                key={number}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="group h-full rounded-2xl border-border/70 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">{number}</span>
                    <span className="h-2 w-2 rounded-full bg-primary/50 transition-transform group-hover:scale-150" />
                  </div>
                  <h3 className="mt-12 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
