"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "@/store";
import { LanguageProvider } from "@/contexts/LanguageContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "216743925444-3lcjuuf86k79v0781fsnoo2p7j65h3fp.apps.googleusercontent.com";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <LanguageProvider>{children}</LanguageProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
