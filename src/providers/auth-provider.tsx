"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const profileRefreshStarted = useRef(false);

const hasSignedOut = useRef(false);

useEffect(() => {
  if (
    session?.error === "RefreshAccessTokenError" &&
    !hasSignedOut.current
  ) {
    hasSignedOut.current = true;

    signOut({
      redirect: true,
      redirectTo: "/auth/login",
    });
  }
}, [session?.error]);

  useEffect(() => {
    if (status === "unauthenticated") {
      profileRefreshStarted.current = false;
      return;
    }
    if (status !== "authenticated" || profileRefreshStarted.current) return;

    profileRefreshStarted.current = true;
    void update();
  }, [status, update]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}