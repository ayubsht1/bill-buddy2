"use client";

import { useState } from "react";
import { CircleArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PasswordResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/password-reset/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) throw new Error();
      toast.success("Reset link sent! Please check your email, the link will expire within 10 minutes.", { duration: 6000 });
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🌟 Animated Back Button: Physics-based hover alignment */}
      <motion.a
        href="/auth/login"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{ scale: 1.08, x: -3 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 rounded-full bg-muted/50 hover:bg-muted p-2 shadow-sm transition-colors duration-200 z-10"
      >
        <CircleArrowLeft className="text-primary h-8 w-8" />
      </motion.a>

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden relative">
        {/* 🌟 Animated Form Card Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Premium custom cubic-bezier
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-xl">Forgot Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                  />
                </div>

                {/* Submit button micro-interaction */}
                <motion.div whileTap={!(loading || !email) ? { scale: 0.98 } : {}}>
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={loading || !email}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary transition-colors">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Toaster position="top-center" />
    </>
  );
}