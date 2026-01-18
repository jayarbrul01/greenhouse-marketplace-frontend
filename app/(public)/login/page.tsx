"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useLoginMutation, useFirebaseAuthMutation } from "@/store/api/auth.api";
import { setAccessToken, getAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const [firebaseAuth, { isLoading: isFirebaseLoading }] = useFirebaseAuthMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is already authenticated
    const token = getAccessToken();
    if (token) {
      // User is already logged in, redirect to home
      router.replace("/");
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Don't render the form if checking auth or if user is authenticated
  if (isCheckingAuth) {
    return (
      <Container className="max-w-md mx-auto px-4 sm:px-6">
        <Card>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Container>
    );
  }

  const handleGoogleSuccess = async (idToken: string, firebaseUser: { email: string; name?: string; emailVerified: boolean }) => {
    try {
      // Save/update user data in backend database using Firebase auth endpoint
      const result = await firebaseAuth({ 
        idToken
      }).unwrap();

      // Store the access token
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }

      toast.success("Signed in with Google successfully!");

      // Google emails are pre-verified, so go directly to profile
      dispatch(
        loginSuccess({
          user: { email: result.user.email, name: firebaseUser.name || result.user.email },
        })
      );
      router.push("/profile");
    } catch (err: any) {
      console.error("Google auth failed:", err);
      const errorMessage = err.data?.message || err.message || "Google sign-in failed. Please try again.";
      toast.error(errorMessage);
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
      toast.success("Logged in successfully!");
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push("/profile");
      }, 100);
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.data?.message || error.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  };

  return (
    <Container className="max-w-md mx-auto px-4 sm:px-6">
      <Card 
        className={`
          transition-all duration-500 ease-out
          ${isMounted 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 translate-y-4 scale-95"
          }
        `}
      >
        <div className="flex items-center justify-center">
          <Image
            src="/logo_2.png"
            alt={t("appName")}
            width={80}
            height={80}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            priority
            unoptimized
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
            {t("login")}
          </h2>
        </div>
        <div className="space-y-4">
          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
          >
            <label className="mb-1 block text-sm font-medium text-gray-300">{t("emailOrPhone")}</label>
            <Input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} />
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "200ms" : "0ms" }}
          >
            <label className="mb-1 block text-sm font-medium text-gray-300">{t("password")}</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "300ms" : "0ms" }}
          >
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
          </div>


          <p className="text-center text-sm text-gray-300">
            {t("dontHaveAccount")}{" "}
            <Link href="/signup" className="font-medium text-green-400 hover:text-green-300 hover:underline">
              {t("signUp")}
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">{t("orContinueWith")}</span>
            </div>
          </div>

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={(error) => toast.error(error.message || "Google sign-in failed")}
            isLoading={isFirebaseLoading}
          />
        </div>
      </Card>
    </Container>
  );
}
