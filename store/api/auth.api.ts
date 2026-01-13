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

export type FirebaseAuthRequest = {
  idToken: string;
  phone?: string;
  roles?: string[];
};

export type FirebaseAuthResponse = {
  user: { id: string; email: string; phone: string; roles: string[]; emailVerified: boolean };
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
};

export type CheckFirebaseVerificationRequest = {
  idToken: string;
};

export type CheckFirebaseVerificationResponse = {
  emailVerified: boolean;
  message: string;
};

export type CheckFirebasePhoneVerificationRequest = {
  idToken: string;
};

export type CheckFirebasePhoneVerificationResponse = {
  phoneVerified: boolean;
  phoneNumber: string;
  message: string;
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
    firebaseAuth: builder.mutation<FirebaseAuthResponse, FirebaseAuthRequest>({
      query: (body) => ({
        url: "/auth/firebase",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    checkFirebaseVerification: builder.mutation<CheckFirebaseVerificationResponse, CheckFirebaseVerificationRequest>({
      query: (body) => ({
        url: "/auth/check-firebase-verification",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
    checkFirebasePhoneVerification: builder.mutation<CheckFirebasePhoneVerificationResponse, CheckFirebasePhoneVerificationRequest>({
      query: (body) => ({
        url: "/auth/check-firebase-phone-verification",
        method: "POST",
        body,
        headers: { "content-type": "application/json" },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifyEmailMutation, useGoogleAuthMutation, useFirebaseAuthMutation, useCheckFirebaseVerificationMutation, useCheckFirebasePhoneVerificationMutation } = authApi;
