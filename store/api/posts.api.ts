import { api } from "./baseApi";

export type Post = {
  id: string;
  userId: string;
  title: string;
  information?: string;
  price?: number;
  region?: string;
  category?: string;
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
    phone?: string;
    phoneVerified?: boolean;
    emailVerified?: boolean;
    createdAt?: string;
    avatar?: string | null;
  };
};

export type CreatePostRequest = {
  title: string;
  information?: string;
  price?: number;
  region?: string;
  category?: string;
  image?: string;
  video?: string;
};

export type CreatePostResponse = {
  post: Post;
};

export type GetUserPostsQuery = {
  q?: string;
  page?: number;
  limit?: number;
};

export type GetUserPostsResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetAllPostsQuery = {
  q?: string;
  category?: string;
  region?: string | string[]; // Support single or multiple regions
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export type GetAllPostsResponse = {
  posts: (Post & {
    user?: {
      id: string;
      fullName: string | null;
      email: string;
    };
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetPostResponse = {
  post: Post;
};

export type UpdatePostRequest = {
  title?: string;
  information?: string;
  price?: number;
  region?: string;
  category?: string;
  image?: string;
  video?: string;
};

export type UpdatePostResponse = {
  post: Post;
};

export type UploadFileResponse = {
  url: string;
  path: string;
};

export const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponse, CreatePostRequest>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
      invalidatesTags: ["Posts", "Notifications"],
    }),
    getUserPosts: builder.query<GetUserPostsResponse, GetUserPostsQuery | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.q) searchParams.append("q", params.q);
          if (params.page) searchParams.append("page", params.page.toString());
          if (params.limit) searchParams.append("limit", params.limit.toString());
        }
        
        const queryString = searchParams.toString();
        return {
          url: `/posts${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Posts"],
    }),
    getPostsByUserId: builder.query<GetUserPostsResponse, { userId: string; q?: string; page?: number; limit?: number }>({
      query: ({ userId, q, page, limit }) => {
        const searchParams = new URLSearchParams();
        if (q) searchParams.append("q", q);
        if (page) searchParams.append("page", page.toString());
        if (limit) searchParams.append("limit", limit.toString());
        
        const queryString = searchParams.toString();
        return {
          url: `/posts/user/${userId}${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Posts"],
    }),
    getAllPosts: builder.query<GetAllPostsResponse, GetAllPostsQuery | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.q) searchParams.append("q", params.q);
          if (params.category) searchParams.append("category", params.category);
          if (params.region) {
            // Handle multiple regions - send as comma-separated string
            if (Array.isArray(params.region)) {
              searchParams.append("region", params.region.join(","));
            } else {
              searchParams.append("region", params.region);
            }
          }
          if (params.minPrice !== undefined) searchParams.append("minPrice", params.minPrice.toString());
          if (params.maxPrice !== undefined) searchParams.append("maxPrice", params.maxPrice.toString());
          if (params.page) searchParams.append("page", params.page.toString());
          if (params.limit) searchParams.append("limit", params.limit.toString());
        }
        
        const queryString = searchParams.toString();
        return {
          url: `/posts/all${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Posts"],
    }),
    getPost: builder.query<GetPostResponse, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "GET",
      }),
      providesTags: (result, error, postId) => [{ type: "Posts", id: postId }],
    }),
    updatePost: builder.mutation<UpdatePostResponse, { postId: string; data: UpdatePostRequest }>({
      query: ({ postId, data }) => ({
        url: `/posts/${postId}`,
        method: "PUT",
        body: data,
        headers: { "content-type": "application/json" },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Posts", id: postId },
        "Posts",
        "Notifications",
      ],
    }),
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Posts", "Notifications", "Wishlist"],
    }),
    uploadImage: builder.mutation<UploadFileResponse, FormData>({
      query: (formData) => ({
        url: "/upload/image",
        method: "POST",
        body: formData,
      }),
    }),
    uploadVideo: builder.mutation<UploadFileResponse, FormData>({
      query: (formData) => ({
        url: "/upload/video",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetUserPostsQuery,
  useGetPostsByUserIdQuery,
  useGetAllPostsQuery,
  useGetPostQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUploadImageMutation,
  useUploadVideoMutation,
} = postsApi;
