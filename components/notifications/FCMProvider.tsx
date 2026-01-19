"use client";

import { useEffect } from "react";
import { useFCM } from "@/hooks/useFCM";

export function FCMProvider({ children }: { children: React.ReactNode }) {
  useFCM(); // Initialize FCM

  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return <>{children}</>;
}
