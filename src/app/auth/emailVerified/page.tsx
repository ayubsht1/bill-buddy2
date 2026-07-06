import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function EmailVerified() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6 rounded-2xl border bg-card p-8 md:p-10 shadow-sm">
          
          {/* Success Animated Badge */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          {/* Heading Content */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your email has been successfully verified. You can now access all features of Bill Buddy.
            </p>
          </div>

          {/* Action Button */}
          <div className="w-full pt-2">
            <Link
              href="/auth/login"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Proceed to Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}