"use client";

import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  isLoading?: boolean;
}

export function GoogleLoginButton({ onSuccess, isLoading }: GoogleLoginButtonProps) {
  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {
          console.error("Google login failed");
        }}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        text="continue_with"
        width="100%"
      />
    </div>
  );
}
