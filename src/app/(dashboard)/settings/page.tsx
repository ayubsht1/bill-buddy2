"use client";

import { useState } from "react";
import {
  Bell,
  ChevronRight,
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
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SettingsSection =
  | "profile"
  | "preferences"
  | "notifications"
  | "security"
  | "account";

const settingsNav = [
  {
    id: "profile" as const,
    label: "Profile",
    description: "Your personal information",
    icon: CircleUserRound,
  },
  {
    id: "preferences" as const,
    label: "Preferences",
    description: "Customize your experience",
    icon: Palette,
  },
  {
    id: "notifications" as const,
    label: "Notifications",
    description: "Control your notifications",
    icon: Bell,
  },
  {
    id: "security" as const,
    label: "Security",
    description: "Password and account security",
    icon: Shield,
  },
  {
    id: "account" as const,
    label: "Account",
    description: "Account management",
    icon: UserRound,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, preferences, and notifications.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Settings Navigation */}
        <aside className="h-fit lg:sticky lg:top-24">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(item.id)
                  }
                  className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors lg:w-full ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />

                  <div className="hidden min-w-0 lg:block">
                    <p
                      className={`text-sm font-medium ${
                        active
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </p>

                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {item.description}
                    </p>
                  </div>

                  <span className="lg:hidden">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {activeSection === "profile" && (
            <ProfileSettings />
          )}

          {activeSection === "preferences" && (
            <PreferencesSettings />
          )}

          {activeSection === "notifications" && (
            <NotificationSettings />
          )}

          {activeSection === "security" && (
            <SecuritySettings />
          )}

          {activeSection === "account" && (
            <AccountSettings />
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================================================
   PROFILE
======================================================= */

function ProfileSettings() {
  const [name, setName] = useState("Ayub Shrestha");
  const [username, setUsername] = useState("ayubsht1");
  const [email, setEmail] =
    useState("ayub@example.com");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    console.log({
      name,
      username,
      email,
      phone,
    });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Profile"
        description="Manage the personal information associated with your account."
      />

      {/* Profile picture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Profile picture
          </CardTitle>

          <CardDescription>
            This image will be visible to your friends and
            group members.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-20">
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback className="text-lg">
                AS
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Change photo
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Remove
                </Button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG or WebP. Maximum 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Personal information
          </CardTitle>

          <CardDescription>
            Update the information shown on your profile.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full name
              </Label>

              <Input
                id="name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                Username
              </Label>

              <Input
                id="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email address
            </Label>

            <div className="relative">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone number
              <span className="ml-1 text-muted-foreground">
                (optional)
              </span>
            </Label>

            <div className="relative">
              <Smartphone className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="phone"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="+977 98XXXXXXXX"
                className="pl-9"
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =======================================================
   PREFERENCES
======================================================= */

function PreferencesSettings() {
  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Preferences"
        description="Customize how Bill Buddy looks and behaves."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Appearance
          </CardTitle>

          <CardDescription>
            Choose how Bill Buddy should look.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Palette className="size-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Theme
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose your preferred appearance.
                </p>
              </div>
            </div>

            <Select defaultValue="system">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="light">
                  <span className="flex items-center gap-2">
                    <Sun className="size-3.5" />
                    Light
                  </span>
                </SelectItem>

                <SelectItem value="dark">
                  <span className="flex items-center gap-2">
                    <Moon className="size-3.5" />
                    Dark
                  </span>
                </SelectItem>

                <SelectItem value="system">
                  System
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <PreferenceRow
            icon={CircleUserRound}
            title="Compact mode"
            description="Use a more compact layout for lists and tables."
          >
            <Switch />
          </PreferenceRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Regional settings
          </CardTitle>

          <CardDescription>
            Control your currency and regional preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Currency</Label>

              <Select defaultValue="npr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="npr">
                    NPR — Nepalese Rupee
                  </SelectItem>

                  <SelectItem value="usd">
                    USD — US Dollar
                  </SelectItem>

                  <SelectItem value="eur">
                    EUR — Euro
                  </SelectItem>

                  <SelectItem value="gbp">
                    GBP — British Pound
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>

              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="en">
                    English
                  </SelectItem>

                  <SelectItem value="ne">
                    नेपाली
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
            <Globe className="size-4 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">
                Time zone
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Asia/Kathmandu (GMT +5:45)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* =======================================================
   NOTIFICATIONS
======================================================= */

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Notifications"
        description="Choose what you want to be notified about."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Activity
          </CardTitle>

          <CardDescription>
            Notifications related to your expenses and groups.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-1">
          <NotificationRow
            title="Expense added"
            description="Notify me when a new expense is added to my groups."
            defaultChecked
          />

          <NotificationRow
            title="Settlement received"
            description="Notify me when someone settles a balance with me."
            defaultChecked
          />

          <NotificationRow
            title="Friend requests"
            description="Notify me when someone sends me a friend request."
            defaultChecked
          />

          <NotificationRow
            title="Group invitations"
            description="Notify me when someone invites me to a group."
            defaultChecked
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Messages
          </CardTitle>

          <CardDescription>
            Control notifications for conversations.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-1">
          <NotificationRow
            title="New messages"
            description="Notify me when I receive a new message."
            defaultChecked
          />

          <NotificationRow
            title="Group activity"
            description="Notify me about important activity in group conversations."
            defaultChecked={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Email notifications
          </CardTitle>

          <CardDescription>
            Manage emails sent to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <NotificationRow
            title="Weekly summary"
            description="Receive a weekly summary of your spending and settlements."
            defaultChecked
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* =======================================================
   SECURITY
======================================================= */

function SecuritySettings() {
  const [passwordDialogOpen, setPasswordDialogOpen] =
    useState(false);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Security"
        description="Keep your account secure and manage your login settings."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Password
          </CardTitle>

          <CardDescription>
            Change your password regularly to keep your account
            secure.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Lock className="size-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Password
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last changed recently
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setPasswordDialogOpen(true)
              }
            >
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Two-factor authentication
          </CardTitle>

          <CardDescription>
            Add an extra layer of protection to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Two-factor authentication
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Protect your account with an additional
                  verification step.
                </p>
              </div>
            </div>

            <Button variant="outline">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Active sessions
          </CardTitle>

          <CardDescription>
            Devices currently signed in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <Smartphone className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                Windows · Chrome
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Current session
              </p>
            </div>

            <Badge variant="secondary">
              Active
            </Badge>
          </div>

          <Separator />

          <Button
            variant="outline"
            className="w-full sm:w-auto"
          >
            Sign out all other sessions
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}

/* =======================================================
   ACCOUNT
======================================================= */

function AccountSettings() {
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Account"
        description="Manage your Bill Buddy account."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Account information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <AccountRow
            icon={Mail}
            title="Email address"
            value="ayub@example.com"
          />

          <Separator />

          <AccountRow
            icon={CircleUserRound}
            title="Username"
            value="@ayubsht1"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sessions
          </CardTitle>

          <CardDescription>
            Sign out of your current Bill Buddy session.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            variant="outline"
            className="gap-2"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger zone
          </CardTitle>

          <CardDescription>
            These actions can permanently affect your account
            and data.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                Delete account
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Permanently delete your account and associated
                data.
              </p>
            </div>

            <Button
              variant="destructive"
              className="gap-2"
              onClick={() =>
                setDeleteDialogOpen(true)
              }
            >
              <Trash2 className="size-4" />
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}

/* =======================================================
   SHARED COMPONENTS
======================================================= */

function SettingsHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PreferenceRow({
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
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

function NotificationRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function AccountRow({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {value}
        </p>
      </div>

      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}

/* =======================================================
   CHANGE PASSWORD DIALOG
======================================================= */

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleSubmit = () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    console.log("Change password");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            Change password
          </DialogTitle>

          <DialogDescription>
            Enter your current password and choose a new
            password.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">
              Current password
            </Label>

            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">
              New password
            </Label>

            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">
              Confirm new password
            </Label>

            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
            />

            {confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            Update password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* =======================================================
   DELETE ACCOUNT DIALOG
======================================================= */

function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [confirmation, setConfirmation] =
    useState("");

  const handleDelete = () => {
    if (confirmation !== "DELETE") return;

    console.log("Delete account");

    setConfirmation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete account
          </DialogTitle>

          <DialogDescription>
            This action cannot be undone. Your profile,
            expenses, groups, and other account data may be
            permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="delete-confirmation">
            Type DELETE to confirm
          </Label>

          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(event) =>
              setConfirmation(event.target.value)
            }
            placeholder="DELETE"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            disabled={confirmation !== "DELETE"}
            onClick={handleDelete}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
