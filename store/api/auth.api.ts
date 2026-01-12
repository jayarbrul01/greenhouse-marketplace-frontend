import { api } from "./baseApi";

export type LoginRequest = {
  emailOrPhone: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: { email: string; fullName?: string };
};

export type RegisterRequest = {
  email: string;
  phone: string;
  password: string;
  roles: string[];
};

export type RegisterResponse = {
  user: { id: string; email: string; phone: string; roles: string[] };
  accessToken: string;
  refreshToken: string;
  devVerification?: { emailCode: string; phoneCode: string };
};

export type VerifyEmailRequest = {
  code: string;
};

export type VerifyEmailResponse = {
  ok: boolean;
};

export type GoogleAuthRequest = {
  idToken: string;
};

export type GoogleAuthResponse = {
  user: { id: string; email: string; phone: string; roles: string[] };
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    googleAuth: builder.mutation<GoogleAuthResponse, GoogleAuthRequest>({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifyEmailMutation, useGoogleAuthMutation } = authApi;
