import React, { useEffect, useState, useRef } from "react";
import { Game } from "@/components/game/Game";
import { useDispatch, useSelector } from "react-redux";
import { preloaded } from "@/redux/appReducer";
import { getRandomEmojiNames, loadImage } from "@/utils";
import { NUMBER_EMOJI_TYPES } from "@/constants";
import { OpenAIClient } from "@/clients/openai";
import { RootState } from "@/redux/store";

export default function Home() {
  const dispatch = useDispatch();

  const app = useSelector((state: RootState) => state.app);

  const canvasRef = React.createRef<HTMLCanvasElement>();

  useEffect(() => {
    const preload = async () => {
      const emojiNames = getRandomEmojiNames(NUMBER_EMOJI_TYPES);
      const emojiPromises = emojiNames.map(async (name) => {
        const url = `https://emojiapi.dev/api/v1/${name}/40.png`;
        const image = await loadImage(url);
        return { name, image };
      });
      const emojiAssets = await Promise.all(emojiPromises);

      const openAIClient = new OpenAIClient();

      dispatch(preloaded({ assets: emojiAssets, openAIClient }));
      const canvas = canvasRef?.current as HTMLCanvasElement;
      const game = new Game(canvas);
      game.init();
    };
    preload();
  }, []);
  return (
    <>
      <div>
        <canvas ref={canvasRef} width="400" height="628" />
      </div>
      <div>{app.story}</div>
    </>
  );
}
