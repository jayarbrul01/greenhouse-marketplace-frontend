"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { logout, hydrateAuth } from "@/store/slices/auth.slice";

export function Header() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hydrate auth state from localStorage on mount
    const token = getAccessToken();
    dispatch(hydrateAuth({ isAuthenticated: !!token }));
  }, [dispatch]);

  return (
    <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-3">
          <Link className="text-sm text-gray-700 hover:underline" href="/listings">
            Listings
          </Link>
          <Link className="text-sm text-gray-700 hover:underline" href="/dashboard">
            Dashboard
          </Link>

          {!mounted ? (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              onClick={() => {
                clearAccessToken();
                dispatch(logout());
                router.push("/login");
              }}
            >
              Logout
            </Button>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
}
