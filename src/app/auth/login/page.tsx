"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CircleArrowLeft, X } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ResendVerificationModal } from "@/components/auth/ResendVerificationModal";

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
      // 💡 Check explicitly for your custom code enum string
      if (res.code === "ACCOUNT_NOT_ACTIVATED") {
        setModalErrorMessage(
          "Account not activated. Please verify your email.",
        );
        setShowVerifyModal(true);
      } else {
        // Normal toast for incorrect passwords or other bad responses
        toast.error(res.code || "Invalid email or password");
      }
    } else {
      toast.success("Logged in successfully!", { duration: 1200 });
      setTimeout(() => router.push("/"), 1300);
    }
  };

  // 💡 Resend Verification Logic
  const handleResendVerification = async () => {
    setResending(true);
    try {
      // Adjust this URL to point to your actual Django resend verification endpoint
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resend-verification/`,
        {
          email: email,
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
      toast.error("Could not redirect to Google. Please try again.");
      setLoading(false); // Only need to turn off loading if the redirect fails
    }
  };

  return (
    <>
      <a
        href="/"
        className="absolute top-4 left-4 md:top-8 md:left-8 rounded-full bg-muted/50 hover:bg-muted p-2 transition"
      >
        <CircleArrowLeft className="text-primary h-8 w-8" />
      </a>

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            onSubmit={handleSubmit}
            onGoogleLogin={handleGoogleLogin}
          />
        </div>
      </div>

      {/* 💡 Verification Modal Overlay */}
      <ResendVerificationModal
        showVerifyModal={showVerifyModal}
        setShowVerifyModal={setShowVerifyModal}
        modalErrorMessage={modalErrorMessage}
        resending={resending}
        handleResendVerification={handleResendVerification}
      />

      <Toaster position="top-center" />
    </>
  );
}
