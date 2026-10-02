"use client";

import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { apiPost, getApiErrorMessage } from "@/lib/api/billbuddy";

export function useSignOut() {
  const { data: session } = useSession();

  return async () => {
    try {
      if (session?.refreshToken) {
        await apiPost("/logout/", { refresh: session.refreshToken });
      }
    } catch (error) {
      toast.error(`Signed out locally, but the server logout request failed: ${getApiErrorMessage(error)}`);
    } finally {
      await signOut({ callbackUrl: "/auth/login" });
    }
  };
}
