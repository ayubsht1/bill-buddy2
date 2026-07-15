"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CircleArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ResendVerificationModal } from "@/components/auth/ResendVerificationModal";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 💡 Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          "Account not activated. Please verify your email.",
        );
        setShowVerifyModal(true);
      } else {
        toast.error(res.code || "Invalid email or password");
      }
    } else {
      toast.success("Logged in successfully!", { duration: 1200 });
      setTimeout(() => router.push("/"), 1300);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resend-verification/`,
        { email },
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
      toast.error("Could not redirect to Google. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🌟 Animated Back Button: Smooth spring bounce hover */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.08, x: -3 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-10"
      >
        <Link 
          href="/" 
          className="block rounded-full bg-muted/50 hover:bg-muted p-2 shadow-sm transition-colors duration-200"
        >
          <CircleArrowLeft className="text-primary h-8 w-8" />
        </Link>
      </motion.div>

      {/* 🌟 Entry animation for the core page container */}
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Custom springy ease-out
          className="w-full max-w-sm"
        >
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </motion.div>
      </div>

      {/* 🌟 AnimatePresence guarantees smooth fade-out when unmounting */}
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
    </>
  );
}