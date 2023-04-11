import { OpenAIClient } from "@/clients/openai";
import { WriteAction } from "@/constants";
import { getPrompt } from "@/utils";
import { createSlice } from "@reduxjs/toolkit";

type AppState = {
  assets: { name: string; image: HTMLImageElement }[];
  openAIClient?: OpenAIClient;
  loading: boolean;
  story: { sentence: string; prompt: string }[];
};

const initialState: AppState = {
  assets: [],
  loading: false,
  story: [],
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
      state.story = [...state.story, action.payload];
    },
    resetStory: (state) => {
      state.story = [];
    },
  },
});

export const { preloaded, writeStoryRequest, writeStorySuccess, resetStory } =
  appSlice.actions;

export const writeStory =
  (emoji: string, action: WriteAction = WriteAction.CONTINUE) =>
  async (dispatch: any, getState: () => any) => {
    dispatch(writeStoryRequest());
    try {
      const state = getState();
      const { story, openAIClient } = state.app as AppState;
      const keyword = emoji.replace(/_/g, " ");
      const actualAction = story.length ? action : WriteAction.START;
      const prompt = getPrompt(keyword, actualAction);
      const prevContext = story
        .map((s) => [s.prompt, s.sentence])
        .flat()
        .join(" ");
      const text = prevContext.length ? `${prevContext} ${prompt}` : prompt;

      let completion = await openAIClient?.complete(text);
      if (completion?.includes(prompt)) {
        completion = completion.split(prompt)[1];
      }

      dispatch(writeStorySuccess({ prompt, sentence: completion?.trim() }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

export default appSlice.reducer;
