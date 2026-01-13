"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useGetProfileQuery, useUpdateProfileMutation, useUpdatePreferencesMutation } from "@/store/api/user.api";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updatePreferences, { isLoading: isUpdatingPrefs }] = useUpdatePreferencesMutation();

  // Form state
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "es" | "fr">("en");
  
  // Preferences state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setRegion(profile.region || "");
      setPreferredLanguage(profile.preferredLanguage as "en" | "es" | "fr" || "en");
      setNotifyEmail(profile.notifyEmail);
      setNotifySms(profile.notifySms);
      setNotifyInApp(profile.notifyInApp);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        fullName: fullName || undefined,
        region: region || undefined,
        preferredLanguage: preferredLanguage,
      }).unwrap();
      toast.success("Profile updated successfully!");
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update profile.";
      toast.error(errorMessage);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences({
        notifyEmail,
        notifySms,
        notifyInApp,
      }).unwrap();
      toast.success("Preferences updated successfully!");
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update preferences.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Card title="Profile">
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Card title="Profile">
          <p className="text-sm text-red-600">Failed to load profile.</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Profile Information */}
        <Card title="Profile Information">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">Email</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {profile.emailVerified ? (
                  <span className="text-green-600">✓ Email verified</span>
                ) : (
                  <span className="text-red-600">✗ Email not verified</span>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">Phone</label>
              <Input
                type="tel"
                value={profile.phone}
                disabled
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {profile.phoneVerified ? (
                  <span className="text-green-600">✓ Phone verified</span>
                ) : (
                  <span className="text-red-600">✗ Phone not verified</span>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">Full Name</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">Region</label>
              <Input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Enter your region"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as "en" | "es" | "fr")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <Button
              className="w-full"
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Updating...
                </span>
              ) : (
                "Update Profile"
              )}
            </Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card title="Notification Preferences">
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-gray-900">Email Notifications</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-gray-900">SMS Notifications</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-gray-900">In-App Notifications</span>
            </label>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleUpdatePreferences}
              disabled={isUpdatingPrefs}
            >
              {isUpdatingPrefs ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Updating...
                </span>
              ) : (
                "Update Preferences"
              )}
            </Button>
          </div>
        </Card>

      </div>
    </Container>
  );
}
