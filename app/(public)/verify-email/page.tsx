"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCheckFirebaseVerificationMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";

function VerifyEmailContent() {
  const [email, setEmail] = useState<string | null>(null);
  const [checkVerification, { isLoading: isChecking, data: verificationData }] = useCheckFirebaseVerificationMutation();
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  useEffect(() => {
    // Get email from URL params (set after registration)
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Check verification status when component mounts
  useEffect(() => {
    const checkStatus = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken(true); // Force refresh to get latest status
          await checkVerification({ idToken }).unwrap();
        } catch (err) {
          console.error("Failed to check verification:", err);
        }
      }
    };

    checkStatus();
  }, [checkVerification]);

  // Auto-redirect when verified
  useEffect(() => {
    if (verificationData?.emailVerified) {
      toast.success("Email verified successfully!");
      const token = localStorage.getItem("accessToken");
      if (token) {
        dispatch(
          loginSuccess({
            user: { email: email || "user@example.com" },
          })
        );
      }
      // Small delay to show success message
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  }, [verificationData, email, dispatch, router]);

  const handleCheckVerification = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Please log in first to check verification status.");
      return;
    }

    try {
      const idToken = await currentUser.getIdToken(true); // Force refresh
      const result = await checkVerification({ idToken }).unwrap();
      
      if (result.emailVerified) {
        toast.success("Email verified successfully!");
        const token = localStorage.getItem("accessToken");
        if (token) {
          dispatch(
            loginSuccess({
              user: { email: email || "user@example.com" },
            })
          );
        }
        router.push("/profile");
      } else {
        toast.error("Email not yet verified. Please check your email and click the verification link.");
      }
    } catch (err: any) {
      console.error("Check verification failed:", err);
      const errorMessage = err.data?.message || err.message || "Failed to check verification status. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        toast.success("Verification email sent! Please check your inbox and click the verification link.");
      } else if (currentUser?.emailVerified) {
        toast.success("Your email is already verified!");
      } else {
        toast.error("Please log in first to resend verification email.");
      }
    } catch (err: any) {
      console.error("Resend failed:", err);
      const errorMessage = err.message || "Failed to resend verification email. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container className="max-w-md mx-auto px-4 sm:px-6">
      <Card title={t("verifyEmail")}>
        <div className="space-y-4">
          <p className="text-sm text-gray-900">
            {email
              ? `We've sent a verification email to ${email}. Please check your inbox and click the verification link to verify your email address.`
              : "Please check your email and click the verification link to verify your email address."}
          </p>

          {verificationData?.emailVerified && (
            <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-900">
                ✓ Email verified successfully! Redirecting to profile...
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={isChecking}
              onClick={handleCheckVerification}
            >
              {isChecking ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Checking...
                </span>
              ) : (
                "Check Verification Status"
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              disabled={isResending}
              onClick={handleResend}
            >
              {isResending ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Sending...
                </span>
              ) : (
                "Resend Verification Email"
              )}
            </Button>

            <p className="text-center text-sm text-gray-900">
              {t("didntReceiveCode")}{" "}
              <Link href="/login" className="font-medium text-green-700 hover:underline">
                {t("goToLogin")}
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container className="max-w-md mx-auto px-4 sm:px-6">
        <Card title="Loading...">
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Container>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
