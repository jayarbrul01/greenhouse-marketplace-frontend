import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  isAuthenticated: boolean;
  user: { email: string; name?: string } | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: AuthState["user"] }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
    },
    hydrateAuth: (state, action: PayloadAction<{ isAuthenticated: boolean }>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { loginSuccess, logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
