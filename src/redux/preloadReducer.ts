import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: null,
  loading: false,
};

export const preloadSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    preloaded: (state, action) => {
      state.assets = action.payload;
    },
  },
});

export const { preloaded } = preloadSlice.actions;

export default preloadSlice.reducer;
