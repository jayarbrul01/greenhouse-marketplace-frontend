"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { useAppDispatch } from "@/store/hooks";
import { hydrateAuth } from "@/store/slices/auth.slice";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getAccessToken();
    if (token) {
      setIsAuthorized(true);
      dispatch(hydrateAuth({ isAuthenticated: true }));
    } else {
      setIsAuthorized(false);
      dispatch(hydrateAuth({ isAuthenticated: false }));
      router.replace("/login");
    }
  }, [dispatch, router]);

  if (!mounted) {
    return null; // Prevent flash of content before auth check
  }

  if (!isAuthorized) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}
