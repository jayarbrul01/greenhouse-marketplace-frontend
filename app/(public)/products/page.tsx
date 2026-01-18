"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useGetAllPostsQuery } from "@/store/api/posts.api";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Pagination } from "@/components/marketplace/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";
import { translations } from "@/lib/translations";

export type FilterState = {
  q: string;
  category: string;
  regions: string[];
  minPrice: string;
  maxPrice: string;
};

const ITEMS_PER_PAGE = 12;

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category and search query from URL query params
  const categoryFromUrl = searchParams.get("category") || "";
  const searchQueryFromUrl = searchParams.get("q") || "";
  
  // Get translated default values
  const allCategoriesText = t("allCategories");
  const allRegionsText = t("allRegions");
  
  const [filters, setFilters] = useState<FilterState>({
    q: searchQueryFromUrl,
    category: categoryFromUrl,
    regions: [],
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    const searchParam = searchParams.get("q") || "";
    if (categoryParam !== filters.category || searchParam !== filters.q) {
      setFilters(prev => ({ 
        ...prev, 
        category: categoryParam,
        q: searchParam,
      }));
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Update filters when language changes
  useEffect(() => {
    const newAllCategories = t("allCategories");
    const newAllRegions = t("allRegions");
    
    const allCategoryTranslations: string[] = [
      translations.en.allCategories,
      translations.es.allCategories,
      translations.fr.allCategories,
    ];
    const allRegionTranslations: string[] = [
      translations.en.allRegions,
      translations.es.allRegions,
      translations.fr.allRegions,
    ];
    
    const categoryKeys = [
      "allCategories",
      "equipmentCategory",
      "jobsCategory",
      "packagingMaterialCategory",
      "farmingMachinesCategory",
      "freeStuffCategory",
      "consultationCategory"
    ] as const;
    const regionKeys = ["allRegions", "northAmerica", "southAmerica", "europe", "asia", "africa", "oceania"] as const;
    
    setFilters(prev => {
      let newCategory = prev.category;
      for (const key of categoryKeys) {
        if (prev.category === translations.en[key] || 
            prev.category === translations.es[key] || 
            prev.category === translations.fr[key]) {
          newCategory = t(key);
          break;
        }
      }
      if (allCategoryTranslations.includes(prev.category)) {
        newCategory = newAllCategories;
      }
      
      const newRegions = prev.regions.map(region => {
        for (const key of regionKeys) {
          if (region === translations.en[key] || 
              region === translations.es[key] || 
              region === translations.fr[key]) {
            return t(key);
          }
        }
        return region;
      });
      
      return {
        ...prev,
        category: newCategory,
        regions: newRegions,
      };
    });
  }, [language, t]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(filters.q, 500);

  // Build API query params
  const queryParams = useMemo(() => {
    const params: {
      q?: string;
      category?: string;
      region?: string | string[];
      minPrice?: number;
      maxPrice?: number;
      page: number;
      limit: number;
    } = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (filters.category && filters.category !== "" && filters.category !== allCategoriesText) {
      params.category = filters.category;
    }
    if (filters.regions && filters.regions.length > 0) {
      params.region = filters.regions;
    }
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) params.minPrice = min;
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) params.maxPrice = max;
    }

    return params;
  }, [debouncedSearchQuery, filters.category, filters.regions, filters.minPrice, filters.maxPrice, currentPage, allCategoriesText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { data, isLoading, error } = useGetAllPostsQuery(queryParams);

  const handleChange = (field: keyof FilterState, value: string) => {
    setFilters({ ...filters, [field]: value });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      q: "",
      category: categoryFromUrl, // Keep the category from URL
      regions: [],
      minPrice: "",
      maxPrice: "",
    });
    setCurrentPage(1);
  };

  const handleRegionToggle = (region: string) => {
    setFilters(prev => {
      const newRegions = prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region];
      return {
        ...prev,
        regions: newRegions,
      };
    });
    setCurrentPage(1);
  };

  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  const regions = [
    allRegionsText,
    t("northAmerica"),
    t("southAmerica"),
    t("europe"),
    t("asia"),
    t("africa"),
    t("oceania"),
  ];

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLocationDropdownOpen && !target.closest('.region-dropdown-container')) {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isLocationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLocationDropdownOpen]);

  // Get page title based on search or category
  const pageTitle = filters.q 
    ? `Search: "${filters.q}"`
    : filters.category 
    ? filters.category 
    : allCategoriesText;

  return (
    <Container>
      <div className="mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">{t("home")}</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
          {pageTitle}
        </h1>
      </div>

      {/* Category Tabs */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8 overflow-visible">
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="flex flex-wrap">
            {[
              { key: "allCategories", label: allCategoriesText },
              { key: "equipmentCategory", label: t("equipmentCategory") },
              { key: "jobsCategory", label: t("jobsCategory") },
              { key: "packagingMaterialCategory", label: t("packagingMaterialCategory") },
              { key: "farmingMachinesCategory", label: t("farmingMachinesCategory") },
              { key: "freeStuffCategory", label: t("freeStuffCategory") },
              { key: "consultationCategory", label: t("consultationCategory") },
            ].map((category) => {
              const isActive = filters.category === category.label || 
                (category.key === "allCategories" && (!filters.category || filters.category === allCategoriesText));
              return (
                <button
                  key={category.key}
                  onClick={() => {
                    const newCategory = category.key === "allCategories" ? "" : category.label;
                    // Clear search query when selecting a category to show all products in that category
                    setFilters(prev => ({ 
                      ...prev, 
                      category: newCategory,
                      q: "" // Clear search query when category is selected
                    }));
                    setCurrentPage(1);
                    // Update URL to reflect category selection
                    const params = new URLSearchParams();
                    if (newCategory) {
                      params.set("category", newCategory);
                    }
                    router.push(`/products?${params.toString()}`, { scroll: false });
                  }}
                  className={`
                    px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap
                    ${
                      isActive
                        ? "bg-green-600 border-green-600 font-semibold"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-transparent"
                    }
                  `}
                  style={isActive ? { color: '#ffffff' } : { color: '#d1d5db' }}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 relative">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Region Multi-Select */}
            <div className="flex-1 w-full md:w-auto relative region-dropdown-container">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-left hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-300 truncate">
                    {filters.regions.length === 0
                      ? allRegionsText
                      : filters.regions.length === 1
                      ? filters.regions[0]
                      : `${filters.regions.length} ${t("region")}s selected`}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute z-[100] w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded cursor-pointer border-b border-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={filters.regions.length === regions.filter(reg => reg !== allRegionsText).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                regions: regions.filter(reg => reg !== allRegionsText),
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                regions: [],
                              }));
                            }
                            setCurrentPage(1);
                          }}
                          className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                        />
                        <span className="text-sm font-semibold text-gray-200">
                          {filters.regions.length === regions.filter(reg => reg !== allRegionsText).length
                            ? "Deselect All"
                            : "Select All"}
                        </span>
                      </label>
                      
                      {regions.filter(reg => reg !== allRegionsText).map((reg) => (
                        <label
                          key={reg}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={filters.regions.includes(reg)}
                            onChange={() => handleRegionToggle(reg)}
                            className="rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-300">{reg}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 w-full md:w-auto">
              <Input
                placeholder={t("searchProducts")}
                value={filters.q}
                onChange={(e) => handleChange("q", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Price Range Inputs */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={t("minPrice")}
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                min="0"
                className="w-28"
              />
              <span className="text-gray-400 font-medium">-</span>
              <Input
                type="number"
                placeholder={t("maxPrice")}
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                min="0"
                className="w-28"
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={() => {}}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 whitespace-nowrap"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("search")}
            </Button>
          </div>

          {/* Clear Filters */}
          {(filters.q || filters.regions.length > 0 || filters.minPrice || filters.maxPrice) && (
            <div className="mt-3">
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-green-400 transition-colors font-medium"
              >
                {t("clearAll")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Cards */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-3 text-sm text-gray-400">Loading listings...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
            <p className="text-sm text-red-400">
              Failed to load listings. Check backend + `NEXT_PUBLIC_API_URL`.
            </p>
          </div>
        ) : data?.posts && data.posts.length > 0 ? (
          <>
            <div className="mb-5 text-sm text-gray-400 font-medium">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, data.total)} of {data.total} products
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.posts.map((post) => (
                <ProductCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-sm text-gray-400">
              No products found in this category. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
