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

// Mock categories and regions - these should come from API in production
const categories = [
  "All Categories",
  "Products",
  "Services",
  "Jobs",
  "Buy Requests",
];

const regions = [
  "All Regions",
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
];

export function ListingFilters({ filters, onFiltersChange, onReset }: Props) {
  const { t } = useLanguage();

  const handleChange = (field: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [field]: value });
  };

  const hasActiveFilters =
    filters.q ||
    (filters.category && filters.category !== "All Categories") ||
    (filters.region && filters.region !== "All Regions") ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <Card className="lg:sticky lg:top-4 h-fit">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="md"
              onClick={onReset}
              className="text-md text-gray-600 hover:text-green-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Keyword Search */}
        <div>
          <label className="mb-1 block text-md font-medium text-gray-700">
            Search
          </label>
          <Input
            placeholder="Search listings..."
            value={filters.q}
            onChange={(e) => handleChange("q", e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-1 block text-md font-medium text-gray-700">
            Category
          </label>
          <Select
            value={filters.category || "All Categories"}
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
          <label className="mb-1 block text-md font-medium text-gray-700">
            Region
          </label>
          <Select
            value={filters.region || "All Regions"}
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
          <label className="mb-1 block text-md font-medium text-gray-700">
            Price Range
          </label>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              className="text-sm"
              min="0"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              className="text-sm"
              min="0"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
