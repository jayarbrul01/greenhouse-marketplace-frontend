"use client";

import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "@/lib/firebase";
import { useAppSelector } from "@/store/hooks";
import { useRegisterFCMTokenMutation, notificationsApi } from "@/store/api/notifications.api";
import { store } from "@/store/index";
import toast from "react-hot-toast";

const VAPID_KEY = "BGbMFe6XjVP1qrYBvPeLgIgD2K_UCI1ucIcQlQsZF7uVTiZQDlTyGmfwRtibPikdC-CKtGpOiYaAd-gV6T6RjKc";

export function useFCM() {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [registerToken] = useRegisterFCMTokenMutation();

  useEffect(() => {
    if (typeof window === "undefined" || !messaging) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Request permission and get token
    const requestPermission = async () => {
      if (!messaging) {
        console.warn("Firebase Messaging is not available");
        return;
      }
      
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            setFcmToken(token);
            // Register token with backend if authenticated
            if (isAuthenticated) {
              try {
                await registerToken({ fcmToken: token }).unwrap();
              } catch (error) {
                console.error("Error registering FCM token:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    };

    // Listen for foreground messages
    if (messaging) {
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || "New notification";
        const body = payload.notification?.body || "";
        toast.success(`${title}${body ? `: ${body}` : ""}`);
        
        // Invalidate notifications cache to refetch unread count
        store.dispatch(
          notificationsApi.util.invalidateTags(["Notifications"])
        );
      });
    }

    if (isAuthenticated) {
      requestPermission();
    }
  }, [isAuthenticated, registerToken]);

  return { fcmToken, isSupported };
}
