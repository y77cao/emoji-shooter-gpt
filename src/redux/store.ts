import { configureStore } from "@reduxjs/toolkit";
import preloadReducer from "./preloadReducer";

export const store = configureStore({
  reducer: {
    preload: preloadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type
export type AppDispatch = typeof store.dispatch;
