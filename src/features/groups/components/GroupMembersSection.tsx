"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, UserPlus } from "lucide-react";
import { userDisplayName } from "@/lib/api/billbuddy";

interface GroupMembersSectionProps {
  members: any[];
  currentUserId: number;
  canManage: boolean;
  isOwner: boolean;
  busyMemberId: number | null;
  onAddMember: (identifier: string) => void;
  onAddMemberLoading: boolean;
  onChangeRole: (userId: number, role: string) => void;
  onRemoveMember: (userId: number) => void;
  setRemoveTarget: (userId: number) => void;
}

export function GroupMembersSection({
  members,
  currentUserId,
  canManage,
  isOwner,
  busyMemberId,
  onAddMember,
  onAddMemberLoading,
  onChangeRole,
  onRemoveMember,
  setRemoveTarget,
}: GroupMembersSectionProps) {
  const [identifier, setIdentifier] = useState("");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Members</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Roles and access for this group.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh group"
            onClick={() => {}} // Handled by parent via reloadGroup if needed, or just a placeholder
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {members.map((membership) => {
            const member = membership.user;
            const name = userDisplayName(member);
            const isSelf = member.id === currentUserId;
            const isMemberOwner = membership.role === "owner";
            return (
              <div
                key={membership.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={member.profile_picture || undefined}
                    alt={name}
                  />
                  <AvatarFallback>
                    {name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {name}
                    {isSelf ? " (you)" : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{member.username} · {member.email}
                  </p>
                </div>
                {canManage && !isMemberOwner ? (
                  <div className="flex items-center gap-2">
                    {isOwner ? (
                      <Select
                        disabled={busyMemberId === member.id}
                        value={membership.role}
                        onValueChange={(role) => void onChangeRole(member.id, role)}
                      >
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {membership.role}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={busyMemberId === member.id}
                      onClick={() => setRemoveTarget(member.id)}
                    >
                      {isSelf ? "Leave" : "Remove"}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="capitalize">
                    {membership.role}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        {canManage && (
          <div className="space-y-2 border-t p-5">
            <Label htmlFor="group-member-identifier">
              Add a member by username or email
            </Label>
            <div className="flex gap-2">
              <Input
                id="group-member-identifier"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="username or email"
              />
              <Button
                disabled={!identifier.trim() || onAddMemberLoading}
                onClick={() => {
                  onAddMember(identifier);
                  setIdentifier("");
                }}
                className="shrink-0 gap-2"
              >
                <UserPlus className="size-4" />
                {onAddMemberLoading ? "Adding..." : "Add"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only group admins and the owner can add members.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
