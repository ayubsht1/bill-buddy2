"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Group } from "@/lib/api/billbuddy";
import { formatApiDate } from "@/lib/api/billbuddy";

interface GroupHeaderProps {
  group: Group;
}

export function GroupHeader({ group }: GroupHeaderProps) {
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2">
        <Link href="/groups">
          <ArrowLeft className="size-4" /> Back to Groups
        </Link>
      </Button>
      <Card>
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {group.name}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {group.user_role ?? "member"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {group.description || "No description."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Created {formatApiDate(group.created_at)} · Join code{" "}
              {group.join_code}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/groups/${group.id}/events`}>
                <CalendarDays className="size-4" /> Planned events
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/messages?group=${group.id}`}>
                <MessageCircle className="size-4" /> Group chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
