import { api } from "./baseApi";

export type Listing = {
  id: string;
  title: string;
  type: string;
  category?: string | null;
  region?: string | null;
  price?: number | null;
  currency?: string | null;
};

export type ListingsResponse = {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListingsFilters = {
  q?: string;
  category?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export const listingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<ListingsResponse, ListingsFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.q) params.set("q", filters.q);
        if (filters.category) params.set("category", filters.category);
        if (filters.region) params.set("region", filters.region);
        if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
        if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
        if (filters.page) params.set("page", String(filters.page));
        if (filters.limit) params.set("limit", String(filters.limit));
        return `/listings?${params.toString()}`;
      },
    }),
  }),
});

export const { useGetListingsQuery } = listingsApi;
