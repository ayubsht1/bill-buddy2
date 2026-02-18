"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SignupForm } from "@/components/auth/SignupForm";
import api from "@/lib/api/api";
import { CircleArrowLeft } from "lucide-react";


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
      router.push("/login");
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
    <a
        href="/"
        className="absolute top-4 left-4 md:top-8 md:left-8 rounded-full bg-muted/50 hover:bg-muted p-2 transition"
      >
        <CircleArrowLeft className="text-primary h-8 w-8" />
      </a>
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
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
      </div>
      <Toaster position="top-center" />
    </div>
    </>
  );
}
