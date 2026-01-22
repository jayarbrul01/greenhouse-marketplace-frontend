import { api } from "./baseApi";

export type Advertisement = {
  id: string;
  userId?: string;
  businessName: string;
  contactEmail: string;
  contactPhone?: string;
  bannerUrl: string;
  websiteUrl?: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  clicks: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
  };
};

export type CreateAdvertisementRequest = {
  businessName: string;
  contactEmail: string;
  contactPhone?: string;
  bannerUrl: string;
  websiteUrl?: string;
  description?: string;
};

export type CreateAdvertisementResponse = {
  advertisement: Advertisement;
};

export type GetActiveAdvertisementsResponse = {
  advertisements: Advertisement[];
};

export type GetAllAdvertisementsResponse = {
  advertisements: Advertisement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const advertisementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAdvertisement: builder.mutation<CreateAdvertisementResponse, CreateAdvertisementRequest>({
      query: (data) => ({
        url: "/advertisements",
        method: "POST",
        body: data,
      }),
    }),
    getActiveAdvertisements: builder.query<GetActiveAdvertisementsResponse, void>({
      query: () => "/advertisements/active",
    }),
    getAllAdvertisements: builder.query<GetAllAdvertisementsResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/advertisements",
        method: "GET",
        params,
      }),
    }),
    trackAdView: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/advertisements/${id}/view`,
        method: "POST",
      }),
    }),
    trackAdClick: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/advertisements/${id}/click`,
        method: "POST",
      }),
    }),
    updateAdvertisement: builder.mutation<
      { advertisement: Advertisement },
      { id: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/advertisements/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Advertisements"],
    }),
  }),
});

export const {
  useCreateAdvertisementMutation,
  useGetActiveAdvertisementsQuery,
  useGetAllAdvertisementsQuery,
  useTrackAdViewMutation,
  useTrackAdClickMutation,
  useUpdateAdvertisementMutation,
} = advertisementsApi;
