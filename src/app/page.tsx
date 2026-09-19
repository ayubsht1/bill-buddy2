"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FEATURES, STEPS } from "@/lib/landing";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/components/user-dropdown";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import { motion } from "framer-motion";
import { ModeToggle } from "@/components/layout/dashboard/mode-toggle";

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 18,
    },
  },
};

const staggerContainer = {
  hidden: {
    opacity: 1,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  const { status } = useSession();

  const isAuthenticated = status === "authenticated";

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  /*
   * Authentication messages
   */
  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam === "google") {
      toast.success("Successfully logged in with Google!");
      cleanUrl();
    } else if (errorParam) {
      console.error("Auth Error Code:", errorParam);
      toast.error("Authentication failed. Please try again.");
      cleanUrl();
    }

    function cleanUrl() {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("success");
      params.delete("error");

      const query = params.toString();

      const cleanPath = query
        ? `${pathname}?${query}`
        : pathname;

      router.replace(cleanPath, {
        scroll: false,
      });
    }
  }, [searchParams, pathname, router]);

  /*
   * Scroll state + active navigation
   */
  useEffect(() => {
    const sections = [
      "features",
      "how-it-works",
      "contact",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground scroll-smooth">
      <Toaster
        position="top-center"
        containerStyle={{ top: 72 }}
      />

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="fixed left-0 top-0 z-50 w-full px-4 pt-3 md:px-6">
        <div
          className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 md:px-5 ${
            isScrolled
              ? "border-border/80 bg-background/90 shadow-lg backdrop-blur-xl"
              : "border-white/20 bg-black/20 shadow-sm backdrop-blur-md"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className={`text-base font-bold tracking-tight transition-colors ${
              isScrolled
                ? "text-foreground"
                : "text-white"
            }`}
          >
            Bill <span className="text-primary">Buddy</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-primary"
                    : isScrolled
                      ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
            )}

            <Link
              href="#features"
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                activeSection === "features"
                  ? "text-primary"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                activeSection === "how-it-works"
                  ? "text-primary"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              How It Works
            </Link>

            <Link
              href="#contact"
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                activeSection === "contact"
                  ? "text-primary"
                  : isScrolled
                    ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            {status === "loading" ? (
              <div className="h-9 w-20" />
            ) : isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:block"
                >
                  <Button
                    variant="ghost"
                    className={`h-9 px-3 text-[13px] ${
                      isScrolled
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Log in
                  </Button>
                </Link>

                <Link href="/auth/signup">
                  <Button className="h-9 rounded-lg px-4 text-[13px] shadow-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section
        className="relative flex min-h-[760px] items-center overflow-hidden bg-cover bg-center px-6 pt-20 md:min-h-[800px] md:px-10"
        style={{
          backgroundImage: "url('/hero2.jpg')",
        }}
      >
        {/* Main overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Soft color glow */}
        <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        {/* Bottom fade */}
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
              <span className="block text-primary">
                Stay connected.
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg"
              variants={fadeInUp}
            >
              Bill Buddy brings personal expense tracking,
              shared expenses, messaging, analytics, and
              AI-powered insights together in one simple place.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              variants={fadeInUp}
            >
              {status === "loading" ? (
                <div className="h-11 w-40 rounded-lg bg-white/10" />
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-11 rounded-lg px-6 text-sm shadow-lg"
                  >
                    Open Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="h-11 rounded-lg px-6 text-sm shadow-lg"
                    >
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

            {/* Trust indicators */}
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

      {/* =====================================================
          INTRO
      ===================================================== */}
      {/* <section className="px-6 py-24 md:px-10 md:py-32">
        <motion.div
          className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            margin: "-100px",
          }}
          variants={staggerContainer}
        >
          <div>
            <motion.p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
              variants={fadeInUp}
            >
              One place for your everyday finances
            </motion.p>

            <motion.h2
              className="max-w-2xl text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl"
              variants={fadeInUp}
            >
              Your expenses, conversations,
              and insights shouldn&apos;t be scattered.
            </motion.h2>
          </div>

          <motion.div
            className="space-y-5 text-muted-foreground"
            variants={fadeInUp}
          >
            <p className="text-base leading-7 md:text-lg">
              Track what you spend, manage expenses with friends
              and family, and keep your financial activity
              organized in one place.
            </p>

            <p className="text-sm leading-7">
              Bill Buddy combines personal expense management,
              shared expenses, messaging, analytics, and
              AI-powered insights so you can better understand
              and manage your money.
            </p>
          </motion.div>
        </motion.div>
      </section> */}

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section
        id="features"
        className="border-y border-border/60 bg-muted/30 px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-100px",
            }}
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
              Track your personal spending, manage shared
              expenses, stay connected, and get intelligent
              insights into your financial activity.
            </motion.p>
          </motion.div>

          <motion.div
            className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-100px",
            }}
          >
            {FEATURES.map(
              ({
                title,
                Icon,
                bg,
                color,
                description,
              }) => (
                <motion.div
                  key={title}
                  variants={fadeInUp}
                  whileHover={{
                    y: -5,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                >
                  <Card className="group h-full rounded-2xl border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
                    <div
                      className={`mb-6 inline-flex rounded-xl p-3 ${bg}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${color}`}
                      />
                    </div>

                    <h3 className="text-base font-semibold tracking-tight">
                      {title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  </Card>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section
        id="how-it-works"
        className="px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-100px",
            }}
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
              From everyday expenses
              to smarter decisions.
            </motion.h2>

            <motion.p
              className="mt-4 text-sm leading-7 text-muted-foreground md:text-base"
              variants={fadeInUp}
            >
              Track your spending, share expenses, stay
              connected, and let Bill Buddy help you understand
              your financial activity.
            </motion.p>
          </motion.div>

          <motion.div
            className="relative mt-14 grid gap-5 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-100px",
            }}
          >
            {STEPS.map(
              ({
                label,
                title,
                description,
              }) => (
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
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          USE CASES
      ===================================================== */}
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              margin: "-100px",
            }}
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
                  One app for the money
                  you manage every day.
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                Whether you&apos;re tracking your own spending,
                sharing expenses, or talking with the people
                involved, Bill Buddy keeps everything connected.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Personal",
                  description:
                    "Track everyday spending, subscriptions, shopping, food, transport, and more.",
                },
                {
                  number: "02",
                  title: "Shared",
                  description:
                    "Manage rent, dinners, trips, groceries, and other expenses with the people you share them with.",
                },
                {
                  number: "03",
                  title: "Connected",
                  description:
                    "Message people, discuss expenses, and keep financial conversations connected to your activity.",
                },
              ].map(
                ({
                  number,
                  title,
                  description,
                }) => (
                  <motion.div
                    key={number}
                    variants={fadeInUp}
                    whileHover={{
                      y: -5,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                  >
                    <Card className="group h-full rounded-2xl border-border/70 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {number}
                        </span>

                        <span className="h-2 w-2 rounded-full bg-primary/50 transition-transform group-hover:scale-150" />
                      </div>

                      <h3 className="mt-12 text-lg font-semibold">
                        {title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {description}
                      </p>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}
      <section className="px-6 pb-24 md:px-10 md:pb-32">
        <motion.div
          className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/70 bg-muted/40 px-7 py-14 md:px-16 md:py-16"
          initial={{
            opacity: 0,
            y: 24,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          {/* Decorative background */}
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Get started
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Ready to understand
              your money better?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              Start tracking your expenses, connect with the
              people you share money with, and get intelligent
              insights into your spending.
            </p>

            <div className="mt-7">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="h-11 rounded-lg px-7 text-sm shadow-sm"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="h-11 rounded-lg px-7 text-sm shadow-sm"
                  >
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}
      <section
        id="contact"
        className="border-t border-border/60 bg-muted/20 px-6 py-24 md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            {/* Contact information */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                margin: "-100px",
              }}
              variants={staggerContainer}
              className="lg:pt-4"
            >
              <motion.p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                variants={fadeInUp}
              >
                Contact
              </motion.p>

              <motion.h2
                className="max-w-md text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl"
                variants={fadeInUp}
              >
                Have questions about
                <span className="block text-muted-foreground">
                  Bill Buddy?
                </span>
              </motion.h2>

              <motion.p
                className="mt-5 max-w-md text-sm leading-7 text-muted-foreground md:text-base"
                variants={fadeInUp}
              >
                Have a question, suggestion, or need help with
                Bill Buddy? Send us a message and we&apos;ll get
                back to you.
              </motion.p>

              <motion.div
                className="mt-8 space-y-4"
                variants={fadeInUp}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-sm text-muted-foreground">
                      @
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      billbuddy789@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                    <span className="text-sm text-muted-foreground">
                      ↗
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Remote / Global
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <Card className="rounded-2xl border-border/70 bg-card p-6 shadow-sm md:p-8">
                <div className="mb-7">
                  <h3 className="text-lg font-semibold tracking-tight">
                    Send us a message
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out the form below and we&apos;ll get
                    back to you.
                  </p>
                </div>

                <form
                  className="grid gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();

                    toast.success(
                      "Message submitted successfully!"
                    );
                  }}
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label
                        htmlFor="contact-name"
                        className="text-sm font-medium"
                      >
                        Name
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        required
                        className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>

                    <div className="grid gap-2">
                      <label
                        htmlFor="contact-email"
                        className="text-sm font-medium"
                      >
                        Email
                      </label>

                      <input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="contact-message"
                      className="text-sm font-medium"
                    >
                      Message
                    </label>

                    <textarea
                      id="contact-message"
                      placeholder="How can we help?"
                      rows={6}
                      required
                      className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>

                  <div className="flex flex-col gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                      We&apos;ll only use your information to
                      respond to your message.
                    </p>

                    <motion.div
                      whileHover={{
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                    >
                      <Button
                        type="submit"
                        className="h-10 w-full rounded-lg px-6 text-sm font-medium sm:w-auto"
                      >
                        Send Message
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-border/60 bg-background px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-foreground"
            >
              Bill <span className="text-primary">Buddy</span>
            </Link>

            <p className="mt-1 text-xs text-muted-foreground">
              Personal expenses. Shared money. Smarter insights.
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bill Buddy. All rights
            reserved.
          </p>

          <div className="flex gap-5 text-xs text-muted-foreground">
            <Link
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How It Works
            </Link>

            <Link
              href="#contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}