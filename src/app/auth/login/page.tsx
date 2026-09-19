"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CircleDollarSign,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ResendVerificationModal } from "@/features/auth/components/resend-verification-modal";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (!errorParam) return;

    switch (errorParam) {
      case "GoogleBackendSyncFailed":
        toast.error("Internal Server Error. Please try again later.");
        break;

      case "AccessDenied":
        toast.error("Access was denied during sign in.");
        break;

      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        toast.error(
          "Could not complete Google login. Please try again later.",
        );
        break;

      default:
        toast.error("Authentication failed. Please try again later.");
        break;
    }

    router.replace("/auth/login", {
      scroll: false,
    });
  }, [searchParams, router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      if (res.code === "ACCOUNT_NOT_ACTIVATED") {
        setModalErrorMessage(
          "Your account has not been activated yet. Please verify your email.",
        );

        setShowVerifyModal(true);
      } else {
        toast.error(res.code || "Invalid email or password");
      }

      return;
    }

    toast.success("Logged in successfully!", {
      duration: 1200,
    });

    setTimeout(() => {
      router.push("/");
    }, 1300);
  };

  const handleResendVerification = async () => {
    setResending(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resend-verification/`,
        {
          email,
        },
      );

      toast.success(
        "Verification link sent! Check your inbox within 10 minutes.",
      );

      setShowVerifyModal(false);
    } catch (err) {
      toast.error("Failed to resend link. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      await signIn("google", {
        callbackUrl: "/?success=google",
      });
    } catch (error) {
      console.error("Google redirection failed:", error);

      toast.error(
        "Could not redirect to Google. Please try again later.",
      );

      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

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

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="absolute left-0 right-0 top-0 z-20 px-5 py-5 md:px-8 md:py-7">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto grid min-h-svh w-full max-w-[1500px] lg:grid-cols-[minmax(0,1fr)_540px]">
        {/* ===================================================
            LEFT BRAND PANEL
        =================================================== */}

        <section className="hidden flex-col justify-center px-12 py-28 lg:flex xl:px-20 2xl:px-28">
          <motion.div
            initial={{
              opacity: 0,
              x: -25,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="max-w-2xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your money, connected
            </div>

            <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.04em] xl:text-[4rem]">
              Manage your money.
              <span className="block text-primary">
                Understand it better.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground xl:text-lg xl:leading-8">
              Track personal expenses, manage shared costs,
              stay connected with your groups, and get
              AI-powered insights into your spending.
            </p>

            {/* Product highlights */}
            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <CircleDollarSign className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Personal expenses
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Keep your everyday spending organized.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <Users className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Shared expenses
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Manage expenses with friends and family.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <MessageCircle className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  Stay connected
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Keep conversations around your expenses.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:bg-card/80">
                <Brain className="h-5 w-5 text-primary" />

                <p className="mt-3 text-sm font-semibold">
                  AI insights
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Understand patterns in your spending.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ===================================================
            LOGIN PANEL
        =================================================== */}

        <section className="flex items-center justify-center px-5 py-24 sm:px-8 lg:border-l lg:border-border/60 lg:bg-muted/10 xl:px-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full max-w-md"
          >
            {/* Mobile branding */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Manage your expenses and stay connected.
              </p>
            </div>

            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={handleSubmit}
              onGoogleLogin={handleGoogleLogin}
            />

            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              By continuing, you agree to use Bill Buddy
              responsibly and keep your account secure.
            </p>
          </motion.div>
        </section>
      </div>

      {/* =====================================================
          VERIFICATION MODAL
      ===================================================== */}

      <AnimatePresence>
        {showVerifyModal && (
          <ResendVerificationModal
            showVerifyModal={showVerifyModal}
            setShowVerifyModal={setShowVerifyModal}
            modalErrorMessage={modalErrorMessage}
            resending={resending}
            handleResendVerification={handleResendVerification}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-center" />
    </main>
  );
}