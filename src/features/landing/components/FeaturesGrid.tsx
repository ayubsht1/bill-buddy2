import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { FEATURES } from "@/lib/landing";

interface FeatureItemProps {
  title: string;
  Icon: any;
  bg: string;
  color: string;
  description: string;
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

export const FeaturesGrid = ({}) => {
  return (
    <section
      id="features"
      className="border-y border-border/60 bg-muted/30 px-6 py-24 md:px-10 md:py-32"
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
            Everything in one place
          </motion.p>
          <motion.h2
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
            variants={fadeInUp}
          >
            More than a bill splitter.
          </motion.h2>
          <motion.p
            className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base"
            variants={fadeInUp}
          >
            Track your personal spending, manage shared expenses, stay connected, and get intelligent
            insights into your financial activity.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURES.map(({ title, Icon, bg, color, description }) => (
            <motion.div
              key={title}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="group h-full rounded-2xl border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                <div className={`mb-6 inline-flex rounded-xl p-3 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold tracking-tight">
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
