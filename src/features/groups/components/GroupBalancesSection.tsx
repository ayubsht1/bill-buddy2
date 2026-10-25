"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupBalance, SuggestedSettlement } from "@/lib/api/billbuddy";

interface GroupBalancesSectionProps {
  balances: GroupBalance[];
  suggested: SuggestedSettlement[];
  onManageSettlementsClick?: () => void;
}

export function GroupBalancesSection({
  balances,
  suggested,
  onManageSettlementsClick,
}: GroupBalancesSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div>
          <CardTitle className="text-base">Balances</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Positive balances are owed to the member.
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {balances.map((balance) => (
            <div
              key={balance.id}
              className="flex items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium">@{balance.username}</p>
                <p className="text-xs text-muted-foreground">
                  {balance.email}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  balance.net_balance > 0
                    ? "text-primary"
                    : balance.net_balance < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {balance.net_balance < 0
                  ? "owes "
                  : balance.net_balance > 0
                  ? "is owed "
                  : "settled"}
                Rs. {Math.abs(balance.net_balance).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        {suggested.length > 0 && (
          <div className="space-y-2 border-t p-5">
            <p className="text-sm font-medium">Suggested settlements</p>
            {suggested.map((item, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                @{item.debtor.username} pays @{item.creditor.username}{" "}
                <span className="font-medium text-foreground">
                  Rs. {item.amount.toLocaleString()}
                </span>
              </p>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-2">
              <a href="/settlements">Manage settlements</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
