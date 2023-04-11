import React, { useEffect } from "react";
import { Game } from "@/components/game/Game";
import { useDispatch, useSelector } from "react-redux";
import { preloaded } from "@/redux/appReducer";
import { getRandomEmojiNames, loadImage } from "@/utils";
import { NUMBER_EMOJI_TYPES } from "@/constants";
import { OpenAIClient } from "@/clients/openai";
import { RootState } from "@/redux/store";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const dispatch = useDispatch();
  const [text, setText] = React.useState("");

  const app = useSelector((state: RootState) => state.app);

  useEffect(() => {
    if (!app.story.length) {
      setText("");
      return;
    }
    setText(app.story.map((s) => s.sentence).join(" "));
    // TODO typing effect not working properly
    // const words = app.story[app.story.length - 1]?.sentence.split(" ");
    // const timeouts: NodeJS.Timeout[] = [];
    // const typeWord = (word: string, i: number) =>
    //   setTimeout(() => setText(text + " " + word), i * 100);
    // words.reduce((prev, word, i) => {
    //   prev += word + " ";
    //   timeouts.push(typeWord(prev, i));
    //   return prev;
    // }, "");
    // return () => timeouts.forEach(clearTimeout);
  }, [app.story]);

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
      <div className={styles.titleContainer}>
        <div className={styles.title}>
          Let&apos;s play a game (with GPT-3). More specifically, you play the
          Emoji Shooter, and AI composes a story according to your game
          progress.
        </div>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.contentInnerContainer}>
          <div className={styles.canvasContainer}>
            <canvas ref={canvasRef} width="400" height="628" />
          </div>
          <textarea className={styles.storyContainer} value={text} />
        </div>
      </div>
    </>
  );
}
