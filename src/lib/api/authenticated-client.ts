"use client";

import axios, { AxiosInstance } from "axios";
import { getSession } from "next-auth/react";


export const getAuthenticatedApi = async (): Promise<AxiosInstance> => {
  const session = await getSession();

  const authApi = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
    headers: {
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
  });

  return authApi;
};
