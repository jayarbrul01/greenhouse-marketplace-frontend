"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useRegisterMutation, useGoogleAuthMutation } from "@/store/api/auth.api";
import { setAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/slices/auth.slice";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import type { CredentialResponse } from "@react-oauth/google";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [register, { isLoading, error }] = useRegisterMutation();
  const [googleAuth, { isLoading: isGoogleLoading }] = useGoogleAuthMutation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      return;
    }
    if (roles.length === 0) {
      return;
    }

    try {
      const result = await register({ email, phone, password, roles }).unwrap();
      // Store the access token for verification endpoint (requires auth)
      if (result.accessToken) {
        setAccessToken(result.accessToken);
      }
      // Redirect to verification page with dev code (if available)
      const params = new URLSearchParams();
      if (result.devVerification?.emailCode) {
        params.set("devCode", result.devVerification.emailCode);
      }
      params.set("email", result.user.email);
      router.push(`/verify-email?${params.toString()}`);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

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

  return (
    <Container className="max-w-md">
      <Card title="Sign Up">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">Select Your Role(s)</label>
            <div className="space-y-2">
              {["BUYER", "SELLER", "WISHLIST"].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-600"
                  />
                  <span className="text-sm capitalize text-gray-900">{role.toLowerCase()}</span>
                </label>
              ))}
            </div>
            {roles.length === 0 && (
              <p className="mt-1 text-xs text-red-600">Please select at least one role</p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={
              isLoading ||
              !email ||
              !phone ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              roles.length === 0
            }
            onClick={handleSubmit}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Creating account...
              </span>
            ) : (
              "Sign Up"
            )}
          </Button>

          {error ? (
            <p className="text-sm text-red-600">
              {("data" in error && typeof error.data === "object" && error.data !== null && "message" in error.data)
                ? String(error.data.message)
                : "Sign up failed. Please try again."}
            </p>
          ) : null}

          <p className="text-center text-sm text-gray-900">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-green-700 hover:underline">
              Login
            </Link>
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
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
