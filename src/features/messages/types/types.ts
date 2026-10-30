import type { Group } from "@/lib/api/billbuddy";

export type Conversation = {
  id: string; // "group-3" or "dm-7", so the two kinds never collide
  kind: "group" | "direct";
  rawId: number; // group id, or the friend's user id for DMs
  title: string;
  avatarUrl: string | null;
  members: Group["members"];
};

export const fromGroup = (g: Group): Conversation => ({
  id: `group-${g.id}`,
  kind: "group",
  rawId: g.id,
  title: g.name,
  avatarUrl: null,
  members: g.members,
});

export const parseConversationId = (id: string) => {
  const [kind, raw] = id.split("-");
  return { kind: kind as "group" | "dm", rawId: Number(raw) };
};