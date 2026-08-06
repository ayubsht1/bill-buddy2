"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard,
  Users2,
  Receipt,
  History,
  TrendingUp,
  Settings,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "User Name",
    email: "user@billbuddy.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Expenses & Bills",
      url: "/expenses",
      icon: Receipt,
      items: [
        {
          title: "All Expenses",
          url: "/expenses",
        },
        {
          title: "Add a Bill",
          url: "/expenses/new",
        },
        {
          title: "Recurring Bills",
          url: "/expenses/recurring",
        },
      ],
    },
    {
      title: "Groups & Friends",
      url: "/groups",
      icon: Users2,
      items: [
        {
          title: "Active Groups",
          url: "/groups",
        },
        {
          title: "Friends List",
          url: "/friends",
        },
        {
          title: "Settlements",
          url: "/settlements",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: TrendingUp,
      items: [
        {
          title: "Spending Patterns",
          url: "/analytics/spending",
        },
        {
          title: "Monthly Summary",
          url: "/analytics/monthly",
        },
      ],
    },
    {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Payment Methods",
          url: "/settings/payments",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()
  const user = {
    name: session?.user?.name || "Guest User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="pointer-events-none data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wallet className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">BillBuddy</span>
                <span className="text-xs text-muted-foreground">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}