"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FEATURES, STEPS } from "@/lib/landing";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full border-b bg-background z-50">
        <div className="flex justify-between items-center px-6 md:px-12 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Bill Buddy
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="hover:text-primary transition">
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:text-primary transition"
            >
              How It Works
            </Link>
            <Link href="#contact" className="hover:text-primary transition">
              Contact
            </Link>
          </nav>

          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline" className="cursor-pointer hover:text-primary">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="cursor-pointer hover:text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with background image */}
      <section
        className="relative flex-1 flex items-center justify-center text-center px-6 md:px-12 py-32 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero2.jpg')" }} // Replace with your image
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
              <Button size="lg" className="px-8 py-3 cursor-pointer hover:text-white">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 bg-white/10 text-white hover:bg-white/20 hover:text-primary border-white cursor-pointer"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-12 py-20 bg-muted/30">
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Features
          </div>

          <h2 className="text-3xl font-bold">Why Choose Bill Buddy?</h2>
          <p className="text-muted-foreground mt-2">
            Everything you need to manage your shared expenses.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, Icon, bg, color, description }) => (
            <Card
              key={title}
              className="flex flex-col items-center space-y-4 p-6 text-center"
            >
              <div className={`rounded-full p-3 ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>

              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-gray-500">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 bg-gray-50">
        <div className="text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            How It Works
          </div>

          <h2 className="mt-4 text-3xl md:text-4xl font-bold">
            Splitting expenses has never been easier
          </h2>

          <p className="mx-auto mt-3 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Manage shared expenses in three simple steps.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {STEPS.map(({ label, title, description }) => (
            <div
              key={label}
              className="flex flex-col items-center space-y-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {label}
              </div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Contact ───── */}
      <section id="contact" className="px-6 md:px-12 py-20">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2 items-start">
          {/* Left Side */}
          <div>
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              Contact
            </div>

            <h2 className="mt-4 text-3xl md:text-4xl font-bold">
              Let’s talk about your shared expenses
            </h2>

            <p className="mt-4 text-muted-foreground max-w-md">
              Have questions, suggestions, or feedback? Reach out and we’ll get
              back to you as soon as possible.
            </p>

            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <p>Email: support@billbuddy.com</p>
              <p>Location: Remote / Global</p>
            </div>
          </div>

          {/* Right Side Form */}
          <Card className="p-8 shadow-sm">
            <form
              className="grid gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Message submitted!");
              }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <textarea
                placeholder="Your Message"
                rows={5}
                required
                className="w-full rounded-lg border px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />

              <Button type="submit" className="w-full hover:text-white cursor-pointer">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bill Buddy. All rights reserved.
      </footer>
    </div>
  );
}
