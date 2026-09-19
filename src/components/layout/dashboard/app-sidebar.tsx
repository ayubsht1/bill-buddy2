"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Receipt,
  Settings,
  Wallet,
  PanelLeft,
  Users,
  UserRound,
  MessageCircle,
  BarChart3,
  HandCoins,
} from "lucide-react"

import { NavMain } from "@/components/layout/dashboard/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
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
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Receipt,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: Users,
      // items: [
      //   {
      //     title: "All Groups",
      //     url: "/groups",
      //   },
      //   {
      //     title: "Create Group",
      //     url: "/groups/new",
      //   },
      // ],
    },
    {
      title: "Friends",
      url: "/friends",
      icon: UserRound,
      items: [
        {
          title: "All Friends",
          url: "/friends",
        },
        {
          title: "Friend Requests",
          url: "/friends/requests",
        },
      ],
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageCircle,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settlements",
      url: "/settlements",
      icon: HandCoins,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar()

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip="Toggle Sidebar"
              className="cursor-pointer"
            >
              <PanelLeft className="size-4" />
              <span>Toggle Sidebar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}