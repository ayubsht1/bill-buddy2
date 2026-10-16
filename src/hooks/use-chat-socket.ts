"use client";

import { useEffect, useRef, useState } from "react";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export interface SocketEvent<T = unknown> {
  event_type: string;
  payload: T;
}

interface Options {
  path: string | null; // e.g. "/ws/chat/5/", null = don't connect
  token: string | null | undefined;
  onEvent: (event: SocketEvent) => void;
  onOpen?: () => void;
}

export function useChatSocket({ path, token, onEvent, onOpen }: Options) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  const onOpenRef = useRef(onOpen);

  useEffect(() => {
    onEventRef.current = onEvent;
    onOpenRef.current = onOpen;
  });

  useEffect(() => {
    if (!path || !token) return;

    let ws: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout>;
    let retry = 0;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`${WS_BASE}${path}?token=${encodeURIComponent(token)}`);

      ws.onopen = () => {
        retry = 0;
        setConnected(true);
        onOpenRef.current?.();
      };

      ws.onmessage = (e) => {
        try {
          onEventRef.current(JSON.parse(e.data));
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onclose = (e) => {
        setConnected(false);
        if (closed || e.code === 4403) return;      // 4403 = not a group member, don't retry
        // 4401 = bad/expired token: retry slowly; a new token from the session also restarts the effect
        const delay = e.code === 4401 ? 30000 : Math.min(1000 * 2 ** retry++, 15000);
        timer = setTimeout(connect, delay);
    };
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      ws?.close();
      setConnected(false);
    };
  }, [path, token]);

  return { connected };
}