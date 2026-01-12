"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useLoginMutation, useGoogleAuthMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CredentialResponse } from "@react-oauth/google";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential received from Google");
      return;
    }

    try {
      const res = await googleAuth({ idToken: credentialResponse.credential }).unwrap();
      setAccessToken(res.accessToken);
      dispatch(
        loginSuccess({
          user: { email: res.user.email, name: res.user.email },
        })
      );
      router.push("/dashboard");
    } catch (err) {
      console.error("Google auth failed:", err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await login({ emailOrPhone, password }).unwrap();
      setAccessToken(res.accessToken);
      dispatch(
        loginSuccess({
          user: { email: res.user.email, name: res.user.fullName },
        })
      );
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Container className="max-w-md">
      <Card title={t("login")}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("emailOrPhone")}</label>
            <Input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("password")}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button
            className="w-full"
            disabled={isLoading || !emailOrPhone || !password}
            onClick={handleLogin}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner /> {t("loggingIn")}
              </span>
            ) : (
              t("login")
            )}
          </Button>

          {error ? (
            <p className="text-sm text-red-600">
              Login failed. Check your credentials and `NEXT_PUBLIC_API_URL`.
            </p>
          ) : null}

          <p className="text-center text-sm text-gray-900">
            {t("dontHaveAccount")}{" "}
            <Link href="/signup" className="font-medium text-green-700 hover:underline">
              {t("signUp")}
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t("orContinueWith")}</span>
            </div>
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            isLoading={isGoogleLoading}
          />
        </div>
      </Card>
    </Container>
  );
}
