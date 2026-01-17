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
  roles?: string[];
  createdAt: string;
};

export type UpdateProfileRequest = {
  fullName?: string;
  region?: string;
  preferredLanguage?: "en" | "es" | "fr";
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

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
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

export const { useGetProfileQuery, useUpdateProfileMutation, useUpdatePreferencesMutation, useUpdateRolesMutation } = userApi;
