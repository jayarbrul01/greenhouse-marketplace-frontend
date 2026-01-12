import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import { api } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
