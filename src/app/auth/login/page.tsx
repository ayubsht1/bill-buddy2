"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CircleArrowLeft, X } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/resend-activation/`,
        {
          email: email,
        },
      );
      toast.success("Verification link sent! Check your inbox.");
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
      const res = await signIn("google", {
        callbackUrl: "/?success=google",
        redirect: false,
      });

      if (res?.error) {
        toast.error("Google login failed. Please try again.");
      }
    } catch {
      toast.error("Request timed out. Please try again.");
    } finally {
      setLoading(false);
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
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowVerifyModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-destructive">
                Account Activation Required
              </h2>
              <p className="text-sm text-muted-foreground">
                {modalErrorMessage}
              </p>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={resending}
                  onClick={handleResendVerification}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/95 disabled:opacity-50 transition"
                >
                  {resending ? "Sending Link..." : "Resend Verification Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-center" />
    </>
  );
}
