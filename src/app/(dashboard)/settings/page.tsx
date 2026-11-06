"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut as clearAuthSession, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  Bell,
  Clock3,
  CircleUserRound,
  Globe,
  Lock,
  LogOut,
  MapPin,
  Mail,
  Monitor,
  Moon,
  Palette,
  RotateCw,
  Shield,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSignOut } from "@/hooks/use-signout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPatch, apiPost, apiRequest, getApiErrorMessage, type NotificationChannelPreferences, type UserProfile, type UserSessionRecord } from "@/lib/api/billbuddy";
import {
  getCurrencySymbol,
  getTimezoneOffsetLabel,
  supportedCurrencies,
  supportedTimezones,
  useAppPreferences,
} from "@/providers/preferences-provider";

type SettingsSection = "profile" | "preferences" | "notifications" | "security" | "account";
const settingsNav: Array<{ id: SettingsSection; label: string; description: string; icon: typeof CircleUserRound }> = [
  { id: "profile", label: "Profile", description: "Your personal information", icon: CircleUserRound },
  { id: "preferences", label: "Preferences", description: "Customize your experience", icon: Palette },
  { id: "notifications", label: "Notifications", description: "Control your notifications", icon: Bell },
  { id: "security", label: "Security", description: "Password and account security", icon: Shield },
  { id: "account", label: "Account", description: "Account management", icon: UserRound },
];

export default function SettingsPage() {
  const { t } = useAppPreferences();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      setProfile(await apiGet<UserProfile>("/profile/"));
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, preferences, and security.</p>
      </div>
      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit lg:sticky lg:top-24">
          <nav className="grid grid-cols-2 gap-1 lg:flex lg:flex-col">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={`flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition-colors sm:gap-3 sm:px-3 lg:w-full ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="size-4 shrink-0" />
                  <div className="hidden min-w-0 lg:block">
                    <p className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{item.id === "preferences" ? t("preferences") : item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{item.id === "preferences" ? t("customizeExperience") : item.description}</p>
                  </div>
                  <span className="truncate text-sm lg:hidden">{item.id === "preferences" ? t("preferences") : item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          {activeSection === "profile" && <ProfileSettings profile={profile} loading={profileLoading} error={profileError} onRetry={() => void loadProfile()} onUpdated={setProfile} />}
          {activeSection === "preferences" && <PreferencesSettings />}
          {activeSection === "notifications" && <NotificationSettings />}
          {activeSection === "security" && <SecuritySettings hasPassword={profile?.has_password ?? true} />}
          {activeSection === "account" && <AccountSettings profile={profile} />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ profile, loading, error, onRetry, onUpdated }: { profile: UserProfile | null; loading: boolean; error: string | null; onRetry: () => void; onUpdated: (profile: UserProfile) => void }) {
  const { update: updateSession } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [picture, setPicture] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setUsername(profile.username ?? "");
  }, [profile]);

  const saveProfile = async () => {
    if (!profile || !username.trim()) {
      setFormError("Username is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      let updated: UserProfile;
      if (picture) {
        const form = new FormData();
        form.set("firstName", firstName.trim());
        form.set("lastName", lastName.trim());
        form.set("username", username.trim());
        form.set("pictureFile", picture);
        updated = await apiPatch<UserProfile>("/profile/", form);
      } else {
        updated = await apiPatch<UserProfile>("/profile/", { firstName: firstName.trim(), lastName: lastName.trim(), username: username.trim() });
      }
      onUpdated(updated);
      await updateSession();
      setPicture(null);
      toast.success("Profile updated.");
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error || !profile) return <Card><CardContent className="p-6"><p className="text-sm text-destructive">{error ?? "Profile unavailable."}</p><Button variant="outline" className="mt-4" onClick={onRetry}>Retry</Button></CardContent></Card>;
  const fullName = `${firstName} ${lastName}`.trim() || profile.username;

  return (
    <div className="space-y-6">
      <SettingsHeader title="Profile" description="Update the personal information associated with your account." />
      <Card>
        <CardHeader><CardTitle className="text-base">Profile picture</CardTitle><CardDescription>Choose an image to show to friends and group members.</CardDescription></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-20"><AvatarImage src={profile.profilePicture ?? undefined} alt={fullName} /><AvatarFallback className="text-lg">{fullName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</AvatarFallback></Avatar>
            <div>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  setFormError("Profile images must be 2MB or smaller.");
                  event.target.value = "";
                  return;
                }
                setPicture(file);
                setFormError(null);
              }} />
              <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>{picture?.name ?? "Choose photo"}</Button>
              <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or WebP, maximum 2MB. Upload is saved with your profile.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Personal information</CardTitle><CardDescription>Update the information shown on your profile.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="first-name">First name</Label><Input id="first-name" maxLength={150} value={firstName} onChange={(event) => setFirstName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="last-name">Last name</Label><Input id="last-name" maxLength={150} value={lastName} onChange={(event) => setLastName(event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="username">Username</Label><Input id="username" maxLength={150} value={username} onChange={(event) => setUsername(event.target.value)} /></div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative"><Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" value={profile.email} disabled className="pl-9" /></div>
            <p className="text-xs text-muted-foreground">Email changes are not supported by the current API.</p>
          </div>
          <Separator />
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
          <div className="flex justify-end"><Button onClick={() => void saveProfile()} disabled={saving || !username.trim()}>{saving ? "Saving..." : "Save changes"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const { preferences, loading, error, reload, save, t } = useAppPreferences();
  const [currency, setCurrency] = useState(preferences.currency);
  const [language, setLanguage] = useState(preferences.language);
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setCurrency(preferences.currency);
    setLanguage(preferences.language);
    setTimezone(preferences.timezone);
  }, [preferences]);

  const isDirty = currency !== preferences.currency ||
    language !== preferences.language ||
    timezone !== preferences.timezone;

  const saveRegionalPreferences = async () => {
    setSavingPreferences(true);
    setPreferencesError(null);
    setHasSaved(false);
    try {
      await save({ currency, language, timezone });
      setHasSaved(true);
      toast.success(t("saved"));
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setPreferencesError(message);
      toast.error(message);
    } finally {
      setSavingPreferences(false);
    }
  };

  const saveTheme = () => {
    toast.success("Preference saved in this browser.");
  };

  return (
    <div className="space-y-6">
      <SettingsHeader title={t("preferences")} description={t("customizeExperience")} />
      <Card>
        <CardHeader><CardTitle className="text-base">{t("appearance")}</CardTitle><CardDescription>{t("colorTheme")}</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <SettingRow icon={Palette} title={t("theme")} description="Choose your preferred appearance.">
            <Select value={theme ?? "system"} onValueChange={(value) => { setTheme(value); saveTheme(); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="light"><span className="flex items-center gap-2"><Sun className="size-3.5" />Light</span></SelectItem><SelectItem value="dark"><span className="flex items-center gap-2"><Moon className="size-3.5" />Dark</span></SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">{t("regionalSettings")}</CardTitle><CardDescription>{t("regionalDescription")}</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {loading ? (
            <SkeletonCard />
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void reload().catch(() => undefined)}>Retry</Button>
            </div>
          ) : <>
            <div className="grid min-w-0 gap-4 xl:grid-cols-2">
              <PreferenceOption icon={Wallet} title={t("currency")} description="Display currency only; amounts are not converted.">
                <Select value={currency} onValueChange={(value) => { setCurrency(value); setHasSaved(false); }}>
                  <SelectTrigger aria-label={t("selectCurrency")} className="w-full min-w-0"><SelectValue className="min-w-0 flex-1 truncate" /></SelectTrigger>
                  <SelectContent>
                    {supportedCurrencies.map((item) => <SelectItem key={item.code} value={item.code}>
                      {getCurrencySymbol(item.code, language)} · {item.code} — {item.name}
                    </SelectItem>)}
                  </SelectContent>
                </Select>
              </PreferenceOption>
              <PreferenceOption icon={Globe} title={t("language")} description="Interface language. Untranslated text remains in English.">
                <Select value={language} onValueChange={(value: "en" | "ne") => { setLanguage(value); setHasSaved(false); }}>
                  <SelectTrigger aria-label={t("selectLanguage")} className="w-full min-w-0"><SelectValue className="min-w-0 flex-1 truncate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ne">नेपाली (Nepali)</SelectItem>
                  </SelectContent>
                </Select>
              </PreferenceOption>
              <PreferenceOption icon={Globe} title={t("timezone")} description="Used to display timestamps and event times.">
                <Select value={timezone} onValueChange={(value) => { setTimezone(value); setHasSaved(false); }}>
                  <SelectTrigger aria-label={t("selectTimezone")} className="w-full min-w-0"><SelectValue className="min-w-0 flex-1 truncate" /></SelectTrigger>
                  <SelectContent>
                    {supportedTimezones.map((item) => <SelectItem key={item} value={item}>
                      {item} ({getTimezoneOffsetLabel(item)})
                    </SelectItem>)}
                  </SelectContent>
                </Select>
              </PreferenceOption>
            </div>
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0" aria-live="polite">
                {preferencesError && <p role="alert" className="text-sm text-destructive">{preferencesError}</p>}
                {hasSaved && !preferencesError && <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("saved")}</p>}
                {isDirty && <p className="text-xs text-muted-foreground">You have unsaved preference changes.</p>}
              </div>
              <Button className="w-full shrink-0 sm:w-auto" onClick={() => void saveRegionalPreferences()} disabled={!isDirty || savingPreferences}>
                {savingPreferences ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </>}
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationChannelPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const categories: Array<{ key: keyof NotificationChannelPreferences; title: string; description: string }> = [
    { key: "groups", title: "Groups and invitations", description: "Member changes, group updates, and invitations." },
    { key: "expenses", title: "Group expenses", description: "New, edited, and removed shared expenses." },
    { key: "chat", title: "Messages and mentions", description: "Group chat messages and mentions." },
    { key: "settlements", title: "Payments and settlements", description: "Important payment updates." },
    { key: "reminders", title: "Reminders", description: "Scheduled expense, event, and settlement reminders." },
    { key: "security", title: "Account security", description: "Important sign-in and password activity (always enabled)." },
  ];

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet<{ categories: NotificationChannelPreferences }>("/notifications/preferences/");
      setPreferences(response.categories);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void loadPreferences(); }, [loadPreferences]);

  const update = async (category: keyof NotificationChannelPreferences, channel: "in_app" | "email", checked: boolean) => {
    if (!preferences || category === "security") return;
    const previous = preferences;
    const next = { ...preferences, [category]: { ...preferences[category], [channel]: checked } };
    setPreferences(next);
    setSavingKey(`${category}:${channel}`);
    setError(null);
    try {
      const response = await apiPatch<{ categories: NotificationChannelPreferences }>("/notifications/preferences/", { categories: next });
      setPreferences(response.categories);
      toast.success("Notification preferences updated.");
    } catch (requestError) {
      setPreferences(previous);
      setError(getApiErrorMessage(requestError));
    } finally {
      setSavingKey(null);
    }
  };
  return (
    <div className="space-y-6">
      <SettingsHeader title="Notifications" description="Choose which activity updates you receive in Bill Buddy and by email." />
      <Card>
        <CardHeader><CardTitle className="text-base">Delivery preferences</CardTitle><CardDescription>Security notifications remain enabled to protect your account.</CardDescription></CardHeader>
        <CardContent>
          {loading ? <div className="space-y-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded bg-muted/50" />)}</div> : error && !preferences ? (
            <div className="space-y-3"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => void loadPreferences()}>Retry</Button></div>
          ) : preferences && <>
            <div className="mb-2 hidden grid-cols-[minmax(0,1fr)_90px_90px] gap-3 px-1 text-center text-xs font-medium text-muted-foreground sm:grid"><span /><span>In-app</span><span>Email</span></div>
            <div className="divide-y">
              {categories.map((item) => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_90px_90px]">
                <div className="min-w-0"><p className="text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div>
                {(["in_app", "email"] as const).map((channel) => <div key={channel} className="flex flex-col items-center gap-1 sm:gap-0">
                  <span className="text-[10px] text-muted-foreground sm:hidden">{channel === "in_app" ? "In-app" : "Email"}</span>
                  <Switch checked={preferences[item.key][channel]} disabled={item.key === "security" || savingKey === `${item.key}:${channel}`} onCheckedChange={(checked) => void update(item.key, channel, checked)} aria-label={`${item.title} ${channel}`} />
                </div>)}
              </div>)}
            </div>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </>}
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings({ hasPassword }: { hasPassword: boolean }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState<UserSessionRecord[]>([]);
  const [sessionHistory, setSessionHistory] = useState<UserSessionRecord[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionAction, setSessionAction] = useState<{ type: "session"; session: UserSessionRecord } | { type: "others" } | null>(null);
  const [revoking, setRevoking] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const [active, history] = await Promise.all([
        apiGet<UserSessionRecord[]>("/sessions/"),
        apiGet<UserSessionRecord[]>("/sessions/history/"),
      ]);
      setActiveSessions(active);
      setSessionHistory(history);
    } catch (error) {
      setSessionsError(getApiErrorMessage(error));
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { void loadSessions(); }, [loadSessions]);

  const confirmRevoke = async () => {
    if (!sessionAction) return;
    setRevoking(true);
    setSessionsError(null);
    try {
      if (sessionAction.type === "others") {
        await apiPost("/sessions/revoke-others/");
        toast.success("All other sessions have been signed out.");
      } else {
        await apiPost(`/sessions/${encodeURIComponent(sessionAction.session.id)}/revoke/`);
        toast.success("Session revoked.");
      }
      setSessionAction(null);
      await loadSessions();
    } catch (error) {
      const message = getApiErrorMessage(error);
      setSessionsError(message);
      toast.error(message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader title="Security" description="Manage your password and the devices signed in to your account." />
      <Card>
        <CardHeader><CardTitle className="text-base">Password</CardTitle><CardDescription>{hasPassword ? "Change the password used to sign in." : "Create a password for your account."}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SettingRow icon={Lock} title={hasPassword ? "Password enabled" : "No password set"} description={hasPassword ? "Change it if it may have been exposed." : "You can add one alongside social sign-in."}>
            <Button variant="outline" onClick={() => setPasswordOpen(true)}>{hasPassword ? "Change password" : "Set password"}</Button>
          </SettingRow>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Additional security</CardTitle><CardDescription>Features the backend does not currently provide.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <SettingRow icon={Shield} title="Two-factor authentication" description="No two-factor configuration endpoint is available."><Badge variant="outline">Unavailable</Badge></SettingRow>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-base">Active sessions</CardTitle><CardDescription>Devices currently signed in to your BillBuddy account.</CardDescription></div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadSessions()} disabled={sessionsLoading}>
            <RotateCw className={`size-4 ${sessionsLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsError && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{sessionsError}</div>}
          {sessionsLoading ? (
            <SkeletonCard />
          ) : activeSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No active sessions were found.</p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => <ActiveSessionCard key={session.id} session={session} onRevoke={() => setSessionAction({ type: "session", session })} />)}
            </div>
          )}
          {activeSessions.length > 1 && <div className="border-t pt-4"><Button variant="destructive" size="sm" onClick={() => setSessionAction({ type: "others" })} disabled={sessionsLoading}>Sign out all other devices</Button></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Session history</CardTitle><CardDescription>Recent devices that have signed out or been revoked.</CardDescription></CardHeader>
        <CardContent>
          {sessionsLoading ? <SkeletonCard /> : sessionHistory.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No previous sessions.</p>
          ) : (
            <div className="divide-y">
              {sessionHistory.map((session) => (
                <div key={session.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between">
                  <SessionDeviceInfo session={session} />
                  <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                    <Badge variant={session.status === "revoked" ? "destructive" : "outline"}>{session.status === "revoked" ? "Revoked" : "Logged out"}</Badge>
                    <span className="text-xs text-muted-foreground">Ended {formatSessionDate(session.logout_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={sessionAction !== null} onOpenChange={(open) => { if (!open && !revoking) setSessionAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sessionAction?.type === "others" ? "Sign out other devices?" : "Revoke this session?"}</DialogTitle>
            <DialogDescription>
              {sessionAction?.type === "others"
                ? "All other devices will be signed out immediately. This device will remain signed in."
                : `The ${sessionAction?.type === "session" ? sessionAction.session.device.toLowerCase() : ""} will lose access immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={revoking} onClick={() => setSessionAction(null)}>Cancel</Button>
            <Button variant="destructive" disabled={revoking} onClick={() => void confirmRevoke()}>{revoking ? "Signing out..." : "Confirm"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} hasPassword={hasPassword} />
    </div>
  );
}

function ActiveSessionCard({ session, onRevoke }: { session: UserSessionRecord; onRevoke: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
      <SessionDeviceInfo session={session} />
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        {session.is_current ? <Badge className="gap-1"><ShieldCheck className="size-3" /> This device</Badge> : <Badge variant="outline">Active</Badge>}
        {!session.is_current && <Button variant="outline" size="sm" className="gap-2" onClick={onRevoke}><LogOut className="size-3.5" /> Revoke</Button>}
      </div>
    </div>
  );
}

function SessionDeviceInfo({ session }: { session: UserSessionRecord }) {
  const DeviceIcon = /mobile|tablet/i.test(session.device) ? Smartphone : Monitor;
  return (
    <div className="flex min-w-0 gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><DeviceIcon className="size-4 text-muted-foreground" /></div>
      <div className="min-w-0 space-y-1">
        <p className="break-words text-sm font-medium">{session.device} · {session.operating_system}</p>
        <p className="break-words text-xs text-muted-foreground">{session.browser}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> IP {session.ip_address ?? "Unavailable"}</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3" /> Signed in {formatSessionDate(session.login_at)}</span>
          <span className="inline-flex items-center gap-1"><Clock3 className="size-3" /> Last active {formatSessionDate(session.last_activity)}</span>
        </div>
      </div>
    </div>
  );
}

function formatSessionDate(value: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function AccountSettings({ profile }: { profile: UserProfile | null }) {
  const signOut = useSignOut();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiRequest("DELETE", "/account/delete/", {
        confirmation,
        ...(password ? { password } : {}),
      });
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setDeleteError(message);
      toast.error(message);
      setDeleting(false);
      return;
    }

    toast.success("Your account has been deleted.");
    try {
      await clearAuthSession({ callbackUrl: "/auth/login" });
    } catch (signOutError) {
      console.error("Could not clear the local session after account deletion.", signOutError);
      window.location.assign("/auth/login");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader title="Account" description="Manage your BillBuddy account and current session." />
      <Card>
        <CardHeader><CardTitle className="text-base">Account information</CardTitle></CardHeader>
        <CardContent className="space-y-4"><AccountRow icon={Mail} title="Email address" value={profile?.email ?? "Unavailable"} /><Separator /><AccountRow icon={CircleUserRound} title="Username" value={profile ? `@${profile.username}` : "Unavailable"} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Current session</CardTitle><CardDescription>Sign out of this device.</CardDescription></CardHeader>
        <CardContent><Button variant="outline" className="gap-2" onClick={() => void signOut()}><LogOut className="size-4" /> Sign out</Button></CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-base text-destructive">Account deletion</CardTitle><CardDescription>Deleting your account permanently disables access. Your financial history and messages are retained.</CardDescription></CardHeader>
        <CardContent><Button variant="destructive" className="gap-2" onClick={() => { setConfirmation(""); setPassword(""); setDeleteError(null); setDeleteOpen(true); }}><Trash2 className="size-4" /> Delete account</Button></CardContent>
      </Card>
      <Dialog open={deleteOpen} onOpenChange={(open) => { if (!deleting) setDeleteOpen(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Account access will be permanently disabled and active sessions will be revoked. Existing expenses, income, transactions, and messages will remain for historical records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-account-password">Current password (if applicable)</Label>
            <Input id="delete-account-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <p className="text-xs text-muted-foreground">Required for accounts with a password; leave blank for Google-only accounts.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delete-account-confirmation">Type DELETE to confirm</Label>
            <Input id="delete-account-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" />
          </div>
          {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting || confirmation !== "DELETE"} onClick={() => void deleteAccount()}>
              {deleting ? "Deleting..." : "Permanently delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChangePasswordDialog({ open, onOpenChange, hasPassword }: { open: boolean; onOpenChange: (open: boolean) => void; hasPassword: boolean }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Choose a password with at least 8 characters."); return; }
    setSaving(true);
    setError(null);
    try {
      await apiPost("/change-password/", { ...(hasPassword ? { old_password: oldPassword } : {}), new_password: newPassword });
      toast.success("Password updated.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  const handleOpen = (value: boolean) => {
    if (!value) { setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setError(null); }
    onOpenChange(value);
  };
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader><DialogTitle>{hasPassword ? "Change password" : "Set password"}</DialogTitle><DialogDescription>Use a strong password that you do not reuse on other sites.</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {hasPassword && <div className="space-y-2"><Label htmlFor="old-password">Current password</Label><Input id="old-password" type="password" autoComplete="current-password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} /></div>}
          <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => handleOpen(false)}>Cancel</Button><Button disabled={saving || !newPassword || !confirmPassword || (hasPassword && !oldPassword)} onClick={() => void submit()}>{saving ? "Updating..." : "Update password"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettingsHeader({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}

function PreferenceOption({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof CircleUserRound;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border p-3 sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SettingRow({ icon: Icon, title, description, children }: { icon: typeof CircleUserRound; title: string; description: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div>{children}</div>;
}

function AccountRow({ icon: Icon, title, value }: { icon: typeof Mail; title: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{value}</p></div></div>;
}

function SkeletonCard() {
  return <Card><CardContent className="space-y-3 p-6"><div className="h-5 w-36 animate-pulse rounded bg-muted" /><div className="h-10 w-full animate-pulse rounded bg-muted" /><div className="h-10 w-2/3 animate-pulse rounded bg-muted" /></CardContent></Card>;
}
