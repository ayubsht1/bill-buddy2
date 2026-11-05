import type { Group } from "@/lib/api/billbuddy";

export type Conversation = {
  id: string;
  kind: "group" | "direct";
  rawId: number | string;
  internalId?: number;
  title: string;
  avatarUrl: string | null;
  members: Group["members"];
};

export const fromGroup = (g: Group): Conversation => ({
  id: `group-${g.id}`,
  kind: "group",
  rawId: g.id,
  title: g.name,
  avatarUrl: g.group_photo,
  members: g.members,
});

export const parseConversationId = (id: string) => {
  const separator = id.indexOf("-");
  const kind = id.slice(0, separator);
  const raw = id.slice(separator + 1);
  if (kind === "group") return { kind: "group" as const, rawId: raw };
  return { kind: "dm" as const, rawId: raw };
};