"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useRegisterMutation, useFirebaseAuthMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [register, { isLoading, error }] = useRegisterMutation();
  const [firebaseAuth, { isLoading: isFirebaseLoading }] = useFirebaseAuthMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch") || "Passwords do not match");
      return;
    }
    if (roles.length === 0) {
      toast.error(t("pleaseSelectRole") || "Please select at least one role");
      return;
    }

    try {
      // Step 1: Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Step 2: Send Firebase email verification
      if (!firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser);
      }

      // Step 3: Get ID token and save user data to backend database
      const idToken = await firebaseUser.getIdToken();
      const result = await firebaseAuth({ 
        idToken, 
        phone, 
        password,
        roles 
      }).unwrap();

      // Store the access token
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }

      toast.success("Account created successfully!");

      // If email is already verified, go to profile, otherwise go to verification page
      if (result.user.emailVerified) {
        dispatch(
          loginSuccess({
            user: { email: result.user.email, name: result.user.email },
          })
        );
        router.push("/profile");
      } else {
        // Redirect to verification page
        const params = new URLSearchParams();
        params.set("email", result.user.email);
        router.push(`/verify-email?${params.toString()}`);
      }
    } catch (err: any) {
      console.error("Firebase signup failed:", err.code);
      let errorMessage = "Sign up failed. Please try again.";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email is already registered. Please use login instead.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address. Please check your email.";
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleGoogleSuccess = async (idToken: string, firebaseUser: { email: string; name?: string; emailVerified: boolean }) => {
    try {

     // Save user data to backend database using Firebase auth endpoint
      const result = await firebaseAuth({ 
        idToken,
        roles: ["BUYER"] // Default role for Google signups
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

  const roleLabels: Record<string, string> = {
    BUYER: t("buyer"),
    SELLER: t("seller"),
    WISHLIST: t("wishlist"),
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("signUp")}
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
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("email")}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "150ms" : "0ms" }}
          >
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("phone")}</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
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
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("password")}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "250ms" : "0ms" }}
          >
            <label className="mb-1 block text-sm font-medium text-gray-900">{t("confirmPassword")}</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{t("passwordsDoNotMatch")}</p>
            )}
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 -translate-x-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "300ms" : "0ms" }}
          >
            <label className="mb-2 block text-sm font-medium text-gray-900">{t("selectRole")}</label>
            <div className="space-y-2">
              {["BUYER", "SELLER", "WISHLIST"].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <span className="text-sm text-gray-900">{roleLabels[role]}</span>
                </label>
              ))}
            </div>
            {roles.length === 0 && (
              <p className="mt-1 text-xs text-red-600">{t("pleaseSelectRole")}</p>
            )}
          </div>

          <div
            className={`
              transition-all duration-500 ease-out
              ${isMounted 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
              }
            `}
            style={{ transitionDelay: isMounted ? "400ms" : "0ms" }}
          >
            <Button
              className="w-full"
              disabled={
                isLoading ||
                isFirebaseLoading ||
                !email ||
                !phone ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                roles.length === 0
              }
              onClick={handleSubmit}
            >
            {isLoading || isFirebaseLoading ? (
              <span className="flex items-center gap-2">
                <Spinner /> {t("creatingAccount")}
              </span>
            ) : (
              t("signUp")
            )}
            </Button>
          </div>


          <p className="text-center text-sm text-gray-900">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-medium text-green-700 hover:underline">
              {t("login")}
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
            isLoading={isFirebaseLoading}
          />
        </div>
      </Card>
    </Container>
  );
}
