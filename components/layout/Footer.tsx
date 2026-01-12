"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm mt-auto">
      <Container className="py-4 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-4 sm:mb-6">
          {/* Brand Section */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-3 group">
              <Image
                src="/logo.png"
                alt={t("appName")}
                width={56}
                height={56}
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain transition-transform duration-200 group-hover:scale-105"
                unoptimized
              />
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                {t("appName")}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-600">
              Your trusted marketplace for greenhouse products, services, jobs, and buy requests.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/listings" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  {t("listings")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  {t("signUp")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/about" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs sm:text-sm text-gray-600 hover:text-green-700 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200/50 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            © {currentYear} {t("appName")}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
