"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Bell,
  CircleUserRound,
  Globe,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sun,
  UserRound,
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
import { apiGet, apiPatch, apiPost, getApiErrorMessage, type UserProfile } from "@/lib/api/billbuddy";

type SettingsSection = "profile" | "preferences" | "notifications" | "security" | "account";
const settingsNav: Array<{ id: SettingsSection; label: string; description: string; icon: typeof CircleUserRound }> = [
  { id: "profile", label: "Profile", description: "Your personal information", icon: CircleUserRound },
  { id: "preferences", label: "Preferences", description: "Customize your experience", icon: Palette },
  { id: "notifications", label: "Notifications", description: "Control your notifications", icon: Bell },
  { id: "security", label: "Security", description: "Password and account security", icon: Shield },
  { id: "account", label: "Account", description: "Account management", icon: UserRound },
];

export default function SettingsPage() {
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
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
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
                    <p className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="truncate text-sm lg:hidden">{item.label}</span>
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

  const saveTheme = () => {
    toast.success("Preference saved in this browser.");
  };

  return (
    <div className="space-y-6">
      <SettingsHeader title="Preferences" description="Customize your experience. Preferences are saved in this browser." />
      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle><CardDescription>Choose the color theme used by BillBuddy.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <SettingRow icon={Palette} title="Theme" description="Choose your preferred appearance.">
            <Select value={theme ?? "system"} onValueChange={(value) => { setTheme(value); saveTheme(); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="light"><span className="flex items-center gap-2"><Sun className="size-3.5" />Light</span></SelectItem><SelectItem value="dark"><span className="flex items-center gap-2"><Moon className="size-3.5" />Dark</span></SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Regional settings</CardTitle><CardDescription>Current regional defaults used by the application.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4"><p className="text-sm font-medium">Currency</p><p className="mt-1 text-xs text-muted-foreground">NPR (Rs.) — fixed by the current API and app.</p></div>
          <div className="rounded-lg border bg-muted/30 p-4"><p className="text-sm font-medium">Language</p><p className="mt-1 text-xs text-muted-foreground">English — additional languages are not currently available.</p></div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4 sm:col-span-2"><Globe className="size-4 shrink-0 text-muted-foreground" /><div><p className="text-sm font-medium">Time zone</p><p className="mt-0.5 text-xs text-muted-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p></div></div>
        </CardContent>
      </Card>
    </div>
  );
}

const notificationDefaults: Record<string, boolean> = { expenseAdded: true, settlementReceived: true, friendRequests: true, groupInvitations: true, newMessages: true, groupActivity: false, weeklySummary: true };
const notificationLabels = [
  { key: "expenseAdded", title: "Expense added", description: "Notify me when a new group expense is recorded." },
  { key: "settlementReceived", title: "Settlement received", description: "Notify me when someone records a payment to me." },
  { key: "friendRequests", title: "Friend requests", description: "Notify me about incoming friend requests." },
  { key: "groupInvitations", title: "Group invitations", description: "Notify me when I am added to a group." },
  { key: "newMessages", title: "New messages", description: "Notify me when a group message arrives." },
  { key: "groupActivity", title: "Group activity", description: "Notify me about important changes in groups." },
  { key: "weeklySummary", title: "Weekly summary", description: "Receive a weekly summary of activity." },
];

function NotificationSettings() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(notificationDefaults);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("billbuddy-notifications");
      if (stored) setPreferences({ ...notificationDefaults, ...JSON.parse(stored) as Record<string, boolean> });
    } catch {
      toast.error("Saved notification settings could not be read; using defaults.");
    }
  }, []);
  const update = (key: string, checked: boolean) => {
    const next = { ...preferences, [key]: checked };
    setPreferences(next);
    localStorage.setItem("billbuddy-notifications", JSON.stringify(next));
    toast.success("Notification preference saved in this browser.");
  };
  return (
    <div className="space-y-6">
      <SettingsHeader title="Notifications" description="Notification delivery preferences are stored locally because the backend has no preference endpoint." />
      <Card>
        <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle><CardDescription>These switches do not change server-side or email delivery.</CardDescription></CardHeader>
        <CardContent className="divide-y">
          {notificationLabels.map((item) => <div key={item.key} className="flex items-center gap-4 py-4"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p></div><Switch checked={preferences[item.key]} onCheckedChange={(checked) => update(item.key, checked)} aria-label={item.title} /></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings({ hasPassword }: { hasPassword: boolean }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  return (
    <div className="space-y-6">
      <SettingsHeader title="Security" description="Manage the security options currently supported by BillBuddy." />
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
          <Separator />
          <SettingRow icon={Smartphone} title="Other active sessions" description="The backend does not expose session management."><Badge variant="outline">Unavailable</Badge></SettingRow>
        </CardContent>
      </Card>
      <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} hasPassword={hasPassword} />
    </div>
  );
}

function AccountSettings({ profile }: { profile: UserProfile | null }) {
  const signOut = useSignOut();
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
        <CardHeader><CardTitle className="text-base text-destructive">Account deletion</CardTitle><CardDescription>The current backend does not provide an account deletion endpoint.</CardDescription></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">To request account removal, contact BillBuddy support. This frontend will not simulate deletion.</p></CardContent>
      </Card>
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

function SettingRow({ icon: Icon, title, description, children }: { icon: typeof CircleUserRound; title: string; description: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{description}</p></div>{children}</div>;
}

function AccountRow({ icon: Icon, title, value }: { icon: typeof Mail; title: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-muted"><Icon className="size-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{value}</p></div></div>;
}

function SkeletonCard() {
  return <Card><CardContent className="space-y-3 p-6"><div className="h-5 w-36 animate-pulse rounded bg-muted" /><div className="h-10 w-full animate-pulse rounded bg-muted" /><div className="h-10 w-2/3 animate-pulse rounded bg-muted" /></CardContent></Card>;
}
