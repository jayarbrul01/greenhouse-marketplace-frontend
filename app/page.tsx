"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useGetAllPostsQuery } from "@/store/api/posts.api";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Pagination } from "@/components/marketplace/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";

const RECENT_PRODUCTS_LIMIT = 12;
const ITEMS_PER_PAGE = 12;

export default function HomePage() {
  const { t } = useLanguage();
  const router = useRouter();

  // Category options for tabs (including "All Categories")
  const allCategoriesText = t("allCategories");
  const categoryTabs = [
    { key: "allCategories", label: allCategoriesText },
    { key: "equipmentCategory", label: t("equipmentCategory") },
    { key: "jobsCategory", label: t("jobsCategory") },
    { key: "packagingMaterialCategory", label: t("packagingMaterialCategory") },
    { key: "farmingMachinesCategory", label: t("farmingMachinesCategory") },
    { key: "freeStuffCategory", label: t("freeStuffCategory") },
    { key: "consultationCategory", label: t("consultationCategory") },
  ];

  // Category options for cards (excluding "All Categories")
  const categoryOptions = [
    { key: "equipmentCategory", label: t("equipmentCategory"), icon: "🔧" },
    { key: "jobsCategory", label: t("jobsCategory"), icon: "💼" },
    { key: "packagingMaterialCategory", label: t("packagingMaterialCategory"), icon: "📦" },
    { key: "farmingMachinesCategory", label: t("farmingMachinesCategory"), icon: "🚜" },
    { key: "freeStuffCategory", label: t("freeStuffCategory"), icon: "🎁" },
    { key: "consultationCategory", label: t("consultationCategory"), icon: "💡" },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>(allCategoriesText);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Region options
  const allRegionsText = t("allRegions");
  const regions = [
    { value: "", label: allRegionsText },
    { value: t("northAmerica"), label: t("northAmerica") },
    { value: t("southAmerica"), label: t("southAmerica") },
    { value: t("europe"), label: t("europe") },
    { value: t("asia"), label: t("asia") },
    { value: t("africa"), label: t("africa") },
    { value: t("oceania"), label: t("oceania") },
  ];

  const handleCategoryClick = (categoryLabel: string) => {
    router.push(`/products?category=${encodeURIComponent(categoryLabel)}`);
  };

  const handleTabChange = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Build query params for search results
  const searchParams = useMemo(() => {
    const params: {
      q?: string;
      category?: string;
      region?: string;
      minPrice?: number;
      maxPrice?: number;
      page: number;
      limit: number;
    } = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    if (debouncedSearchQuery && isSearching) {
      params.q = debouncedSearchQuery;
    }

    if (selectedCategory && selectedCategory !== allCategoriesText) {
      params.category = selectedCategory;
    }

    if (selectedRegion) {
      params.region = selectedRegion;
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) params.minPrice = min;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) params.maxPrice = max;
    }

    return params;
  }, [debouncedSearchQuery, isSearching, selectedCategory, selectedRegion, minPrice, maxPrice, currentPage, allCategoriesText]);

  // Fetch search results only when searching
  const { data: searchResults, isLoading: isLoadingSearch } = useGetAllPostsQuery(
    isSearching ? searchParams : undefined,
    { skip: !isSearching }
  );

  // Fetch recent products (newest first, no filters)
  const recentProductsParams = useMemo(() => ({
    page: 1,
    limit: RECENT_PRODUCTS_LIMIT,
  }), []);

  const { data: recentProductsData, isLoading: isLoadingRecent } = useGetAllPostsQuery(recentProductsParams);

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-2">
          {t("browseListings")}
        </h1>
        <p className="text-gray-400">
          Search all products or browse by category
        </p>
      </div>

      {/* Main Search Block with Category Tabs */}
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 mb-8 overflow-hidden">
        {/* Category Tabs */}
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="flex flex-wrap">
            {categoryTabs.map((category) => {
              const isActive = selectedCategory === category.label;
              return (
                <button
                  key={category.key}
                  onClick={() => handleTabChange(category.label)}
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

        {/* Search Options: Region, Price, Search Input and Button */}
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            {/* Region Select */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("region")}
              </label>
              <Select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setIsSearching(false);
                }}
                className="w-full"
              >
                {regions.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Price Range */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("priceRange")}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t("minPrice")}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setIsSearching(false);
                  }}
                  min="0"
                  className="w-full"
                />
                <span className="text-gray-500 font-medium">-</span>
                <Input
                  type="number"
                  placeholder={t("maxPrice")}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setIsSearching(false);
                  }}
                  min="0"
                  className="w-full"
                />
              </div>
            </div>

            {/* Search Input */}
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("searchProducts")}
              </label>
              <Input
                placeholder={t("searchProducts")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(false);
                }}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap h-fit min-w-[120px]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t("search")}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results or Category Cards */}
      {isSearching && (debouncedSearchQuery || selectedRegion || minPrice || maxPrice) ? (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-100">
              Search Results
              {debouncedSearchQuery && `: "${debouncedSearchQuery}"`}
            </h2>
            <button
              onClick={() => {
                setIsSearching(false);
                setSearchQuery("");
                setSelectedRegion("");
                setMinPrice("");
                setMaxPrice("");
                setCurrentPage(1);
              }}
              className="text-gray-400 hover:text-gray-200 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              Clear Search
            </button>
          </div>

          {isLoadingSearch ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
              <span className="ml-3 text-sm text-gray-400">Searching products...</span>
            </div>
          ) : searchResults?.posts && searchResults.posts.length > 0 ? (
            <>
              <div className="mb-5 text-sm text-gray-400 font-medium">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, searchResults.total)} of {searchResults.total} products
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 mb-6">
                {searchResults.posts.map((post) => (
                  <ProductCard key={post.id} post={post} />
                ))}
              </div>
              {searchResults.totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={searchResults.totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-400">
                No products found matching your search criteria.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Category Cards Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryOptions.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.label)}
                  className="group relative bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-8 hover:shadow-2xl hover:border-green-500 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    
                    {/* Category Name */}
                    <h3 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-green-400 transition-colors">
                      {category.label}
                    </h3>
                    
                    {/* Arrow Icon */}
                    <div className="mt-4 flex items-center gap-2 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">View Products</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New Products Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">New Products</h2>
              <button
                onClick={() => router.push("/products")}
                className="text-green-400 hover:text-green-300 font-medium text-sm flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {isLoadingRecent ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
                <span className="ml-3 text-sm text-gray-400">Loading products...</span>
              </div>
            ) : recentProductsData?.posts && recentProductsData.posts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recentProductsData.posts.map((post) => (
                  <ProductCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-400">
                  No products available yet.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Container>
  );
}
