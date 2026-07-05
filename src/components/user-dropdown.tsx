"use client";

import { useSession } from "next-auth/react";
import { useSignOut } from "@/hooks/use-signout";
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
      <DropdownMenuTrigger asChild>
        <button
          className="
            group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
            transition-all duration-200 text-muted-foreground hover:text-primary
            active:scale-95 outline-none select-none
            data-[state=open]:bg-primary/10 data-[state=open]:text-primary data-[state=open]:font-semibold
          "
        >
          <Avatar
            className="
              h-6 w-6 transition-all duration-200
              group-data-[state=open]:ring-2
              group-data-[state=open]:ring-primary/40
            "
          >
            {image ? (
              <AvatarImage src={image} alt={displayName} />
            ) : (
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>

          <span className="hidden md:inline">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-56 bg-card text-foreground border border-muted p-2 rounded-lg shadow-md backdrop-blur-md"
        >
          <DropdownMenuLabel className="px-2 py-2.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {image ? (
                  <AvatarImage src={image} alt={displayName} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col justify-center min-w-0">
                <div className="font-semibold text-sm truncate text-foreground">{displayName}</div>
                {email && (
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-muted my-1" />

          <DropdownMenuItem asChild>
            <Link 
              href="/settings"
              className="
                flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer
                text-muted-foreground transition-colors duration-150
                focus:bg-primary/10 focus:text-primary focus:font-medium outline-none
              "
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem 
            onClick={handleSignOut}
            className="
              flex items-center gap-2 px-2 py-2 text-sm rounded-md cursor-pointer
              text-muted-foreground transition-colors duration-150
              focus:bg-destructive/10 focus:text-destructive focus:font-medium outline-none
            "
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}