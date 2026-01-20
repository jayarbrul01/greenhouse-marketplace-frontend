import { api } from "./baseApi";
import { Post } from "./posts.api";

export interface WishlistItem {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  post: Post;
}

export interface GetWishlistResponse {
  items: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WishlistStatusResponse {
  [postId: string]: boolean;
}

export const wishlistApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addToWishlist: builder.mutation<WishlistItem, { postId: string }>({
      query: (body) => ({
        url: "/wishlist",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlist", "Posts"],
    }),

    removeFromWishlist: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/wishlist/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist", "Posts"],
    }),

    getWishlist: builder.query<GetWishlistResponse, { page?: number; limit?: number }>({
      query: ({ page, limit }) => {
        const searchParams = new URLSearchParams();
        if (page) searchParams.append("page", page.toString());
        if (limit) searchParams.append("limit", limit.toString());
        
        const queryString = searchParams.toString();
        return {
          url: `/wishlist${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Wishlist"],
    }),

    getWishlistStatus: builder.query<WishlistStatusResponse, string[]>({
      query: (postIds) => {
        const postIdsString = postIds.join(",");
        return {
          url: `/wishlist/status?postIds=${postIdsString}`,
          method: "GET",
        };
      },
      providesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWishlistQuery,
  useGetWishlistStatusQuery,
} = wishlistApi;
