import { NUMBER_EMOJI_TYPES } from "@/constants";
import { store } from "@/redux/store";
import { TILE_SIZE } from "./constants";

export class Tile {
  type: number; // Tile type. -1 = empty, 0-6 = emoji
  shift: number; // Shift parameter for animation
  toBeRemoved: boolean = false; // Flag for removed tiles
  velocity: number = 0; // Velocity for animation
  alpha: number = 1; // Alpha value for animation
  processed: boolean = false; // Flag for processed tiles
  visible: boolean = true;

  constructor(type: number, shift: number) {
    this.type = type;
    this.shift = shift;
  }

  render(context: CanvasRenderingContext2D, x: number, y: number) {
    const state = store.getState();
    const { assets } = state.app;
    if (this.type < 0 || this.type >= NUMBER_EMOJI_TYPES) return;

    const asset = assets[this.type].image;
    context.drawImage(
      asset,
      0,
      0,
      TILE_SIZE,
      TILE_SIZE,
      x,
      y + this.shift,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}
