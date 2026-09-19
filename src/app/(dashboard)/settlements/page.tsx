"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  HandCoins,
  MoreHorizontal,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type SettlementStatus = "Pending" | "Completed";

type Settlement = {
  id: number;
  person: string;
  initials: string;
  direction: "owe" | "owed";
  amount: number;
  group: string;
  date: string;
  status: SettlementStatus;
};

const settlements: Settlement[] = [
  {
    id: 1,
    person: "Suman Thapa",
    initials: "ST",
    direction: "owed",
    amount: 1250,
    group: "Pokhara Trip",
    date: "Sep 18, 2026",
    status: "Pending",
  },
  {
    id: 2,
    person: "Ram Sharma",
    initials: "RS",
    direction: "owe",
    amount: 500,
    group: "Apartment",
    date: "Sep 17, 2026",
    status: "Pending",
  },
  {
    id: 3,
    person: "Anisha KC",
    initials: "AK",
    direction: "owed",
    amount: 850,
    group: "College Friends",
    date: "Sep 15, 2026",
    status: "Pending",
  },
  {
    id: 4,
    person: "Prakash Gurung",
    initials: "PG",
    direction: "owe",
    amount: 700,
    group: "Pokhara Trip",
    date: "Sep 12, 2026",
    status: "Pending",
  },
  {
    id: 5,
    person: "Nisha Rai",
    initials: "NR",
    direction: "owed",
    amount: 600,
    group: "Gaming Night",
    date: "Sep 10, 2026",
    status: "Completed",
  },
  {
    id: 6,
    person: "Bikash Lama",
    initials: "BL",
    direction: "owed",
    amount: 450,
    group: "Apartment",
    date: "Sep 08, 2026",
    status: "Completed",
  },
];

export default function SettlementsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Pending" | "Completed"
  >("All");

  const [settleDialogOpen, setSettleDialogOpen] =
    useState(false);

  const [selectedSettlement, setSelectedSettlement] =
    useState<Settlement | null>(null);

  const filteredSettlements = useMemo(() => {
    return settlements.filter((settlement) => {
      const matchesSearch =
        settlement.person
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        settlement.group
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        settlement.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const openSettleDialog = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setSettleDialogOpen(true);
  };

  const totalOwedToYou = settlements
    .filter(
      (settlement) =>
        settlement.direction === "owed" &&
        settlement.status === "Pending"
    )
    .reduce(
      (total, settlement) => total + settlement.amount,
      0
    );

  const totalYouOwe = settlements
    .filter(
      (settlement) =>
        settlement.direction === "owe" &&
        settlement.status === "Pending"
    )
    .reduce(
      (total, settlement) => total + settlement.amount,
      0
    );

  const pendingCount = settlements.filter(
    (settlement) => settlement.status === "Pending"
  ).length;

  const completedCount = settlements.filter(
    (settlement) => settlement.status === "Completed"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Settlements
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of money you owe and money owed to you.
          </p>
        </div>

        <Button
          className="gap-2"
          onClick={() => setSettleDialogOpen(true)}
        >
          <HandCoins className="size-4" />
          Settle Up
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          icon={ArrowDownLeft}
          label="Owed to you"
          amount={totalOwedToYou}
          description="Others need to pay you"
          positive
        />

        <BalanceCard
          icon={ArrowUpRight}
          label="You owe"
          amount={totalYouOwe}
          description="You need to pay others"
        />

        <BalanceCard
          icon={Clock3}
          label="Pending settlements"
          amount={pendingCount}
          description={`${completedCount} completed settlements`}
          count
        />
      </div>

      {/* Net Position */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet className="size-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Your settlement balance
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Based on your current pending settlements
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xl font-semibold">
                + Rs.{" "}
                {(totalOwedToYou - totalYouOwe).toLocaleString()}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Net amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search people or groups..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["All", "Pending", "Completed"] as const).map(
                (item) => (
                  <Button
                    key={item}
                    variant={
                      filter === item
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settlement List */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div>
            <CardTitle className="text-base">
              Settlement history
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Review pending and completed payments.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredSettlements.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {filteredSettlements.map((settlement) => (
                <SettlementRow
                  key={settlement.id}
                  settlement={settlement}
                  onSettle={() =>
                    openSettleDialog(settlement)
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How settlements work */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            How settlements work
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Step
              number="01"
              title="Track expenses"
              description="Record shared expenses in your groups."
            />

            <Step
              number="02"
              title="See balances"
              description="Bill Buddy calculates who owes whom."
            />

            <Step
              number="03"
              title="Settle up"
              description="Record a payment when someone pays their balance."
            />
          </div>
        </CardContent>
      </Card>

      {/* Settle Dialog */}
      <SettleDialog
        open={settleDialogOpen}
        onOpenChange={setSettleDialogOpen}
        settlement={selectedSettlement}
      />
    </div>
  );
}

/* -------------------------------------------------------
   Balance Card
------------------------------------------------------- */

function BalanceCard({
  icon: Icon,
  label,
  amount,
  description,
  positive,
  count,
}: {
  icon: typeof ArrowDownLeft;
  label: string;
  amount: number;
  description: string;
  positive?: boolean;
  count?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4 text-muted-foreground" />
          </div>

          <CircleDollarSign className="size-4 text-muted-foreground/50" />
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          {label}
        </p>

        <p
          className={`mt-1 text-2xl font-semibold tracking-tight ${
            positive ? "text-primary" : ""
          }`}
        >
          {count
            ? amount
            : `Rs. ${amount.toLocaleString()}`}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
   Settlement Row
------------------------------------------------------- */

function SettlementRow({
  settlement,
  onSettle,
}: {
  settlement: Settlement;
  onSettle: () => void;
}) {
  const isOwedToYou =
    settlement.direction === "owed";

  return (
    <div className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center">
      {/* Person */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {settlement.initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {settlement.person}
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{settlement.group}</span>
            <span>·</span>
            <span>{settlement.date}</span>
          </div>
        </div>
      </div>

      {/* Direction */}
      <div className="flex items-center gap-2 sm:w-40">
        <div
          className={`flex size-7 items-center justify-center rounded-full ${
            isOwedToYou
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isOwedToYou ? (
            <ArrowDownLeft className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {isOwedToYou ? "Owes you" : "You owe"}
          </p>

          <p className="text-sm font-medium">
            Rs. {settlement.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="sm:w-28">
        <Badge
          variant={
            settlement.status === "Completed"
              ? "secondary"
              : "outline"
          }
          className="gap-1.5 font-normal"
        >
          {settlement.status === "Completed" ? (
            <Check className="size-3" />
          ) : (
            <Clock3 className="size-3" />
          )}

          {settlement.status}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:ml-auto">
        {settlement.status === "Pending" && (
          <Button
            size="sm"
            variant={
              isOwedToYou ? "outline" : "default"
            }
            onClick={onSettle}
          >
            {isOwedToYou ? "Remind" : "Settle"}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">
                More actions
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserRound className="mr-2 size-4" />
              View profile
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Wallet className="mr-2 size-4" />
              View group
            </DropdownMenuItem>

            {settlement.status === "Pending" && (
              <DropdownMenuItem>
                <HandCoins className="mr-2 size-4" />
                View details
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Settle Dialog
------------------------------------------------------- */

function SettleDialog({
  open,
  onOpenChange,
  settlement,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlement: Settlement | null;
}) {
  const [amount, setAmount] = useState("");

  const isPaying =
    settlement?.direction === "owe";

  const handleSubmit = () => {
    if (!amount.trim()) return;

    console.log({
      settlementId: settlement?.id,
      amount: Number(amount),
    });

    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {settlement
              ? isPaying
                ? "Settle payment"
                : "Send reminder"
              : "Settle up"}
          </DialogTitle>

          <DialogDescription>
            {settlement
              ? isPaying
                ? `Record your payment to ${settlement.person}.`
                : `Send ${settlement.person} a reminder about their pending balance.`
              : "Record a payment between you and another person."}
          </DialogDescription>
        </DialogHeader>

        {settlement && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-background text-xs font-medium">
                {settlement.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {settlement.person}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {settlement.group}
                </p>
              </div>

              <p className="text-sm font-semibold">
                Rs. {settlement.amount.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {settlement && isPaying && (
          <div className="space-y-2">
            <Label htmlFor="settlement-amount">
              Amount
            </Label>

            <Input
              id="settlement-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder={`e.g. ${settlement.amount}`}
            />

            <p className="text-xs text-muted-foreground">
              You can record a partial payment if you do not
              want to settle the full balance.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={
              settlement && !isPaying
                ? () => onOpenChange(false)
                : handleSubmit
            }
          >
            {settlement && !isPaying
              ? "Send Reminder"
              : "Mark as Paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------
   Empty State
------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Search className="size-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No settlements found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try changing your search or settlement filter.
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Steps
------------------------------------------------------- */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {number}
      </div>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
