"use client";

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
import { useState } from "react";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
  className?: string;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onGoogleLogin,
  className,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card
      className={cn(
        "w-full rounded-2xl border-border/70 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-sm",
        className,
      )}
    >
      <CardHeader className="space-y-3 px-6 pb-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome back
          </CardTitle>

          <CardDescription className="text-sm leading-6">
            Sign in to manage your expenses and stay connected.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
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
                className="h-11 rounded-lg pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>

              <Link
                href="/auth/password-reset"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-11 rounded-lg pr-11"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
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

          {/* Login */}
          <Button
            type="submit"
            className="h-11 w-full rounded-lg text-sm font-medium shadow-sm"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="w-full border-t border-border" />

            <span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            type="button"
            onClick={onGoogleLogin}
            disabled={loading}
            className="h-11 w-full rounded-lg text-sm font-medium"
          >
            <svg
              className="mr-2 h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.41Z"
              />
              <path
                fill="currentColor"
                d="M12 21.73c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.73 9.73 0 0 0 12 21.73Z"
              />
              <path
                fill="currentColor"
                d="M6.54 13.83A5.85 5.85 0 0 1 6.24 12c0-.64.11-1.26.3-1.83V7.65H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.35l3.24-2.52Z"
              />
              <path
                fill="currentColor"
                d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.27 12 2.27a9.73 9.73 0 0 0-8.7 5.38l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Create an account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}