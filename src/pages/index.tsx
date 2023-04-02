import React, { useEffect, useState, useRef } from "react";
import { gameContainerElementId } from "@/constants";

export default function Home() {
  const [game, setGame] = useState<Phaser.Game>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      const Phaser = await import("phaser");
      const { registerScenes } = await import("@/registerScenes");
      const { gameContainerElementId, SceneKeys } = await import("@/constants");
      const { DarkColor } = await import("@/consts/Colors");

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameContainerElementId,

        backgroundColor: DarkColor,
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 },
            debug: true,
          },
        },
      };

      const game = new Phaser.Game(config);

      registerScenes(game);
      game.scene.start(SceneKeys.Bootstrap);

      setGame(game);
      setReady(true);
    };

    if (!ready) initGame();

    return () => {
      setReady(false);
      setGame(undefined);
      game?.destroy(true);
    };
  }, []);
  return (
    <>
      <div id={gameContainerElementId}></div>
    </>
  );
}
