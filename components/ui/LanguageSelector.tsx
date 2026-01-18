"use client";

import { SelectHTMLAttributes } from "react";
import type { Language } from "@/lib/translations";

type LanguageSelectorSize = "sm" | "md" | "lg";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "size"> & {
  value: Language;
  onChange: (lang: Language) => void;
  size?: LanguageSelectorSize;
};

const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
};

export function LanguageSelector({
  value,
  onChange,
  size = "md",
  className = "",
  ...props
}: Props) {
  const sizeValue: LanguageSelectorSize = size ?? "md";
  const sizes: Record<LanguageSelectorSize, { height: string; text: string; padding: string }> = {
    sm: { height: "h-9", text: "text-sm", padding: "px-3" },
    md: { height: "h-10", text: "text-sm", padding: "px-4" },
    lg: { height: "h-11", text: "text-base", padding: "px-5" },
  };

  const languageCodes: Record<Language, string> = {
    en: "EN",
    es: "ES",
    fr: "FR",
  };

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className={`
          ${sizes[sizeValue].height}
          ${sizes[sizeValue].padding}
          rounded-full
          appearance-none
          bg-gray-800
          border
          border-gray-600
          hover:border-gray-500
          focus:outline-none
          focus:ring-2
          focus:ring-green-500
          focus:border-green-500
          cursor-pointer
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
          text-transparent
          font-medium
          relative
          z-10
          min-w-fit
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='0' height='0'%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        <option value="en">{languageFlags.en} | {languageCodes.en}</option>
        <option value="es">{languageFlags.es} | {languageCodes.es}</option>
        <option value="fr">{languageFlags.fr} | {languageCodes.fr}</option>
      </select>
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center rounded-full z-0"
        aria-hidden="true"
      >
        <span 
          className={`
            ${sizes[sizeValue].text}
            leading-none
            flex
            items-center
            justify-center
            gap-1.5
            font-medium
            text-gray-100
          `}
        >
          <span>{languageFlags[value]}</span>
          <span className="text-gray-400">|</span>
          <span>{languageCodes[value]}</span>
        </span>
      </div>
    </div>
  );
}
