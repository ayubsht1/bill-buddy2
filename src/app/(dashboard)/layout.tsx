import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { DynamicBreadcrumbs } from "@/components/layout/dashboard/dynamic-breadcrumbs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/layout/dashboard/mode-toggle";
import { NavUser } from "@/components/layout/dashboard/nav-user";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="relative min-h-svh overflow-y-auto bg-muted/10">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center justify-between gap-3 px-4 sm:px-6">
            {/* Left section: Sidebar trigger & breadcrumbs */}
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-2 h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground md:hidden" />
              <DynamicBreadcrumbs />
            </div>

            {/* Right section: Notifications, Theme toggle, and User Profile */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
              {/* Notification Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {/* Optional notification badge dot */}
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
              </Button>

              <ModeToggle />

              {/* User Profile Component moved here */}
              <div className="ml-1 border-l pl-2 sm:pl-3">
                <NavUser />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-6 p-4 pt-2 sm:p-6 sm:pt-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}