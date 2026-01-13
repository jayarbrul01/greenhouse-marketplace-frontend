"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Container } from "@/components/layout/Container";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAccessToken, getAccessToken } from "@/lib/auth";
import { logout, hydrateAuth } from "@/store/slices/auth.slice";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    // Hydrate auth state from localStorage on mount
    const token = getAccessToken();
    dispatch(hydrateAuth({ isAuthenticated: !!token }));
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-lg shadow-black/5">
      <Container className="flex h-18 sm:h-20 lg:h-24 items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-3 sm:gap-4 hover:opacity-80 transition-opacity duration-200 group"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt={t("appName")}
              width={64}
              height={64}
              className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain transition-transform duration-200 group-hover:scale-105"
              priority
              unoptimized
            />
          </div>
          <span className="font-bold text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hidden sm:inline-block">
            {t("appName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link 
            className="text-md font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group" 
            href="/listings"
          >
            {t("listings")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          {isAuthenticated && (
            <Link 
              className="text-md font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group" 
              href="/profile"
            >
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          )}
          {/* <Link 
            className="text-md font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group" 
            href="/dashboard"
          >
            {t("dashboard")}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
          </Link> */}

          <div className="h-6 w-px bg-gray-300"></div>

          <LanguageSelector
            value={language}
            onChange={setLanguage}
            size="md"
          />

          {!mounted ? (
            <Link href="/login">
              <Button size="md" className="shadow-md hover:shadow-lg transition-shadow">{t("login")}</Button>
            </Link>
          ) : isAuthenticated ? (
            <Button
              variant="outline"
              size="md"
              className="hover:bg-gray-50 transition-colors"
              onClick={() => {
                clearAccessToken();
                dispatch(logout());
                router.push("/login");
              }}
            >
              {t("logout")}
            </Button>
          ) : (
            <Link href="/login">
              <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">{t("login")}</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSelector
            value={language}
            onChange={setLanguage}
            size="sm"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-white/50 transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700 transition-transform duration-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-xl animate-in slide-in-from-top duration-300">
          <Container className="py-4 space-y-2">
            <Link
              href="/listings"
              className="block text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-white/50 rounded-lg px-3 py-2.5 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("listings")}
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className="block text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-white/50 rounded-lg px-3 py-2.5 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            <Link
              href="/dashboard"
              className="block text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-white/50 rounded-lg px-3 py-2.5 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("dashboard")}
            </Link>
            <div className="pt-3 border-t border-gray-200/50 mt-3">
              {!mounted ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full shadow-md" size="sm">{t("login")}</Button>
                </Link>
              ) : isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full hover:bg-gray-50"
                  size="sm"
                  onClick={() => {
                    clearAccessToken();
                    dispatch(logout());
                    router.push("/login");
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("logout")}
                </Button>
              ) : (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full shadow-md" size="sm">{t("login")}</Button>
                </Link>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
