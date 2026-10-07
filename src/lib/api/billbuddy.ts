"use client";

import axios, { type AxiosRequestConfig, type Method } from "axios";
import { getAuthenticatedApi } from "@/lib/api/authenticated-client";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: unknown;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
}

export interface PersonalExpense {
  id: number;
  transaction_type: "INCOME" | "EXPENSE";
  description: string;
  amount: number | string;
  category: string;
  date: string;
  created_at?: string;
}

export interface GroupMember {
  id: number;
  role: "owner" | "admin" | "member";
  user: UserSummary;
  joined_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  creator: UserSummary;
  members: GroupMember[];
  memberships: GroupMember[];
  join_code: string;
  created_at: string;
  user_role: "owner" | "admin" | "member" | null;
}

export interface GroupExpenseShare {
  user_id: number;
  email: string;
  amount: number | string;
}

export interface GroupExpense {
  id: number;
  group: number;
  description: string;
  amount: number | string;
  paid_by: number;
  date: string;
  shares: GroupExpenseShare[];
}

export interface GroupBalance {
  id: number;
  username: string;
  email: string;
  net_balance: number;
}

export interface SuggestedSettlement {
  debtor: GroupBalance;
  creditor: GroupBalance;
  amount: number;
}

export interface GroupBalances {
  balances: GroupBalance[];
  suggested_settlements: SuggestedSettlement[];
}

export interface GroupMessage {
  id: number | null;
  sender_username: string;
  message: string;
  timestamp?: string;
  attachment_url?: string | null;
  attachment_name?: string;
  attachment_type?: string | null;
  is_system: boolean;
  is_forwarded: boolean;
  is_pinned: boolean;
  is_deleted: boolean;
}

export interface GroupEventBudgetItem {
  id: number;
  description: string;
  amount: number | string;
}

export interface GroupEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  created_by: string | null;
  budget_items: GroupEventBudgetItem[];
  planned_budget: number | string;
  created_at: string;
  updated_at: string;
}

export interface Settlement {
  id: number;
  group: number;
  paid_by: number;
  paid_to: number;
  amount: number | string;
  date: string;
}

export interface Friend extends UserSummary {
  balance: number;
  status: "owed" | "owe" | "settled";
}

export interface FriendRequest {
  id: number;
  from_user: UserSummary;
  to_user: UserSummary;
  status: "pending" | "accepted";
  created_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
  is_active: boolean;
  has_password: boolean;
}

export function resolveProfilePictureUrl(picture: string | null | undefined): string | undefined {
  if (!picture) return undefined;
  if (/^https?:\/\//i.test(picture)) return picture;

  const configuredUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";
  const apiRoot = configuredUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
  const mediaPath = picture.startsWith("/")
    ? picture
    : `/media/${picture.replace(/^\/+/, "")}`;

  return new URL(mediaPath, `${apiRoot}/`).toString();
}

export interface DashboardAnalytics {
  summary: {
    net_group_balance: number;
    balance_status: "YOU_ARE_OWED" | "OWED_MONEY" | "SETTLED";
    total_personal_income_this_month: number;
    total_personal_spent_this_month: number;
    net_personal_savings: number;
  };
  category_distribution: Record<string, number>;
  monthly_history: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
}

const getMessage = (errors: unknown): string | null => {
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return errors.map(String).join(" ");
  if (errors && typeof errors === "object") {
    return Object.entries(errors)
      .map(([field, value]) => {
        const detail = Array.isArray(value) ? value.join(" ") : String(value);
        return `${field}: ${detail}`;
      })
      .join(" ");
  }
  return null;
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: unknown; detail?: unknown; errors?: unknown }
      | undefined;
    const detail =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.detail === "string" && body.detail) ||
      getMessage(body?.errors);
    if (detail) return detail;
    if (!error.response) return "Unable to reach BillBuddy. Check your connection and try again.";
    if (error.response.status === 401) return "Your session has expired. Please sign in again.";
    if (error.response.status === 403) return "You do not have permission to perform this action.";
    return `Request failed (${error.response.status}). Please try again.`;
  }
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export async function apiRequest<T>(
  method: Method,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const api = await getAuthenticatedApi();
  const response = await api.request<ApiEnvelope<T>>({
    method,
    url: path,
    data,
    ...config,
  });
  if (!response.data.success) {
    throw new Error(response.data.message || "The request could not be completed.");
  }
  return response.data.data;
}

export const apiGet = <T>(path: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("GET", path, undefined, config);
export const apiPost = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiRequest<T>("POST", path, data, config);
export const apiPatch = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
  apiRequest<T>("PATCH", path, data, config);
export const apiDelete = <T = void>(path: string, config?: AxiosRequestConfig) =>
  apiRequest<T>("DELETE", path, undefined, config);

export function userDisplayName(user: Pick<UserSummary, "username" | "first_name" | "last_name">): string {
  return `${user.first_name} ${user.last_name}`.trim() || user.username;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatApiDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
