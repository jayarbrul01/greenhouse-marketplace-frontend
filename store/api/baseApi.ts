import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessToken } from "@/lib/auth";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Posts", "User", "Listings", "Notifications", "Wishlist"],
  endpoints: () => ({}),
});
