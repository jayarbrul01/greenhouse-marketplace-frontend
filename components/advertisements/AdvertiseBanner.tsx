"use client";

import { useState } from "react";
import { AdSubmissionForm } from "./AdSubmissionForm";
import { useLanguage } from "@/contexts/LanguageContext";

export function AdvertiseBanner() {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold text-sm"
          aria-label={t("advertiseHere") || "Advertise Here"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span>{t("advertiseHere") || "Advertise Here - Free"}</span>
        </button>
      </div>
      <AdSubmissionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </>
  );
}
