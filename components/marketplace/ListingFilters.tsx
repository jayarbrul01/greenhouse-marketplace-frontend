"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export type FilterState = {
  q: string;
  category: string;
  region: string;
  minPrice: string;
  maxPrice: string;
};

type Props = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
};


export function ListingFilters({ filters, onFiltersChange, onReset }: Props) {
  const { t, language } = useLanguage();

  const handleChange = (field: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  // Get translated categories and regions
  const allCategoriesText = t("allCategories");
  const allRegionsText = t("allRegions");
  
  const categories = [
    allCategoriesText,
    t("equipmentCategory"),
    t("jobsCategory"),
    t("packagingMaterialCategory"),
    t("farmingMachinesCategory"),
    t("freeStuffCategory"),
    t("consultationCategory"),
  ];

  const regions = [
    allRegionsText,
    t("northAmerica"),
    t("southAmerica"),
    t("europe"),
    t("asia"),
    t("africa"),
    t("oceania"),
  ];

  const hasActiveFilters =
    filters.q ||
    (filters.category && filters.category !== allCategoriesText) ||
    (filters.region && filters.region !== allRegionsText) ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="lg:sticky lg:top-4 h-fit bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-0">{t("filters")}</h3>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-gray-500 hover:text-green-600 transition-colors font-medium"
            >
              {t("clearAll")}
            </button>
          )}
        </div>

        {/* Keyword Search */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            {t("search")}
          </label>
          <Input
            placeholder={t("searchProducts")}
            value={filters.q}
            onChange={(e) => handleChange("q", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            {t("category")}
          </label>
          <Select
            value={filters.category || allCategoriesText}
            onChange={(e) => handleChange("category", e.target.value)}
            className="text-sm w-full"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            {t("region")}
          </label>
          <Select
            value={filters.region || allRegionsText}
            onChange={(e) => handleChange("region", e.target.value)}
            className="text-sm w-full"
          >
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </Select>
        </div>

        {/* Price Range */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            {t("priceRange")}
          </label>
          <div className="space-y-3">
            <div>
              <Input
                type="number"
                placeholder={t("minPrice")}
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                className="text-sm"
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder={t("maxPrice")}
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                className="text-sm"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
