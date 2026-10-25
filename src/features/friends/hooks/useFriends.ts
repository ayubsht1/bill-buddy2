import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage, resolveProfilePictureUrl, initials, userDisplayName } from "@/lib/api/billbuddy";
import { friendApi } from "../services/friendApi";
import type { Friend } from "@/lib/api/billbuddy";

export interface FriendCardModel {
  id: number;
  name: string;
  username: string;
  profilePicture: string | undefined;
  initials: string;
  balance: number;
  status: Friend['status'];
}

export function useFriends() {
  const [friends, setFriends] = useState<FriendCardModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await friendApi.getFriends();
      setFriends(data.map((friend) => ({
        id: friend.id,
        name: userDisplayName(friend),
        username: friend.username,
        profilePicture: resolveProfilePictureUrl(friend.profile_picture),
        initials: initials(userDisplayName(friend)),
        balance: Math.abs(Number(friend.balance)),
        status: friend.status,
      })));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const sendPersonalMessage = async (userId: number, message: string) => {
    setSendingMessage(true);
    try {
      await friendApi.sendPersonalMessage(userId, message);
      toast.success("Message sent!");
      await loadFriends();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setSendingMessage(false);
    }
  };

  return {
    state: {
      friends,
      loading,
      error,
      sendingMessage,
    },
    actions: {
      loadFriends,
      sendPersonalMessage,
    },
  };
}
