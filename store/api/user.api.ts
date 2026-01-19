import { api } from "./baseApi";

export type UserProfile = {
  id: string;
  email: string;
  phone: string;
  fullName: string | null;
  region: string | null;
  preferredLanguage: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  notifyInApp: boolean;
  avatar?: string | null;
  roles?: string[];
  createdAt: string;
};

export type UpdateProfileRequest = {
  fullName?: string;
  region?: string;
  preferredLanguage?: "en" | "es" | "fr";
  avatar?: string;
};

export type UpdatePreferencesRequest = {
  notifyEmail?: boolean;
  notifySms?: boolean;
  notifyInApp?: boolean;
};

export type UpdateRolesRequest = {
  roles: string[];
};

export type UpdateRolesResponse = {
  roles: string[];
  accessToken?: string;
  refreshToken?: string;
};

export type PublicUserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string | null;
};

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<{ user: PublicUserProfile }, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({
        url: "/users/me",
        method: "PUT",
        body,
        headers: { "content-type": "application/json" },
      }),
      invalidatesTags: ["User"],
    }),
    updatePreferences: builder.mutation<{ notifyEmail: boolean; notifySms: boolean; notifyInApp: boolean }, UpdatePreferencesRequest>({
      query: (body) => ({
        url: "/users/preferences",
        method: "PUT",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    updateRoles: builder.mutation<UpdateRolesResponse, UpdateRolesRequest>({
      query: (body) => ({
        url: "/users/roles",
        method: "PUT",
        body,
        headers: { "content-type": "application/json" },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetProfileQuery, useGetUserByIdQuery, useUpdateProfileMutation, useUpdatePreferencesMutation, useUpdateRolesMutation } = userApi;
