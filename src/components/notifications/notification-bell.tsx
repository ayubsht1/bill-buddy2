"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  apiGet,
  apiPatch,
  apiPost,
  getApiErrorMessage,
  type NotificationPage,
} from "@/lib/api/billbuddy";

export function NotificationBell() {
  const router = useRouter();
  const [page, setPage] = useState<NotificationPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPage(await apiGet<NotificationPage>("/notifications/?page_size=5"));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const markRead = async (id: number) => {
    try {
      await apiPatch(`/notifications/${id}/read/`);
      await loadNotifications();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const markAllRead = async () => {
    try {
      await apiPost("/notifications/read-all/");
      await loadNotifications();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && void loadNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9"
          aria-label={`Notifications${page?.unread_count ? `, ${page.unread_count} unread` : ""}`}
        >
          <Bell className="size-4" />
          {Boolean(page?.unread_count) && (
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 text-destructive-foreground">
              {page!.unread_count > 99 ? "99+" : page!.unread_count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            disabled={!page?.unread_count}
            onClick={() => void markAllRead()}
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </Button>
        </div>
        {error ? (
          <p className="p-4 text-sm text-destructive">{error}</p>
        ) : loading && !page ? (
          <p className="p-4 text-sm text-muted-foreground">Loading notifications…</p>
        ) : page?.results.length ? (
          <div className="max-h-80 overflow-y-auto">
            {page.results.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="items-start gap-2 rounded-none px-3 py-3"
                onSelect={() => {
                  if (!notification.is_read) void markRead(notification.id);
                  if (notification.url) router.push(notification.url);
                }}
              >
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.is_read ? "bg-transparent" : "bg-primary"}`} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{notification.title}</span>
                  <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">You’re all caught up.</p>
        )}
        <div className="border-t p-2 text-center">
          <Button variant="link" size="sm" onClick={() => router.push("/notifications")}>
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
