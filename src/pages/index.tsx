import React, { useEffect, useState, useRef } from "react";
import { Game } from "@/components/game/Game";
import { useDispatch } from "react-redux";
import { preloaded } from "@/redux/preloadReducer";
import sprite from "./bubble-sprites.png";

export default function Home() {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  const canvasRef = React.createRef<HTMLCanvasElement>();

  useEffect(() => {
    const preload = async () => {
      const image = new Image();
      image.src = sprite.src;
      await image.decode();

      dispatch(preloaded(image));
      // Get the canvas and context
      const canvas = canvasRef?.current as HTMLCanvasElement;
      const game = new Game(canvas);
      game.init();
    };
    preload();
  }, []);
  return (
    <>
      <div>
        <canvas ref={canvasRef} width="628" height="628" />
      </div>
    </>
  );
}
