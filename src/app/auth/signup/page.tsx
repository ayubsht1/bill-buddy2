"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { SignupForm } from "@/components/auth/SignupForm";
import api from "@/lib/api/api";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/register/", {
        firstName,
        lastName,
        username,
        email,
        gender,
      });

      setLoading(false);
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err: any) {
      setLoading(false);
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(message);
      console.log("Signup error:", err);
    }
  };

  return (
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
          gender={gender}
          setGender={setGender}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
