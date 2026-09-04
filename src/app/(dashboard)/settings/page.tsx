'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, KeyRound, Camera, Check, AlertCircle, Bell, Mail, Smartphone } from 'lucide-react';

const MOCK_USER = {
  id: 1,
  email: 'alex.smith@example.com',
  username: 'alexsmith',
  firstName: 'Alex',
  lastName: 'Smith',
  profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  has_password: true,
  is_2fa_enabled: false,
  notifications: {
    emailAlerts: true,
    pushNotifications: false,
    marketingEmails: true,
  },
};

type Section = 'profile' | 'security' | 'notifications';

// Helper component for animated alert feedback messages
const FormAlert = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) => (
  <AnimatePresence mode="wait">
    {msg && (
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.2 }}
        className={`p-4 rounded-lg text-sm flex items-center space-x-2.5 overflow-hidden ${
          msg.type === 'success'
            ? 'bg-accent text-accent-foreground border border-accent'
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}
      >
        {msg.type === 'success' ? (
          <Check className="w-5 h-5 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 shrink-0" />
        )}
        <span>{msg.text}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function SettingsPage() {
  const [profile, setProfile] = useState(MOCK_USER);
  const [activeSection, setActiveSection] = useState<Section>('profile');

  // Profile Form State
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [username, setUsername] = useState(profile.username);
  const [previewUrl, setPreviewUrl] = useState(profile.profilePicture);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA Mock State
  const [is2FAEnabled, setIs2FAEnabled] = useState(profile.is_2fa_enabled);

  // Notification State
  const [notifications, setNotifications] = useState(profile.notifications);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, firstName, lastName, username, profilePicture: previewUrl }));
    setProfileMsg({ type: 'success', text: 'Profile changes saved successfully.' });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOldPassword('');
    setNewPassword('');
    setPasswordMsg({
      type: 'success',
      text: profile.has_password
        ? 'Password updated successfully.'
        : 'Initial password set successfully.',
    });
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setNotificationMsg({ type: 'success', text: 'Notification preferences updated.' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 lg:p-10 text-foreground">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-base text-muted-foreground mt-1.5">
          Manage your account credentials, profile details, security, and notification preferences.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-1.5">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security & 2FA', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection(item.id as Section)}
                className={`relative w-full flex items-center space-x-3.5 px-4 py-3.5 text-base font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBg"
                    className="absolute inset-0 bg-primary rounded-lg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="relative z-10 w-5 h-5 shrink-0" />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </aside>

        {/* Main Section Card */}
        <main className="flex-1 w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm min-h-[520px]">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.form
                key="profile-section"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleProfileSubmit}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold">Public Profile</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Update your avatar and display information across BillBuddy.
                  </p>
                </div>

                <FormAlert msg={profileMsg} />

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center group shadow-sm"
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={previewUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full object-cover"
                        src={previewUrl}
                        alt="Avatar preview"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>

                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 transition-colors cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 text-base bg-muted text-muted-foreground border border-input rounded-lg cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    Save Profile Changes
                  </motion.button>
                </div>
              </motion.form>
            )}

            {activeSection === 'security' && (
              <motion.div
                key="security-section"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="space-y-10"
              >
                {/* Password Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">
                      {profile.has_password ? 'Change Password' : 'Set Initial Password'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ensure your account uses a strong, unique password to stay secure.
                    </p>
                  </div>

                  <FormAlert msg={passwordMsg} />

                  <div className="space-y-5 max-w-xl">
                    {profile.has_password && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full px-4 py-3 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {profile.has_password ? 'New Password' : 'Set Initial Password'}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      {profile.has_password ? 'Update Password' : 'Set Password'}
                    </motion.button>
                  </div>
                </form>

                <hr className="border-border" />

                {/* 2FA Option */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">Two-Factor Authentication (2FA)</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add an additional layer of security to your account using an authenticator app.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-muted/30 border border-border rounded-xl gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-secondary text-secondary-foreground shrink-0">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-base font-semibold">Authenticator App</div>
                        <div className="text-sm text-muted-foreground">
                          Google Authenticator, Authy, or 1Password.
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors shrink-0 ${
                        is2FAEnabled
                          ? 'border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20'
                          : 'border-border text-foreground bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.form
                key="notifications-section"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleNotificationsSubmit}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose how and when you want to receive alerts and updates.
                  </p>
                </div>

                <FormAlert msg={notificationMsg} />

                <div className="space-y-4">
                  {[
                    {
                      id: 'emailAlerts',
                      title: 'Email Security Alerts',
                      description: 'Receive notifications about critical login attempts and password modifications.',
                      icon: Mail,
                    },
                    {
                      id: 'pushNotifications',
                      title: 'Push Notifications',
                      description: 'Get real-time browser push alerts whenever a group bill is created or updated.',
                      icon: Smartphone,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = notifications[item.id as keyof typeof notifications];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-5 bg-muted/30 border border-border rounded-xl gap-4"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-lg bg-secondary text-secondary-foreground shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-base font-semibold">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                        </div>

                        {/* Switch Toggle */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isChecked}
                          onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            isChecked ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="pointer-events-none inline-block h-6 w-6 rounded-full bg-background shadow-lg ring-0"
                            style={{
                              x: isChecked ? 20 : 0,
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    Save Preferences
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}