"use client"

import {
  Bell,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useSignOut } from "@/hooks/use-signout"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NavUserProps {
  user?: {
    name: string
    email: string
    avatar: string | null
  }
}

export function NavUser({ user: propUser }: NavUserProps) {
  const { data: session } = useSession()
  const handleSignOut = useSignOut()

  // Fallback to session data, props, or defaults
  const user = {
    name: session?.user?.name || propUser?.name || "User Name",
    email: session?.user?.email || propUser?.email || "user@billbuddy.com",
    avatar: session?.user?.image || propUser?.avatar || "",
  }

  // Get initials for avatar fallback (e.g., "Ayub Shrestha" -> "AS")
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 flex items-center gap-2 px-2 rounded-lg hover:bg-accent focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8 rounded-lg border">
            <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="truncate text-xs font-semibold">{user.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-xl"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-[11px] text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <Link href="/settings" className="flex items-center w-full">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Profile / Settings</span>
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem className="cursor-pointer gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span>Notifications</span>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}