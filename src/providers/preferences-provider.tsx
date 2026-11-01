"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { apiGet, apiPatch, type UserPreferences } from "@/lib/api/billbuddy";
import { messages, type AppLanguage, type MessageKey } from "@/i18n/messages";

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "NPR",
  language: "en",
  timezone: "Asia/Kathmandu",
};

type PreferenceUpdate = UserPreferences;
type PreferencesContextValue = {
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  save: (preferences: PreferenceUpdate) => Promise<UserPreferences>;
  formatCurrency: (amount: number | string) => string;
  formatDate: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (value: string, options?: Intl.DateTimeFormatOptions) => string;
  getDateKey: (value: Date) => string;
  getMonthKey: (value: Date) => string;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

const currencyNames: Record<string, string> = {
  NPR: "Nepalese Rupee",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  AED: "UAE Dirham",
  BDT: "Bangladeshi Taka",
  PKR: "Pakistani Rupee",
};

export const supportedCurrencies = Object.entries(currencyNames).map(([code, name]) => ({
  code,
  name,
}));

export const supportedTimezones = [
  "Asia/Kathmandu",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Dhaka",
  "Asia/Karachi",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Bangkok",
  "Asia/Seoul",
  "Asia/Jakarta",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Madrid",
  "Europe/Zurich",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "UTC",
];

export function getCurrencySymbol(currency: string, language = "en"): string {
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
  } catch {
    return currency;
  }
}

function formatLocalizedDate(
  value: string,
  language: string,
  timezone: string,
  options: Intl.DateTimeFormatOptions,
) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly ? new Date(`${value}T12:00:00Z`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
    timeZone: dateOnly ? "UTC" : timezone,
  }).format(date);
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await apiGet<UserPreferences>("/profile/");
      setPreferences({
        currency: profile.currency || DEFAULT_PREFERENCES.currency,
        language: profile.language || DEFAULT_PREFERENCES.language,
        timezone: profile.timezone || DEFAULT_PREFERENCES.timezone,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Preferences could not be loaded.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      setError(null);
      return;
    }
    if (status === "authenticated") void reload().catch(() => undefined);
  }, [status, reload]);

  useEffect(() => {
    document.documentElement.lang = preferences.language;
  }, [preferences.language]);

  const save = useCallback(async (nextPreferences: PreferenceUpdate) => {
    setError(null);
    const saved = await apiPatch<UserPreferences>("/profile/", nextPreferences);
    const next = {
      currency: saved.currency || nextPreferences.currency,
      language: saved.language || nextPreferences.language,
      timezone: saved.timezone || nextPreferences.timezone,
    };
    setPreferences(next);
    return next;
  }, []);

  const language = preferences.language as AppLanguage;
  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    loading,
    error,
    reload,
    save,
    formatCurrency: (amount) => {
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount)) return String(amount);
      const formatted = new Intl.NumberFormat(language, {
        style: "currency",
        currency: preferences.currency,
      }).format(numericAmount);
      return `${formatted} (${preferences.currency})`;
    },
    formatDate: (date, options = {}) => formatLocalizedDate(date, language, preferences.timezone, options),
    formatTime: (date, options = {}) => {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) return date;
      return new Intl.DateTimeFormat(language, {
        hour: "numeric",
        minute: "2-digit",
        ...options,
        timeZone: preferences.timezone,
      }).format(parsed);
    },
    getDateKey: (date) => {
      const parts = new Intl.DateTimeFormat("en", {
        timeZone: preferences.timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(date);
      const year = parts.find((part) => part.type === "year")?.value;
      const month = parts.find((part) => part.type === "month")?.value;
      const day = parts.find((part) => part.type === "day")?.value;
      return year && month && day ? `${year}-${month}-${day}` : "";
    },
    getMonthKey: (date) => {
      const parts = new Intl.DateTimeFormat("en", {
        timeZone: preferences.timezone,
        year: "numeric",
        month: "2-digit",
      }).formatToParts(date);
      const year = parts.find((part) => part.type === "year")?.value;
      const month = parts.find((part) => part.type === "month")?.value;
      return year && month ? `${year}-${month}` : "";
    },
    t: (key) => messages[language][key] ?? messages.en[key],
  }), [preferences, loading, error, reload, save, language]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("useAppPreferences must be used within PreferencesProvider.");
  return context;
}

export function getTimezoneOffsetLabel(timezone: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(date);
    return parts.find((part) => part.type === "timeZoneName")?.value ?? timezone;
  } catch {
    return timezone;
  }
}
