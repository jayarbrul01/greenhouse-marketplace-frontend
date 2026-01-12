"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useVerifyEmailMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";

function VerifyEmailContent() {
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [verifyEmail, { isLoading, error, isSuccess }] = useVerifyEmailMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get dev code and email from URL params (set after registration)
    const codeParam = searchParams.get("devCode");
    const emailParam = searchParams.get("email");
    if (codeParam) setDevCode(codeParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    if (isSuccess) {
      // After successful verification, redirect to dashboard
      router.push("/dashboard");
    }
  }, [isSuccess, router]);

  const handleSubmit = async () => {
    if (!code || code.length < 4) return;

    try {
      await verifyEmail({ code }).unwrap();
      // Token should already be set from registration, but ensure it's there
      const token = localStorage.getItem("accessToken");
      if (token) {
        dispatch(
          loginSuccess({
            user: { email: email || "user@example.com" },
          })
        );
      }
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <Container className="max-w-md">
      <Card title="Verify Your Email">
        <div className="space-y-4">
          <p className="text-sm text-gray-900">
            {email
              ? `We've sent a verification code to ${email}. Please enter it below.`
              : "Please enter the verification code sent to your email address."}
          </p>

          {devCode && (
            <div className="rounded-lg border-2 border-green-500 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-900 mb-2">Development Mode:</p>
              <p className="text-sm text-green-800 mb-2">Your verification code is:</p>
              <p className="text-2xl font-mono font-bold text-green-900 text-center">{devCode}</p>
              <p className="text-xs text-green-700 mt-2">(This is only shown in development)</p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Verification Code
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 6-digit code"
              maxLength={10}
              className="text-center text-2xl font-mono tracking-widest"
            />
          </div>

          <Button
            className="w-full"
            disabled={isLoading || !code || code.length < 4}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Verifying...
              </span>
            ) : (
              "Verify Email"
            )}
          </Button>

          {error ? (
            <p className="text-sm text-red-600">
              {("data" in error && typeof error.data === "object" && error.data !== null && "message" in error.data)
                ? String(error.data.message)
                : "Invalid verification code. Please try again."}
            </p>
          ) : null}

          <p className="text-center text-sm text-gray-900">
            Didn't receive a code?{" "}
            <Link href="/login" className="font-medium text-green-700 hover:underline">
              Go to Login
            </Link>
          </p>
        </div>
      </Card>
    </Container>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Container className="max-w-md">
        <Card title="Verify Your Email">
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
