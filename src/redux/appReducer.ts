import { WriteAction } from "@/constants";
import { getPrompt } from "@/utils";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assets: null,
  openAIClient: null,
  loading: false,
  story: "",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    preloaded: (state, action) => {
      state.assets = action.payload.assets;
      state.openAIClient = action.payload.openAIClient;
    },
    writeStoryRequest: (state) => {
      state.loading = true;
    },
    writeStorySuccess: (state, action) => {
      state.loading = false;
      state.story += `${action.payload}\n`;
    },
  },
});

export const { preloaded, writeStoryRequest, writeStorySuccess } =
  appSlice.actions;

export const writeStory =
  (emoji: string, action: WriteAction = WriteAction.CONTINUE) =>
  async (dispatch: any, getState: () => any) => {
    dispatch(writeStoryRequest());
    try {
      const state = getState();
      const { story, openAIClient } = state.app;
      const keyword = emoji.replace(/_/g, " ");
      const actualAction = story.length ? action : WriteAction.START;
      const prompt = getPrompt(keyword, actualAction);
      const text = story ? `${story}\n${prompt}` : prompt;
      console.log({ text });

      const completion = await openAIClient.complete(text);

      dispatch(writeStorySuccess(completion));
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

export default appSlice.reducer;
