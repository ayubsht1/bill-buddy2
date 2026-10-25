import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

export const ContactSection = ({ onSubmit }: ContactFormProps) => {
  return (
    <section
      id="contact"
      className="border-t border-border/60 bg-muted/20 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div className="lg:pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Contact
            </p>
            <h2 className="max-w-md text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
              Have questions about <span className="block text-muted-foreground">Bill Buddy?</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground md:text-base">
              Have a question, suggestion, or need help with Bill Buddy? Send us a message and we'll get back to you.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                  <span className="text-sm text-muted-foreground">@</span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="mt-1 text-sm font-medium">billbuddy789@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                  <span className="text-sm text-muted-foreground">↗</span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Location</p>
                  <p className="mt-1 text-sm font-medium">Remote / Global</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="rounded-2xl border-border/70 bg-card p-6 shadow-sm md:p-8">
              <div className="mb-7">
                <h3 className="text-lg font-semibold tracking-tight">Send us a message</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill out the form below and we'll get back to you.
                </p>
              </div>

              <form
                className="grid gap-5"
                onSubmit={onSubmit}
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      required
                      className="h-11 w-full rounded-lg border border-border bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
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
                  <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
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
                    We'll only use your information to respond to your message.
                  </p>
                  <Button
                    type="submit"
                    className="h-10 w-full rounded-lg px-6 text-sm font-medium sm:w-auto"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
