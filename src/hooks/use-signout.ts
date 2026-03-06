"use client";

import { signOut, useSession } from "next-auth/react";

export function useSignOut() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify({ refresh: session?.refreshToken }),
    });

    signOut({ callbackUrl: "/" });
  };

  return handleSignOut;
}