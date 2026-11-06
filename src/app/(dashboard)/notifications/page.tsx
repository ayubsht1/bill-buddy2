"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, CalendarClock, Check, ChevronLeft, ChevronRight, Clock3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  getApiErrorMessage,
  type AppNotification,
  type Group,
  type GroupBalances,
  type GroupEvent,
  type GroupExpense,
  type NotificationPage as NotificationPageData,
  type ReminderRecord,
} from "@/lib/api/billbuddy";
import { formatDateTimeForTimezone, parseDateTimeForTimezone } from "@/lib/datetime";
import { useAppPreferences } from "@/providers/preferences-provider";

type ReminderTarget = { id: string; label: string };
type ReminderType = ReminderRecord["target_type"];

export default function NotificationsPage() {
  const { preferences } = useAppPreferences();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationPageData | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [targetType, setTargetType] = useState<ReminderType>("expense");
  const [targets, setTargets] = useState<ReminderTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [loadingTargets, setLoadingTargets] = useState(false);

  const loadNotifications = useCallback(async (requestedPage = 1) => {
    setError(null);
    try {
      const result = await apiGet<NotificationPageData>(`/notifications/?page=${requestedPage}&page_size=20`);
      setNotifications(result);
      setPage(requestedPage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }, []);

  const loadReminders = useCallback(async () => {
    setReminderError(null);
    try {
      setReminders(await apiGet<ReminderRecord[]>("/notifications/reminders/"));
    } catch (requestError) {
      setReminderError(getApiErrorMessage(requestError));
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      apiGet<NotificationPageData>("/notifications/?page=1&page_size=20"),
      apiGet<Group[]>("/groups/"),
      apiGet<ReminderRecord[]>("/notifications/reminders/"),
    ]).then(([notificationData, groupData, reminderData]) => {
      if (!active) return;
      setNotifications(notificationData);
      setGroups(groupData);
      setReminders(reminderData);
      setSelectedGroup(groupData[0]?.id ?? "");
    }).catch((requestError: unknown) => {
      if (active) setError(getApiErrorMessage(requestError));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setTargets([]);
      setSelectedTarget("");
      return;
    }
    let active = true;
    setLoadingTargets(true);
    const loadTargets = async () => {
      if (targetType === "expense") {
        const expenses = await apiGet<GroupExpense[]>(`/expenses/group/${selectedGroup}/`);
        return expenses.map((item) => ({ id: item.id, label: item.description }));
      }
      if (targetType === "event") {
        const events = await apiGet<GroupEvent[]>(`/groups/${selectedGroup}/events/`);
        return events.map((item) => ({ id: item.id, label: item.title }));
      }
      const [group, balances] = await Promise.all([
        apiGet<Group>(`/groups/${selectedGroup}/`),
        apiGet<GroupBalances>(`/groups/${selectedGroup}/balances/`),
      ]);
      return group.members
        .filter((member) => (balances.balances.find((balance) => balance.id === member.user.id)?.net_balance ?? 0) < 0)
        .map((member) => ({ id: member.user.public_id, label: `@${member.user.username}` }));
    };
    loadTargets().then((items) => {
      if (!active) return;
      setTargets(items);
      if (!editingReminder) setSelectedTarget(items[0]?.id ?? "");
    }).catch((requestError: unknown) => {
      if (active) setReminderError(getApiErrorMessage(requestError));
    }).finally(() => {
      if (active) setLoadingTargets(false);
    });
    return () => { active = false; };
  }, [selectedGroup, targetType, editingReminder]);

  const markRead = async (item: AppNotification) => {
    try {
      if (!item.is_read) await apiPatch(`/notifications/${item.id}/read/`);
      if (item.url) router.push(item.url);
      await loadNotifications(page);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const markAllRead = async () => {
    try {
      await apiPost("/notifications/read-all/");
      await loadNotifications(page);
      toast.success("Notifications marked as read.");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  const saveReminder = async () => {
    const parsedDate = parseDateTimeForTimezone(scheduledAt, preferences.timezone);
    if (!selectedGroup || !selectedTarget || !parsedDate) {
      setReminderError("Choose a group, reminder target, and valid date and time.");
      return;
    }
    if (new Date(parsedDate) <= new Date()) {
      setReminderError("Choose a future date and time.");
      return;
    }
    setSavingReminder(true);
    setReminderError(null);
    try {
      if (editingReminder) {
        await apiPatch(`/notifications/reminders/${editingReminder}/`, { scheduled_at: parsedDate });
        toast.success("Reminder updated.");
      } else {
        await apiPost("/notifications/reminders/", {
          group_id: selectedGroup,
          target_type: targetType,
          scheduled_at: parsedDate,
          ...(targetType === "expense" ? { expense_id: selectedTarget } : {}),
          ...(targetType === "event" ? { event_id: selectedTarget } : {}),
          ...(targetType === "settlement" ? { target_user_id: selectedTarget } : {}),
        });
        toast.success("Reminder scheduled.");
      }
      setEditingReminder(null);
      setScheduledAt("");
      await loadReminders();
    } catch (requestError) {
      setReminderError(getApiErrorMessage(requestError));
    } finally {
      setSavingReminder(false);
    }
  };

  const startEditing = (reminder: ReminderRecord) => {
    setEditingReminder(reminder.id);
    setTargetType(reminder.target_type);
    setSelectedGroup(reminder.group);
    setScheduledAt(formatDateTimeForTimezone(reminder.scheduled_at, preferences.timezone));
    setSelectedTarget(reminder.expense ?? reminder.event ?? reminder.target_user ?? "");
    setReminderError(null);
  };

  const cancelReminder = async (reminderId: string) => {
    try {
      await apiDelete(`/notifications/reminders/${reminderId}/`);
      setReminders((current) => current.map((item) => item.id === reminderId ? { ...item, status: "cancelled" } : item));
      if (editingReminder === reminderId) setEditingReminder(null);
      toast.success("Reminder cancelled.");
    } catch (requestError) {
      setReminderError(getApiErrorMessage(requestError));
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your activity</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stay up to date and manage reminders for your groups.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div><CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4" /> Activity</CardTitle><CardDescription>{notifications?.unread_count ?? 0} unread</CardDescription></div>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={!notifications?.unread_count} onClick={() => void markAllRead()}><Check className="size-4" /> Mark all read</Button>
        </CardHeader>
        <CardContent>
          {loading && !notifications ? <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-lg bg-muted/50" />)}</div> : error ? (
            <div className="space-y-3"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => void loadNotifications(page)}>Retry</Button></div>
          ) : notifications?.results.length ? (
            <>
              <div className="divide-y">
                {notifications.results.map((item) => <button key={item.id} type="button" onClick={() => void markRead(item)} className="flex w-full items-start gap-3 py-4 text-left hover:bg-muted/30">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.is_read ? "bg-transparent" : "bg-primary"}`} />
                  <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.title}</span><span className="mt-1 block text-sm text-muted-foreground">{item.message}</span><span className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: preferences.timezone }).format(new Date(item.created_at))}</span></span>
                </button>)}
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(notifications.count / 20))}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!notifications.previous} onClick={() => void loadNotifications(page - 1)}><ChevronLeft className="size-4" /> Previous</Button>
                  <Button variant="outline" size="sm" disabled={!notifications.next} onClick={() => void loadNotifications(page + 1)}>Next <ChevronRight className="size-4" /></Button>
                </div>
              </div>
            </>
          ) : <div className="rounded-lg border border-dashed p-10 text-center"><Bell className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 text-sm font-medium">You’re all caught up</p><p className="mt-1 text-sm text-muted-foreground">New group and payment activity will appear here.</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="size-4" /> Scheduled reminders</CardTitle><CardDescription>Choose a group event, expense, or member with a pending settlement.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {groups.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="reminder-group">Group</Label><select id="reminder-group" value={selectedGroup} onChange={(event) => { setSelectedGroup(event.target.value); setEditingReminder(null); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="reminder-type">Reminder for</Label><select id="reminder-type" value={targetType} onChange={(event) => { setTargetType(event.target.value as ReminderType); setEditingReminder(null); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="expense">Expense</option><option value="event">Group event</option><option value="settlement">Pending settlement</option></select></div>
              <div className="space-y-2"><Label htmlFor="reminder-target">{targetType === "settlement" ? "Member with an amount due" : targetType === "event" ? "Event" : "Expense"}</Label><select id="reminder-target" value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)} disabled={loadingTargets || !targets.length} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">{loadingTargets ? "Loading…" : targets.length ? "Select an item" : "No available items"}</option>{targets.map((target) => <option key={target.id} value={target.id}>{target.label}</option>)}</select></div>
              <div className="space-y-2"><Label htmlFor="reminder-time">Date and time ({preferences.timezone})</Label><div className="relative"><Clock3 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="reminder-time" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="pl-9" /></div></div>
            </div>
          ) : <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Join or create a group to schedule reminders.</p>}
          {reminderError && <p className="text-sm text-destructive">{reminderError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void saveReminder()} disabled={savingReminder || !groups.length || loadingTargets}>{savingReminder ? "Saving…" : editingReminder ? "Save reminder" : "Schedule reminder"}</Button>
            {editingReminder && <Button variant="outline" onClick={() => { setEditingReminder(null); setScheduledAt(""); setReminderError(null); }}>Cancel edit</Button>}
          </div>
          {reminders.length > 0 && <div className="divide-y border-t">
            {reminders.map((reminder) => <div key={reminder.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{groups.find((group) => group.id === reminder.group)?.name ?? "Group"} · {reminder.target_type === "event" ? "Event" : reminder.target_type === "settlement" ? "Settlement" : "Expense"}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone: preferences.timezone }).format(new Date(reminder.scheduled_at))} · {reminder.status}</p></div>
              {reminder.status === "pending" && <><Button size="sm" variant="outline" onClick={() => startEditing(reminder)}>Edit</Button><Button size="icon" variant="ghost" aria-label="Cancel reminder" onClick={() => void cancelReminder(reminder.id)}><Trash2 className="size-4" /></Button></>}
            </div>)}
          </div>}
          {reminderError && reminders.length > 0 && <Button variant="outline" size="sm" onClick={() => void loadReminders()}>Reload reminders</Button>}
        </CardContent>
      </Card>
    </div>
  );
}
