import Phaser, { Scene } from "phaser";

import { SceneKeys } from "@/constants";
import GameEvents from "@/consts/GameEvents";

import { gameContainerElementId } from "@/constants";

const DPR = window.devicePixelRatio;

export default class Bootstrap extends Phaser.Scene {
  preload() {
    this.game.events.once(
      GameEvents.PreloadFinished,
      this.handlePreloadFinished,
      this
    );
  }

  create() {
    this.resize();

    this.scene.run(SceneKeys.Preload);

    const x = this.scale.width * 0.5;
    const y = this.scale.height * 0.5;

    this.add
      .text(x, y, "Loading...", {
        fontFamily: "Nosifer",
        fontSize: 24 * DPR,
      })
      .setOrigin(0.5, 0.5);
  }

  private handlePreloadFinished() {
    this.scene.stop(SceneKeys.Preload);
    console.log("preload finished");

    this.scene.start(SceneKeys.Game);
  }

  private resize() {
    const container = document.getElementById(gameContainerElementId)!;
    let w = container.clientWidth * window.devicePixelRatio;
    let h = container.clientHeight * window.devicePixelRatio;

    // this.scale.resize(w, h);
  }
}
