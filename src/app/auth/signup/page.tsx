"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SignupForm } from "@/components/auth/SignupForm";
import api from "@/lib/api/api";
import { CircleArrowLeft } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🌟 Animated Back Button: Smooth entry and spring-back hover */}
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

      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden relative">
        {/* 🌟 Signup Card Wrapper: Matching slide-up spring style */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
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
      </div>
      
      <Toaster position="top-center" />
    </>
  );
}