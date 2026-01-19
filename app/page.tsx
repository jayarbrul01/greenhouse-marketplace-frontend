"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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

  // Fetch product counts for each category
  const equipmentCount = useGetAllPostsQuery({ category: t("equipmentCategory"), limit: 1 }, { skip: false });
  const jobsCount = useGetAllPostsQuery({ category: t("jobsCategory"), limit: 1 }, { skip: false });
  const packagingCount = useGetAllPostsQuery({ category: t("packagingMaterialCategory"), limit: 1 }, { skip: false });
  const farmingMachinesCount = useGetAllPostsQuery({ category: t("farmingMachinesCategory"), limit: 1 }, { skip: false });
  const freeStuffCount = useGetAllPostsQuery({ category: t("freeStuffCategory"), limit: 1 }, { skip: false });
  const consultationCount = useGetAllPostsQuery({ category: t("consultationCategory"), limit: 1 }, { skip: false });

  // Map category keys to their counts
  const categoryCounts: Record<string, number> = {
    equipmentCategory: equipmentCount.data?.total ?? 0,
    jobsCategory: jobsCount.data?.total ?? 0,
    packagingMaterialCategory: packagingCount.data?.total ?? 0,
    farmingMachinesCategory: farmingMachinesCount.data?.total ?? 0,
    freeStuffCategory: freeStuffCount.data?.total ?? 0,
    consultationCategory: consultationCount.data?.total ?? 0,
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(allCategoriesText);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Region options
  const allRegionsText = t("allRegions");
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
  const regionButtonRef = useRef<HTMLButtonElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (isLocationDropdownOpen && regionButtonRef.current && mounted) {
      const calculatePosition = () => {
        if (!regionButtonRef.current) return;
        
        const buttonRect = regionButtonRef.current.getBoundingClientRect();
        const spacing = 4; // mt-1 = 4px
        
        setDropdownPosition({
          top: buttonRect.bottom + spacing,
          left: buttonRect.left,
          width: buttonRect.width,
        });
      };

      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    } else {
      setDropdownPosition(null);
    }
  }, [isLocationDropdownOpen, mounted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLocationDropdownOpen && 
          !target.closest('.region-dropdown-container') && 
          !target.closest('.region-dropdown-portal')) {
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

  const handleRegionToggle = (region: string) => {
    if (region === allRegionsText) return;
    
    setSelectedRegions(prev => {
      const newRegions = prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region];
      
      setCurrentPage(1);
      // Automatically trigger search when region changes
      if (newRegions.length > 0 || searchQuery || selectedCategory !== allCategoriesText || minPrice || maxPrice) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
      
      return newRegions;
    });
  };

  const handleCategoryClick = (categoryLabel: string) => {
    router.push(`/products?category=${encodeURIComponent(categoryLabel)}`);
  };

  const handleTabChange = (categoryLabel: string) => {
    setSelectedCategory(categoryLabel);
    setCurrentPage(1);
    // Automatically trigger search when category changes (if not "All Categories" or if other filters are set)
    if (categoryLabel !== allCategoriesText) {
      setIsSearching(true);
    } else if (searchQuery || selectedRegions.length > 0 || minPrice || maxPrice) {
      // If "All Categories" but other filters exist, keep searching
      setIsSearching(true);
    } else {
      // If "All Categories" and no other filters, stop searching
      setIsSearching(false);
    }
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
      region?: string | string[];
      minPrice?: number;
      maxPrice?: number;
      page: number;
      limit: number;
    } = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };

    // Include search query if it exists and we're searching
    if (debouncedSearchQuery && isSearching) {
      params.q = debouncedSearchQuery;
    }

    // Include category if selected and not "All Categories"
    if (selectedCategory && selectedCategory !== allCategoriesText && isSearching) {
      params.category = selectedCategory;
    }

    // Include regions if selected
    if (selectedRegions.length > 0 && isSearching) {
      params.region = selectedRegions;
    }

    // Include min price if provided
    if (minPrice && isSearching) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) params.minPrice = min;
    }

    // Include max price if provided
    if (maxPrice && isSearching) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) params.maxPrice = max;
    }

    return params;
  }, [debouncedSearchQuery, isSearching, selectedCategory, selectedRegions, minPrice, maxPrice, currentPage, allCategoriesText]);

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
    <>
      {/* Hero Search Section with Background Image */}
      <div className="relative w-full min-h-[450px] sm:min-h-[500px] flex items-center justify-center mb-8 overflow-hidden rounded-b-3xl">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero_image.jpg)',
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"></div>
        </div>

        {/* Content Container */}
        <Container className="relative z-10 w-full">
          <div className="max-w-6xl mx-auto">
            {/* Hero Headline */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-2xl">
                {t("browseListings")}
              </h1>
              <p className="text-base sm:text-lg text-gray-200 font-medium">
                Search all products or browse by category
              </p>
            </div>

            {/* Search Interface Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden max-w-6xl mx-auto">
              {/* Category Tabs */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  {categoryTabs.map((category) => {
                    const isActive = selectedCategory === category.label;
                    return (
                      <button
                        key={category.key}
                        onClick={() => handleTabChange(category.label)}
                        className={`
                          px-6 py-3 text-sm sm:text-base font-semibold transition-all duration-200 border-b-2 whitespace-nowrap
                          ${
                            isActive
                              ? "bg-white border-green-600 text-gray-900"
                              : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50 border-transparent"
                          }
                        `}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search Options: Region, Price, Search Input and Button */}
              <div className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row gap-3 items-end">
                  {/* Region Multi-Select */}
                  <div className="flex-1 w-full lg:w-auto relative region-dropdown-container">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      {t("region")}
                    </label>
                    <button
                      ref={regionButtonRef}
                      type="button"
                      onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-left hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-gray-900"
                    >
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="flex-1 text-sm text-gray-900 truncate">
                        {selectedRegions.length === 0
                          ? allRegionsText
                          : selectedRegions.length === 1
                          ? selectedRegions[0]
                          : `${selectedRegions.length} ${t("region")}s selected`}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 w-full lg:w-auto">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      {t("priceRange")}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder={t("minPrice")}
                        value={minPrice}
                        onChange={(e) => {
                          setMinPrice(e.target.value);
                          setCurrentPage(1);
                          // Automatically trigger search when price changes
                          if (e.target.value || maxPrice || searchQuery || selectedCategory !== allCategoriesText || selectedRegions.length > 0) {
                            setIsSearching(true);
                          } else {
                            setIsSearching(false);
                          }
                        }}
                        min="0"
                        className="w-full hero-input"
                        style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
                      />
                      <span className="text-gray-500 font-medium">-</span>
                      <Input
                        type="number"
                        placeholder={t("maxPrice")}
                        value={maxPrice}
                        onChange={(e) => {
                          setMaxPrice(e.target.value);
                          setCurrentPage(1);
                          // Automatically trigger search when price changes
                          if (e.target.value || minPrice || searchQuery || selectedCategory !== allCategoriesText || selectedRegions.length > 0) {
                            setIsSearching(true);
                          } else {
                            setIsSearching(false);
                          }
                        }}
                        min="0"
                        className="w-full hero-input"
                        style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
                      />
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="flex-1 w-full lg:w-auto">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      {t("searchProducts")}
                    </label>
                    <Input
                      placeholder={t("searchProducts")}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                        // Automatically trigger search when query changes (after debounce)
                        if (e.target.value || selectedCategory !== allCategoriesText || selectedRegions.length > 0 || minPrice || maxPrice) {
                          setIsSearching(true);
                        } else {
                          setIsSearching(false);
                        }
                      }}
                      onKeyPress={handleKeyPress}
                      className="w-full hero-input"
                      style={{ backgroundColor: '#ffffff', color: '#111827', borderColor: '#d1d5db' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content Container */}
      <Container>

      {/* Search Results or Category Cards */}
      {isSearching && (selectedCategory !== allCategoriesText || debouncedSearchQuery || selectedRegions.length > 0 || minPrice || maxPrice) ? (
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
                setSelectedRegions([]);
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
            <div className="bg-black border border-gray-900/80 rounded-lg p-8 text-center">
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
            <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryOptions.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.label)}
                  className="group relative bg-black rounded-2xl shadow-2xl shadow-black/50 border border-gray-900/80 p-8 hover:shadow-green-500/20 hover:border-green-500/60 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
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
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                      {category.label}
                    </h3>
                    
                    {/* Product Count */}
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                        {categoryCounts[category.key] || 0} {categoryCounts[category.key] === 1 ? "product" : "products"}
                      </span>
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="mt-2 flex items-center gap-2 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <h2 className="text-2xl font-bold text-white">New Products</h2>
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
              <div className="bg-black border border-gray-900/80 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-400">
                  No products available yet.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Region Dropdown Portal */}
      {mounted && isLocationDropdownOpen && dropdownPosition && createPortal(
        <div
          ref={regionDropdownRef}
          className="fixed z-[10000] region-dropdown-portal bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto min-h-[120px]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="p-2">
            <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-200 mb-1">
              <input
                type="checkbox"
                checked={selectedRegions.length === regions.filter(reg => reg !== allRegionsText).length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRegions(regions.filter(reg => reg !== allRegionsText));
                  } else {
                    setSelectedRegions([]);
                  }
                  setCurrentPage(1);
                  // Automatically trigger search when region changes
                  if (e.target.checked || searchQuery || selectedCategory !== allCategoriesText || minPrice || maxPrice) {
                    setIsSearching(true);
                  } else {
                    setIsSearching(false);
                  }
                }}
                className="rounded border-gray-300 bg-white text-green-500 focus:ring-green-500 w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-900">
                {selectedRegions.length === regions.filter(reg => reg !== allRegionsText).length
                  ? "Deselect All"
                  : "Select All"}
              </span>
            </label>
            
            {regions.filter(reg => reg !== allRegionsText).map((reg) => (
              <label
                key={reg}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRegions.includes(reg)}
                  onChange={() => handleRegionToggle(reg)}
                  className="rounded border-gray-300 bg-white text-green-500 focus:ring-green-500 w-4 h-4"
                />
                <span className="text-sm text-gray-900">{reg}</span>
              </label>
            ))}
          </div>
        </div>,
        document.body
      )}
      </Container>
    </>
  );
}
