"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FEATURES, STEPS } from "@/lib/landing";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/components/user-dropdown";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react"; // 👈 Added useState
import { useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Explicit variant maps with 'as const' literal typing
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 100, damping: 16 } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 👈 State to hold the current active section ID (e.g. "features", "how-it-works")
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("success") === "google") {
      toast.success("Logged in with Google!", { duration: 1000 });
    }
  }, [searchParams]);

  // 👈 IntersectionObserver setup to dynamically listen to scroll highlights
  useEffect(() => {
    const sections = ["features", "how-it-works", "contact"];
    
    const observerOptions = {
      root: null, // viewport
      rootMargin: "-20% 0px -60% 0px", // Trigger when section occupies the sweet spot of viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Handle being at the very top of the page (Hero area)
    const handleScroll = () => {
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
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden scroll-smooth">
      
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight transition-transform duration-200 hover:scale-105">
            Bill Buddy
          </Link>

          {/* Nav Links with Active State Highlighting */}
          <nav className="hidden md:flex gap-1 text-sm font-medium items-center relative">
            {isAuthenticated && (
              <Link 
                href="/dashboard" 
                className={`relative px-3 py-2 rounded-md transition-colors duration-200 ${
                  pathname === "/dashboard" ? "text-primary font-semibold" : "hover:text-primary text-muted-foreground"
                }`}
              >
                Dashboard
                {pathname === "/dashboard" && (
                  <motion.div 
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )}

            {/* Features Link */}
            <Link 
              href="#features" 
              className={`relative px-3 py-2 rounded-md transition-colors duration-200 ${
                activeSection === "features" ? "text-primary font-semibold" : "hover:text-primary text-muted-foreground"
              }`}
            >
              Features
              {activeSection === "features" && (
                <motion.div 
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* How It Works Link */}
            <Link 
              href="#how-it-works" 
              className={`relative px-3 py-2 rounded-md transition-colors duration-200 ${
                activeSection === "how-it-works" ? "text-primary font-semibold" : "hover:text-primary text-muted-foreground"
              }`}
            >
              How It Works
              {activeSection === "how-it-works" && (
                <motion.div 
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* Contact Link */}
            <Link 
              href="#contact" 
              className={`relative px-3 py-2 rounded-md transition-colors duration-200 ${
                activeSection === "contact" ? "text-primary font-semibold" : "hover:text-primary text-muted-foreground"
              }`}
            >
              Contact
              {activeSection === "contact" && (
                <motion.div 
                  layoutId="activeNavPill"
                  className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          </nav>

          <div className="flex gap-2 items-center">
            {status === "loading" ? (
              <div className="h-8 w-24" />
            ) : status === "authenticated" ? (
              <UserDropdown />
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="transition-transform active:scale-95">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="transition-transform active:scale-95">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <Toaster position="top-center" containerStyle={{ top: 72 }} />

      {/* Hero Section */}
      <section
        className="relative flex-1 flex items-center justify-center text-center px-6 md:px-12 py-40 bg-cover bg-center min-h-[85vh]"
        style={{ backgroundImage: "url('/hero2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>

        <motion.div 
          className="relative z-10 max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white"
            variants={fadeInUp}
          >
            Simplify Your Bills with{" "}
            <span className="text-primary block sm:inline">Bill Buddy</span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8/relaxed"
            variants={fadeInUp}
          >
            Split expenses, track payments, and stay stress-free. Perfect for
            roommates, friends, and families who share costs.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            {status === "loading" ? (
              <div className="h-[48px] w-[160px]" />
            ) : status === "authenticated" ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-3 cursor-pointer text-white">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth/signup">
                    <Button size="lg" className="px-8 py-3 cursor-pointer text-white">
                      Get Started
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-3 bg-white/10 text-white hover:bg-white/20 hover:text-primary border-white cursor-pointer"
                    >
                      Login
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-12 py-24 bg-muted/30">
        <div className="text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary mb-4">
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Choose Bill Buddy?</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Everything you need to manage your shared expenses smoothly.
          </p>
        </div>

        <motion.div 
          className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {FEATURES.map(({ title, Icon, bg, color, description }) => (
            <motion.div 
              key={title} 
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="flex flex-col items-center space-y-4 p-6 text-center h-full transition-shadow duration-300 hover:shadow-md border border-muted">
                <div className={`rounded-full p-3 transition-transform duration-300 hover:rotate-12 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 bg-card">
        <div className="text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            How It Works
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            Splitting expenses has never been easier
          </h2>
          <p className="mx-auto mt-3 max-w-[700px] text-muted-foreground md:text-lg">
            Manage shared expenses in three simple steps.
          </p>
        </div>

        <motion.div 
          className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {STEPS.map(({ label, title, description }) => (
            <motion.div 
              key={label} 
              className="flex flex-col items-center space-y-4 text-center group"
              variants={fadeInUp}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                {label}
              </div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 md:px-12 py-24 bg-muted/20">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 items-center">
          <div>
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Contact
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              Let’s talk about your shared expenses
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
              Have questions, suggestions, or feedback? Reach out and we’ll get
              back to you as soon as possible.
            </p>
            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Email:</span> billbuddy789@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Location:</span> Remote / Global
              </p>
            </div>
          </div>

          {/* Form Card Animation */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Card className="p-8 shadow-sm border border-muted bg-card">
              <form
                className="grid gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Message submitted successfully!");
                }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200"
                  />
                </div>

                <textarea
                  placeholder="Your Message"
                  rows={4}
                  required
                  className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow duration-200 resize-none"
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" className="w-full text-white cursor-pointer shadow-md">
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-card">
        © {new Date().getFullYear()} Bill Buddy. All rights reserved.
      </footer>
    </div>
  );
}