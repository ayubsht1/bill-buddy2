"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GroupActivitySectionProps {
  activity: any[];
  activityError: string | null;
}

export function GroupActivitySection({
  activity,
  activityError,
}: GroupActivitySectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-base">Recent activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Updates automatically every 10 seconds.
        </p>
      </CardHeader>
      <CardContent className="max-h-[420px] divide-y overflow-y-auto p-0">
        {activityError && (
          <p role="status" className="p-4 text-xs text-destructive">
            {activityError}
          </p>
        )}
        {activity.length ? (
          activity
            .slice(-30)
            .reverse()
            .map((item, index) => (
              <div
                key={item.id ?? `${item.sender_username}-${index}`}
                className="px-5 py-4"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {item.is_system
                    ? "Group activity"
                    : `@${item.sender_username}`}
                </p>
                <p className="mt-1 text-sm">{item.message}</p>
                {item.timestamp && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.timestamp} 
                  </p>
                )}
              </div>
            ))
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No group activity yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
