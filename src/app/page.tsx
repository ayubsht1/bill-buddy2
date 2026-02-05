"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 md:px-12 py-4 shadow-sm relative z-20">
        <Link href="/" className="text-2xl font-bold text-primary">
          Bill Buddy
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="hover:text-primary transition">
            Features
          </Link>
          <Link href="#about" className="hover:text-primary transition">
            About
          </Link>
          <Link href="#contact" className="hover:text-primary transition">
            Contact
          </Link>
        </nav>
        <div className="flex gap-2">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with background image */}
      <section
        className="relative flex-1 flex items-center justify-center text-center px-6 md:px-12 py-32 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }} // Replace with your image
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            Simplify Your Bills with{" "}
            <span className="text-primary">Bill Buddy</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            Split expenses, track payments, and stay stress-free. Perfect for
            roommates, friends, and families who share costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="px-8 py-3 bg-white/10 text-white hover:bg-white/20 border-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-12 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Why Choose Bill Buddy?</h2>
          <p className="text-muted-foreground mt-2">
            Everything you need to manage your shared expenses.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <div className="p-6 rounded-lg shadow bg-card">
            <h3 className="text-xl font-semibold mb-2">Track Expenses</h3>
            <p className="text-muted-foreground">
              Keep a detailed log of all your shared and personal expenses.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-card">
            <h3 className="text-xl font-semibold mb-2">Split Bills</h3>
            <p className="text-muted-foreground">
              Automatically calculate each person’s share, hassle-free.
            </p>
          </div>
          <div className="p-6 rounded-lg shadow bg-card">
            <h3 className="text-xl font-semibold mb-2">Stay Notified</h3>
            <p className="text-muted-foreground">
              Get reminders and notifications for timely payments.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Bill Buddy. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="#features" className="hover:text-primary">
            Features
          </Link>
          <Link href="#about" className="hover:text-primary">
            About
          </Link>
          <Link href="#contact" className="hover:text-primary">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
