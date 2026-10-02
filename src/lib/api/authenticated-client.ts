"use client";

import axios, { type AxiosInstance } from "axios";
import { getSession, signOut } from "next-auth/react";


export const getAuthenticatedApi = async (): Promise<AxiosInstance> => {
  const session = await getSession();
  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  const baseURL = `${configuredUrl.replace(/\/+$/, "").replace(/\/api$/, "")}/api`;

  const authApi = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
  });

  authApi.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        return Promise.reject(error);
      }

      const request = error.config;
      if (!request || request.headers?.["x-session-retry"]) {
        await signOut({ callbackUrl: "/auth/login" });
        return Promise.reject(error);
      }

      request.headers.set("x-session-retry", "true");
      const refreshedSession = await getSession();
      if (!refreshedSession?.accessToken || refreshedSession.error) {
        await signOut({ callbackUrl: "/auth/login" });
        return Promise.reject(error);
      }
      request.headers.set("Authorization", `Bearer ${refreshedSession.accessToken}`);
      return authApi.request(request);
    },
  );

  return authApi;
};
