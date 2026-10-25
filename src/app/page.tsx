"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useLandingPage } from "@/features/landing/hooks/useLandingPage";
import { LandingNav } from "@/features/landing/components/LandingNav";
import { Hero } from "@/features/landing/components/Hero";
import { FeaturesGrid } from "@/features/landing/components/FeaturesGrid";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { UseCases } from "@/features/landing/components/UseCases";
import { CTA } from "@/features/landing/components/CTA";
import { ContactSection } from "@/features/landing/components/ContactSection";
import toast from "react-hot-toast";

export default function LandingPage() {
  const { status } = useSession();
  const { activeSection, isScrolled } = useLandingPage();

  const isAuthenticated = status === "authenticated";

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message submitted successfully!");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground scroll-smooth">
      <Toaster position="top-center" containerStyle={{ top: 72 }} />

      <LandingNav
        isScrolled={isScrolled}
        activeSection={activeSection}
        isAuthenticated={isAuthenticated}
        status={status}
      />

      <Hero status={status} isAuthenticated={isAuthenticated} />
      <FeaturesGrid />
      <HowItWorks />
      <UseCases />
      <CTA isAuthenticated={isAuthenticated} />
      <ContactSection onSubmit={handleContactSubmit} />

      <footer className="border-t border-border/60 bg-background px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/" className="text-sm font-semibold text-foreground">
              Bill <span className="text-primary">Buddy</span>
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
              Personal expenses. Shared money. Smarter insights.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bill Buddy. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a>
            <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
