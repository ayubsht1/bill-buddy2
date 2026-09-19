"use client";

import { useSession } from "next-auth/react";
import { useSignOut } from "@/hooks/use-signout";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";

export function UserDropdown() {
  const { data: session } = useSession();
  const handleSignOut = useSignOut();

  if (!session?.user) return null;

  const { username, name, email, image } = session.user as {
    username?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };

  const displayName = username || name || email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <button
          className="
            group flex items-center gap-2 rounded-xl
            px-2 py-1.5
            outline-none
            transition-all duration-200
            hover:bg-muted/70
            focus-visible:ring-2 focus-visible:ring-primary/30
            data-[state=open]:bg-muted
          "
        >
          <Avatar className="h-8 w-8 border border-border/60">
            {image ? (
              <AvatarImage
                src={image}
                alt={displayName}
              />
            ) : (
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="hidden min-w-0 flex-col items-start md:flex">
            <span className="max-w-[120px] truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
          </div>

          <ChevronDown
            className="
              hidden h-4 w-4 text-muted-foreground
              transition-transform duration-200
              group-data-[state=open]:rotate-180
              md:block
            "
          />
        </button>
      </DropdownMenuTrigger>

      {/* Menu */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-64 rounded-xl
          border border-border/60
          bg-card
          p-1.5
          shadow-xl shadow-black/10
        "
      >
        {/* Profile */}
        <DropdownMenuLabel className="p-0">
          <div className="flex items-center gap-3 rounded-lg px-3 py-3">
            <Avatar className="h-10 w-10 border border-border/60">
              {image ? (
                <AvatarImage
                  src={image}
                  alt={displayName}
                />
              ) : (
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>

              {email && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5" />

        {/* Settings */}
        <DropdownMenuItem
          asChild
          className="
            cursor-pointer rounded-lg
            px-3 py-2.5
            text-sm
            text-muted-foreground
            outline-none
            transition-colors
            focus:bg-primary/10
            focus:text-primary
          "
        >
          <Link href="/settings" className="flex w-full items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Settings className="h-4 w-4" />
            </span>

            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                Settings
              </span>
              <span className="text-xs text-muted-foreground">
                Manage your account
              </span>
            </div>
          </Link>
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="
            cursor-pointer rounded-lg
            px-3 py-2.5
            text-sm
            text-muted-foreground
            outline-none
            transition-colors
            focus:bg-destructive/10
            focus:text-destructive
          "
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <LogOut className="h-4 w-4" />
          </span>

          <div className="flex flex-col">
            <span className="font-medium">
              Sign out
            </span>
            <span className="text-xs text-muted-foreground">
              End your current session
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
