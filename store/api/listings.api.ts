import { api } from "./baseApi";

export type Listing = {
  id: string;
  title: string;
  type: string;
  region?: string | null;
  price?: number | null;
  currency?: string | null;
};

export type ListingsResponse = {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
};

export const listingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getListings: builder.query<ListingsResponse, { q?: string; page?: number }>({
      query: ({ q, page }) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (page) params.set("page", String(page));
        return `/listings?${params.toString()}`;
      },
    }),
  }),
});

export const { useGetListingsQuery } = listingsApi;
