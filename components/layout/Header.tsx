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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-green-800/30 shadow-xl shadow-black/20 backdrop-blur-2xl">
      <Container className="flex h-24 sm:h-28 lg:h-32 items-center justify-between py-2">
        <Link 
          href="/" 
          className="flex items-center gap-4 sm:gap-5 hover:opacity-90 transition-all duration-300 group"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt={t("appName")}
              width={80}
              height={80}
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain transition-transform duration-300 group-hover:scale-110"
              priority
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl lg:text-3xl bg-gradient-to-r from-green-400 via-green-500 to-green-400 bg-clip-text text-transparent hidden sm:block tracking-tight">
              {t("appName")}
            </span>
            <span className="text-xs sm:text-sm text-gray-400 font-medium hidden sm:block mt-0.5">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link 
            className="text-base lg:text-lg font-semibold text-gray-300 hover:text-green-400 transition-all duration-300 relative group px-2 py-1" 
            href="/"
          >
            {t("home")}
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-green-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
          </Link>
          {isAuthenticated && (
            <Link 
              className="text-base lg:text-lg font-semibold text-gray-300 hover:text-green-400 transition-all duration-300 relative group px-2 py-1" 
              href="/profile"
            >
              Profile
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-green-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
            </Link>
          )}

          <div className="h-8 w-0.5 bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>

          <div className="flex items-center gap-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              size="md"
            />

            {!mounted ? (
              <Link href="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("login")}
                </Button>
              </Link>
            ) : isAuthenticated ? (
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-600 hover:border-green-500 hover:bg-gray-800 text-gray-300 hover:text-green-400 font-semibold px-6 py-3 transition-all duration-300"
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
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>
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
            className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 border border-gray-700"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-300 transition-transform duration-300"
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
        <div className="md:hidden border-t-2 border-green-800/30 bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-xl animate-in slide-in-from-top duration-300 shadow-lg">
          <Container className="py-6 space-y-3">
            <Link
              href="/"
              className="block text-base font-semibold text-gray-300 hover:text-green-400 hover:bg-gray-800 rounded-xl px-4 py-3 transition-all duration-300 border border-transparent hover:border-green-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t("home")}
              </span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/profile"
                className="block text-base font-semibold text-gray-300 hover:text-green-400 hover:bg-gray-800 rounded-xl px-4 py-3 transition-all duration-300 border border-transparent hover:border-green-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </span>
              </Link>
            )}
            <div className="pt-4 border-t-2 border-green-800/30 mt-4 space-y-3">
              <div className="px-4">
                <LanguageSelector
                  value={language}
                  onChange={setLanguage}
                  size="sm"
                />
              </div>
              {!mounted ? (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold shadow-lg" 
                    size="md"
                  >
                    {t("login")}
                  </Button>
                </Link>
              ) : isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-600 hover:border-green-500 hover:bg-gray-800 text-gray-300 hover:text-green-400 font-semibold"
                  size="md"
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
                  <Button 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold shadow-lg" 
                    size="md"
                  >
                    {t("login")}
                  </Button>
                </Link>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
