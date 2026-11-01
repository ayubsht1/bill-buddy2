"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppPreferences } from "@/providers/preferences-provider"
import type { MessageKey } from "@/i18n/messages"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { t } = useAppPreferences()
  const labelKeys: Record<string, MessageKey> = {
    Platform: "platform",
    Dashboard: "dashboard",
    "Money tracker": "moneyTracker",
    Groups: "groups",
    Friends: "friends",
    "All Friends": "allFriends",
    "Friend Requests": "friendRequests",
    Messages: "messages",
    Analytics: "analytics",
    Settlements: "settlements",
    Settings: "settings",
  }
  const label = (title: string) => {
    const key = labelKeys[title]
    return key ? t(key) : title
  }

  const isRouteActive = (url: string) =>
    pathname === url || pathname.startsWith(`${url}/`)

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label("Platform")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0
          const isItemActive = isRouteActive(item.url)
          const isSubItemActive = item.items?.some((subItem) =>
            isRouteActive(subItem.url),
          )
          const isActive = isItemActive || Boolean(isSubItemActive)

          // Alternative: If there are no sub-items, render a flat, standard button link
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={label(item.title)}
                  isActive={isActive}
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{label(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Otherwise, render the expandable Collapsible menu structure
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={label(item.title)} isActive={isActive}>
                    {item.icon && <item.icon />}
                    <span>{label(item.title)}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isRouteActive(subItem.url)}
                        >
                          <Link href={subItem.url}>
                            <span>{label(subItem.title)}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}