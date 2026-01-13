"use client";

import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { useGetProfileQuery, useUpdateProfileMutation, useUpdatePreferencesMutation } from "@/store/api/user.api";
import { useCheckFirebasePhoneVerificationMutation } from "@/store/api/auth.api";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { data: profile, isLoading, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updatePreferences, { isLoading: isUpdatingPrefs }] = useUpdatePreferencesMutation();
  const [checkPhoneVerification] = useCheckFirebasePhoneVerificationMutation();
  
  // Phone verification state
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<"idle" | "sending" | "verifying">("idle");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "es" | "fr">("en");
  
  // Preferences state
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setRegion(profile.region || "");
      setPreferredLanguage(profile.preferredLanguage as "en" | "es" | "fr" || "en");
      setNotifyEmail(profile.notifyEmail);
      setNotifySms(profile.notifySms);
      setPhoneNumber(profile.phone || "");
    }
  }, [profile]);

  // Reset modal state when it closes
  useEffect(() => {
    if (!isPhoneModalOpen) {
      setPhoneVerificationStep("idle");
      setVerificationCode("");
      setConfirmationResult(null);
      // Clean up reCAPTCHA when modal closes
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    } else {
      // Reset phone number to current profile phone when modal opens
      setPhoneNumber(profile?.phone || "");
    }
  }, [isPhoneModalOpen, profile]);

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
      }).unwrap();
      toast.success("Preferences updated successfully!");
      refetch();
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || "Failed to update preferences.";
      toast.error(errorMessage);
    }
  };

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const handleOpenPhoneModal = () => {
    setPhoneNumber(profile?.phone || "");
    setIsPhoneModalOpen(true);
  };

  const handleSendPhoneVerification = async () => {
    if (!phoneNumber) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setPhoneVerificationStep("sending");
      
      // Clean up any existing verifier first
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (clearErr) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Wait for DOM to be ready and ensure container exists
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const container = document.getElementById("recaptcha-container-modal");
      if (!container) {
        throw new Error("reCAPTCHA container not found. Please try again.");
      }

      // Verify container is in the DOM
      if (!container.isConnected) {
        throw new Error("reCAPTCHA container not connected to DOM.");
      }

      // Create new RecaptchaVerifier
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container-modal", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try again.");
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
            } catch (err) {
              // Ignore cleanup errors
            }
            recaptchaVerifierRef.current = null;
          }
        },
      });

      // Wait a bit more for reCAPTCHA to initialize
      await new Promise(resolve => setTimeout(resolve, 100));

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifierRef.current
      );
      
      setConfirmationResult(confirmation);
      setPhoneVerificationStep("verifying");
      toast.success("Verification code sent to your phone!");
    } catch (err: any) {
      console.error("Phone verification error:", err);
      setPhoneVerificationStep("idle");
      
      // Clean up reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (clearErr) {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      let errorMessage = "Failed to send verification code. Please try again.";
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "Invalid phone number format. Please check your phone number.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (err.code === "auth/argument-error") {
        errorMessage = "reCAPTCHA error. Please close and reopen the modal, then try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!confirmationResult || !verificationCode) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      const result = await confirmationResult.confirm(verificationCode);
      const user = result.user;
      
      // Get ID token and sync with backend
      const idToken = await user.getIdToken(true);
      const verificationResult = await checkPhoneVerification({ idToken }).unwrap();
      
      toast.success(verificationResult.message || "Phone verified successfully!");
      
      // Close modal and refresh profile
      setIsPhoneModalOpen(false);
      refetch();
    } catch (err: any) {
      console.error("Phone code verification error:", err);
      
      let errorMessage = "Invalid verification code. Please try again.";
      if (err.code === "auth/invalid-verification-code") {
        errorMessage = "Invalid verification code. Please check and try again.";
      } else if (err.code === "auth/code-expired") {
        errorMessage = "Verification code expired. Please request a new one.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Card title={t("profile")}>
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
        <Card title={t("profile")}>
          <p className="text-sm text-red-600">Failed to load profile.</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <div className="space-y-6">
        {/* Profile Information */}
        <Card title={t("profileInformation")}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">{t("email")}</label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {profile.emailVerified ? (
                  <span className="text-green-600">✓ {t("emailVerified")}</span>
                ) : (
                  <span className="text-red-600">✗ {t("emailNotVerified")}</span>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">{t("phone")}</label>
              <div className="flex gap-2">
                <Input
                  type="tel"
                  value={profile.phone}
                  disabled
                  className="bg-gray-50 flex-1"
                />
                {!profile.phoneVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenPhoneModal}
                  >
                    {t("verifyPhone")}
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {profile.phoneVerified ? (
                  <span className="text-green-600">✓ {t("phoneVerified")}</span>
                ) : (
                  <span className="text-red-600">✗ {t("phoneNotVerified")}</span>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">{t("fullName")}</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("enterFullName")}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">{t("region")}</label>
              <Input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder={t("enterRegion")}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">{t("preferredLanguage")}</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as "en" | "es" | "fr")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="en">{t("english")}</option>
                <option value="es">{t("spanish")}</option>
                <option value="fr">{t("french")}</option>
              </select>
            </div>

            <Button
              className="w-full"
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <span className="flex items-center gap-2">
                  <Spinner /> {t("updating")}
                </span>
              ) : (
                t("updateProfile")
              )}
            </Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card title={t("notificationPreferences")}>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-gray-900">{t("emailNotifications")}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <span className="text-sm text-gray-900">{t("smsNotifications")}</span>
            </label>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleUpdatePreferences}
              disabled={isUpdatingPrefs}
            >
              {isUpdatingPrefs ? (
                <span className="flex items-center gap-2">
                  <Spinner /> {t("updating")}
                </span>
              ) : (
                t("updatePreferences")
              )}
            </Button>
          </div>
        </Card>

      </div>

      {/* Phone Verification Modal */}
      <Modal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        title={t("verifyPhoneNumber")}
      >
        <div className="space-y-4">
          {phoneVerificationStep === "idle" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-900">
                  {t("phoneNumber")}
                </label>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
                  className="w-full"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSendPhoneVerification}
                disabled={!phoneNumber}
              >
                {t("sendVerificationCode")}
              </Button>
            </>
          )}

          {phoneVerificationStep === "sending" && (
            <div className="flex flex-col items-center justify-center py-4">
              <Spinner />
              <p className="mt-2 text-sm text-gray-600">{t("sendingVerificationCode")}</p>
            </div>
          )}

          {phoneVerificationStep === "verifying" && (
            <>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  {t("enterVerificationCode")} {phoneNumber}
                </p>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={handleVerifyPhoneCode}
                  disabled={verificationCode.length < 6}
                >
                  {t("verifyCode")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneVerificationStep("idle");
                    setVerificationCode("");
                    setConfirmationResult(null);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </>
          )}

          {/* reCAPTCHA container (hidden, always rendered when modal is open) */}
          {isPhoneModalOpen && (
            <div 
              id="recaptcha-container-modal" 
              style={{ position: "absolute", left: "-9999px", visibility: "hidden" }}
              aria-hidden="true"
            ></div>
          )}
        </div>
      </Modal>
    </Container>
  );
}
