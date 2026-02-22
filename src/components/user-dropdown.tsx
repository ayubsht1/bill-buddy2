"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";

export function UserDropdown() {
  const { data: session } = useSession();
  if (!session?.user) return null;

  const {
    username,
    name,
    email,
    image,
  } = session.user as {
    username?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };

  // ✅ Normalize display values
  const displayName =
    username || name || email || "User";

  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="
            group flex items-center gap-2 rounded-full px-1 py-1
            transition
            data-[state=open]:bg-muted
          "
        >
          {/* Avatar */}
          <Avatar
            className="
              h-8 w-8 transition
              group-data-[state=open]:ring-2
              group-data-[state=open]:ring-primary/40
            "
          >
            {image ? (
              <AvatarImage src={image} alt={displayName} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>

          {/* Name */}
          <span
            className=" text-xs
              hidden md:inline transition-all
              group-data-[state=open]:text-xs
              group-data-[state=open]:text-muted-foreground
            "
          >
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {image ? (
                  <AvatarImage src={image} alt={displayName} />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col justify-center">
                <div className="font-medium">{displayName}</div>
                {email && (
                  <div className="text-sm text-muted-foreground">
                    {email}
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings"><Settings />Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
