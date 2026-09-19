"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  Brain,
  CircleDollarSign,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { SignupForm } from "@/features/auth/components/signup-form";
import api from "@/lib/api/client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/register/", {
        firstName,
        lastName,
        username,
        email,
        password,
      });

      toast.success("Account created successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";

      toast.error(message);
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-20 px-5 py-5 md:px-8 md:py-7">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <Link
            href="/"
            className="text-base font-bold tracking-tight"
          >
            Bill <span className="text-primary">Buddy</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Back to home
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-[1500px] lg:grid-cols-[minmax(0,1fr)_540px]">
        {/* Left side */}
        <section className="hidden flex-col justify-center px-12 lg:flex xl:px-20 2xl:px-28">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your money, connected
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-[4rem]">
              Everything you need
              <span className="block text-primary">
                to manage your money.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground xl:text-lg xl:leading-8">
              Create your Bill Buddy account and bring your
              personal expenses, shared bills, groups,
              conversations, and spending insights together
              in one place.
            </p>

            {/* Features */}
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <CircleDollarSign className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Personal expenses
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Keep track of your everyday spending.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <Users className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Shared expenses
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Split and manage expenses with others.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <MessageCircle className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Conversations
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Stay connected around shared expenses.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <Brain className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  AI insights
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Discover patterns in your spending.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Right side */}
        <section className="flex items-center justify-center border-t border-border/60 px-5 py-16 sm:px-8 lg:border-l lg:border-t-0 lg:bg-muted/10 xl:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full max-w-[540px]"
          >
            {/* Mobile heading */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Start managing your expenses with Bill Buddy.
              </p>
            </div>

            {/* Signup form */}
            <SignupForm
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </motion.div>
        </section>
      </div>

      <Toaster position="top-center" />
    </main>
  );
}
