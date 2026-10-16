
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function createGroupChatSocket(
  groupId: number,
  accessToken: string,
): WebSocket {
  const url = new URL(`/ws/chat/${groupId}/`, WS_BASE_URL);
  url.searchParams.set("token", accessToken);

  return new WebSocket(url.toString());
}

export function createPersonalChatSocket(
  accessToken: string,
): WebSocket {
  const url = new URL("/ws/personal-chat/", WS_BASE_URL);
  url.searchParams.set("token", accessToken);

  return new WebSocket(url.toString());
}
