"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  getApiErrorMessage,
  type Group,
  type GroupEvent,
} from "@/lib/api/billbuddy";

type BudgetDraft = { description: string; amount: string };
type EventDraft = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  budgetItems: BudgetDraft[];
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const toLocalInput = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const createDraft = (date: Date): EventDraft => {
  const start = new Date(date);
  start.setHours(18, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    title: "",
    description: "",
    location: "",
    startsAt: toLocalInput(start),
    endsAt: toLocalInput(end),
    budgetItems: [],
  };
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export default function GroupEventsPage() {
  const params = useParams<{ id: string }>();
  const groupId = Number(params.id);
  const { data: session } = useSession();
  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupEvent | null>(null);
  const [draft, setDraft] = useState<EventDraft>(() => createDraft(new Date()));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!Number.isInteger(groupId) || groupId <= 0) {
      setError("Invalid group.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const from = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const to = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    const range = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    try {
      const [groupDetails, monthEvents] = await Promise.all([
        apiGet<Group>(`/groups/${groupId}/`),
        apiGet<GroupEvent[]>(`/groups/${groupId}/events/?${range.toString()}`),
      ]);
      setGroup(groupDetails);
      setEvents(monthEvents);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [currentMonth, groupId]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, GroupEvent[]>();
    for (const event of events) {
      const key = dateKey(new Date(event.starts_at));
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    }
    return grouped;
  }, [events]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const offset = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: offset + dayCount }, (_, index) =>
      index < offset ? null : new Date(year, month, index - offset + 1),
    );
  }, [currentMonth]);

  const selectedEvents = eventsByDay.get(dateKey(selectedDate)) ?? [];
  const canManage = (event: GroupEvent) =>
    event.created_by === session?.user?.username
    || group?.user_role === "owner"
    || group?.user_role === "admin";

  const changeMonth = (amount: number) => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1);
    setCurrentMonth(next);
    setSelectedDate(next);
  };

  const openCreate = (date = selectedDate) => {
    setEditingEvent(null);
    setDraft(createDraft(date));
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (event: GroupEvent) => {
    setEditingEvent(event);
    setDraft({
      title: event.title,
      description: event.description,
      location: event.location,
      startsAt: toLocalInput(new Date(event.starts_at)),
      endsAt: toLocalInput(new Date(event.ends_at)),
      budgetItems: event.budget_items.map((item) => ({
        description: item.description,
        amount: String(item.amount),
      })),
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const saveEvent = async (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const startsAt = new Date(draft.startsAt);
    const endsAt = new Date(draft.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
      setFormError("The end time must be after the start time.");
      return;
    }

    const budgetItems: Array<{ description: string; amount: string }> = [];
    for (const item of draft.budgetItems) {
      const description = item.description.trim();
      const amount = item.amount.trim();
      if (!description && !amount) continue;
      if (!description || !amount || Number(amount) <= 0) {
        setFormError("Each planned cost needs a description and an amount greater than zero.");
        return;
      }
      budgetItems.push({ description, amount });
    }

    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        location: draft.location.trim(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        budget_items: budgetItems,
      };
      if (editingEvent) {
        await apiPatch<GroupEvent>(`/groups/${groupId}/events/${editingEvent.id}/`, payload);
      } else {
        await apiPost<GroupEvent>(`/groups/${groupId}/events/`, payload);
      }
      setDialogOpen(false);
      toast.success(editingEvent ? "Event updated." : "Event planned.");
      await loadEvents();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/groups/${groupId}/events/${deleteTarget.id}/`);
      setDeleteTarget(null);
      toast.success("Event deleted.");
      await loadEvents();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !group) {
    return <div className="mx-auto w-full max-w-7xl space-y-4"><Skeleton className="h-10 w-52" /><Skeleton className="h-96 w-full" /></div>;
  }
  if (error || !group) {
    return <div className="mx-auto w-full max-w-3xl space-y-4 py-12 text-center"><p className="text-sm text-destructive">{error ?? "Group could not be loaded."}</p><Button variant="outline" onClick={() => void loadEvents()}>Retry</Button></div>;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground hover:text-foreground">← {group.name}</Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Planned events</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan group time together and keep estimated costs separate from recorded expenses.</p>
        </div>
        <Button className="w-full gap-2 sm:w-auto" onClick={() => openCreate()}><Plus className="size-4" /> Plan event</Button>
      </div>

      {error && <Card className="border-destructive/40"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => void loadEvents()}>Retry</Button></CardContent></Card>}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeft className="size-4" /></Button>
              <CardTitle className="min-w-36 text-center text-base">{currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</CardTitle>
              <Button variant="outline" size="icon" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRight className="size-4" /></Button>
            </div>
            <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => {
              const today = new Date();
              setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDate(today);
            }}>Today</Button>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="grid grid-cols-7 text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) return <div key={`blank-${index}`} aria-hidden="true" />;
                const dayEvents = eventsByDay.get(dateKey(date)) ?? [];
                const selected = dateKey(date) === dateKey(selectedDate);
                const isToday = dateKey(date) === dateKey(new Date());
                return (
                  <button
                    key={dateKey(date)}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${date.toLocaleDateString()}${dayEvents.length ? `, ${dayEvents.length} events` : ""}`}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-14 min-w-0 rounded-lg border p-1.5 text-left transition-colors sm:min-h-24 sm:p-2 ${selected ? "border-primary bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/50"}`}
                  >
                    <span className={`flex size-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-primary text-primary-foreground" : "text-foreground"}`}>{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <>
                        <span className="mt-1 block text-center text-[10px] text-primary sm:hidden">{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</span>
                        <span className="mt-1 hidden space-y-1 sm:block">
                          {dayEvents.slice(0, 2).map((event) => <span key={event.id} className="block truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">{event.title}</span>)}
                          {dayEvents.length > 2 && <span className="block text-[10px] text-muted-foreground">+{dayEvents.length - 2} more</span>}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            {loading && <p className="mt-3 text-center text-xs text-muted-foreground">Loading events…</p>}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b">
            <div className="min-w-0"><CardTitle className="text-base">{selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{selectedEvents.length} planned event{selectedEvents.length === 1 ? "" : "s"}</p></div>
            <Button variant="outline" size="icon" aria-label="Plan event on selected day" onClick={() => openCreate(selectedDate)}><Plus className="size-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {selectedEvents.length ? selectedEvents.map((event) => (
              <article key={event.id} className="min-w-0 rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><h2 className="break-words text-sm font-semibold">{event.title}</h2><p className="mt-1 text-xs text-muted-foreground">Planned by {event.created_by ?? "a group member"}</p></div>
                  {canManage(event) && <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label={`Edit ${event.title}`} onClick={() => openEdit(event)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${event.title}`} className="text-destructive" onClick={() => setDeleteTarget(event)}><Trash2 className="size-4" /></Button></div>}
                </div>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Clock3 className="size-3.5 shrink-0" />{formatTime(event.starts_at)} – {formatTime(event.ends_at)}</p>
                  {event.location && <p className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0" /><span className="break-words">{event.location}</span></p>}
                  {event.description && <p className="break-words leading-relaxed">{event.description}</p>}
                </div>
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium">Estimated costs</p><p className="text-sm font-semibold">Rs. {Number(event.planned_budget).toLocaleString()}</p></div>
                  {event.budget_items.length ? <ul className="mt-2 space-y-1">{event.budget_items.map((item) => <li key={item.id} className="flex justify-between gap-3 text-xs text-muted-foreground"><span className="min-w-0 break-words">{item.description}</span><span className="shrink-0">Rs. {Number(item.amount).toLocaleString()}</span></li>)}</ul> : <p className="mt-1 text-xs text-muted-foreground">No estimates added.</p>}
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="size-3" /> Estimates only; add real expenses when they occur.</p>
                </div>
              </article>
            )) : <div className="py-10 text-center"><CalendarDays className="mx-auto size-8 text-muted-foreground/60" /><p className="mt-3 text-sm font-medium">Nothing planned</p><p className="mt-1 text-xs text-muted-foreground">Add an event for this day and estimate its costs.</p><Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => openCreate(selectedDate)}><Plus className="size-3.5" /> Plan event</Button></div>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{editingEvent ? "Edit planned event" : "Plan a group event"}</DialogTitle><DialogDescription>Set the time and optional estimated costs. Estimates won’t change group balances.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void saveEvent(event)}>
            <div className="space-y-2"><Label htmlFor="event-title">Event name</Label><Input id="event-title" required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="event-start">Starts</Label><Input id="event-start" type="datetime-local" required value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="event-end">Ends</Label><Input id="event-end" type="datetime-local" required value={draft.endsAt} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="event-location">Location <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="event-location" maxLength={255} value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="event-description">Details <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="event-description" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
            <div className="space-y-3 rounded-xl border p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium">Estimated costs</p><p className="text-xs text-muted-foreground">Planning only—not added to group expenses.</p></div><Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setDraft({ ...draft, budgetItems: [...draft.budgetItems, { description: "", amount: "" }] })}><Plus className="size-3.5" /> Add item</Button></div>
              {draft.budgetItems.map((item, index) => <div key={index} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]"><Input aria-label={`Cost ${index + 1} description`} placeholder="e.g. Transport" maxLength={120} value={item.description} onChange={(event) => setDraft({ ...draft, budgetItems: draft.budgetItems.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry) })} /><Input aria-label={`Cost ${index + 1} amount`} type="number" min="0.01" step="0.01" placeholder="Amount" value={item.amount} onChange={(event) => setDraft({ ...draft, budgetItems: draft.budgetItems.map((entry, itemIndex) => itemIndex === index ? { ...entry, amount: event.target.value } : entry) })} /><Button type="button" variant="ghost" size="icon" aria-label={`Remove cost ${index + 1}`} className="justify-self-end text-destructive sm:justify-self-auto" onClick={() => setDraft({ ...draft, budgetItems: draft.budgetItems.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="size-4" /></Button></div>)}
            </div>
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <DialogFooter className="flex-col-reverse sm:flex-row"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : editingEvent ? "Save changes" : "Plan event"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent><DialogHeader><DialogTitle>Delete this event?</DialogTitle><DialogDescription>This removes “{deleteTarget?.title}” and its estimates. Recorded expenses are not affected.</DialogDescription></DialogHeader><DialogFooter className="flex-col-reverse sm:flex-row"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Keep event</Button><Button variant="destructive" disabled={deleting} onClick={() => void deleteEvent()}>{deleting ? "Deleting…" : "Delete event"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
