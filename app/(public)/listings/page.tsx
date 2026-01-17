"use client";

import { useState, useMemo, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useGetAllPostsQuery } from "@/store/api/posts.api";
import { ListingFilters, type FilterState } from "@/components/marketplace/ListingFilters";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Pagination } from "@/components/marketplace/Pagination";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 12;

export default function ListingsPage() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    category: "All Categories",
    region: "All Regions",
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(filters.q, 500);

  // Build API query params
  const queryParams = useMemo(() => {
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

    if (debouncedSearchQuery) params.q = debouncedSearchQuery;
    if (filters.category && filters.category !== "All Categories") {
      params.category = filters.category;
    }
    if (filters.region && filters.region !== "All Regions") {
      params.region = filters.region;
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
  }, [debouncedSearchQuery, filters.category, filters.region, filters.minPrice, filters.maxPrice, currentPage]);

  // Reset to page 1 when debounced search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { data, isLoading, error } = useGetAllPostsQuery(queryParams);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleReset = () => {
    setFilters({
      q: "",
      category: "All Categories",
      region: "All Regions",
      minPrice: "",
      maxPrice: "",
    });
    setCurrentPage(1);
  };

  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / ITEMS_PER_PAGE);

  return (
    <Container>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">{t("listings")}</h1>

      <div className="flex flex-col lg:flex-row items-start gap-0">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ListingFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
          />
        </aside>

        {/* Vertical Divider */}
        <div className="hidden lg:block w-px bg-gray-200 mx-6 flex-shrink-0 self-stretch min-h-[400px]"></div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <Card>
              <div className="flex items-center justify-center py-12">
                <Spinner />
                <span className="ml-3 text-sm text-gray-600">Loading listings...</span>
              </div>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-sm text-red-600">
                Failed to load listings. Check backend + `NEXT_PUBLIC_API_URL`.
              </p>
            </Card>
          ) : data?.posts && data.posts.length > 0 ? (
            <>
              <div className="mb-5 text-sm text-gray-600 font-medium">
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
            <Card>
              <p className="text-sm text-gray-600 text-center py-8">
                No products found. Try adjusting your filters.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
