"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Sparkles, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SignupFormProps {
  firstName: string;
  setFirstName: (value: string) => void;

  lastName: string;
  setLastName: (value: string) => void;

  username: string;
  setUsername: (value: string) => void;

  email: string;
  setEmail: (value: string) => void;

  password: string;
  setPassword: (value: string) => void;

  confirmPassword: string;
  setConfirmPassword: (value: string) => void;

  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  className?: string;
}

export function SignupForm({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  onSubmit,
  className,
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <Card
      className={cn(
        "w-full rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/[0.04]",
        className,
      )}
    >
      <CardHeader className="px-6 pb-4 pt-6 sm:px-8 sm:pt-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
              Create your account
            </CardTitle>

            <CardDescription className="mt-1 text-sm leading-5">
              Get started with Bill Buddy today.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium"
              >
                First name
              </Label>

              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                autoComplete="given-name"
                required
                className="h-11 rounded-xl bg-background/50 px-3.5 transition-shadow focus-visible:ring-2"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium"
              >
                Last name
              </Label>

              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                autoComplete="family-name"
                required
                className="h-11 rounded-xl bg-background/50 px-3.5 transition-shadow focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>

            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              autoComplete="username"
              required
              className="h-11 rounded-xl bg-background/50 px-3.5 transition-shadow focus-visible:ring-2"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="h-11 rounded-xl bg-background/50 pl-10 pr-3.5 transition-shadow focus-visible:ring-2"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                className="h-11 rounded-xl bg-background/50 pr-11 transition-shadow focus-visible:ring-2"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium"
            >
              Confirm password
            </Label>

            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
                className={cn(
                  "h-11 rounded-xl bg-background/50 pr-11 transition-shadow focus-visible:ring-2",
                  passwordsMismatch &&
                    "border-destructive focus-visible:ring-destructive",
                  passwordsMatch &&
                    "border-emerald-500 focus-visible:ring-emerald-500",
                )}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {passwordsMismatch && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <X className="h-3.5 w-3.5" />
                Passwords do not match
              </div>
            )}

            {passwordsMatch && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Passwords match
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
