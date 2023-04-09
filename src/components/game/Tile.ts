import { store } from "@/redux/store";
import { NUMBER_EMOJI_TYPES, TILE_SIZE } from "./constants";

export class Tile {
  row: number;
  column: number;
  type: number; // Tile type. -1 = empty, 0-6 = emoji
  shift: number; // Shift parameter for animation
  removed: boolean = false; // Flag for removed tiles
  velocity: number = 0; // Velocity for animation
  alpha: number = 1; // Alpha value for animation
  processed: boolean = false; // Flag for processed tiles
  visible: boolean = true;

  constructor(row: number, column: number, type: number, shift: number) {
    this.row = row;
    this.column = column;
    this.type = type;
    this.shift = shift;
  }

  getTileCoordinate(): { x: number; y: number } {
    var tileX = this.column * TILE_SIZE;

    // X offset for odd or even rows
    if (this.row % 2) {
      tileX += TILE_SIZE / 2;
    }

    var tileY = this.row * TILE_SIZE;
    return { x: tileX, y: tileY };
  }

  render(context: CanvasRenderingContext2D) {
    const state = store.getState();
    const { assets } = state.preload;
    if (this.type < 0 || this.type >= NUMBER_EMOJI_TYPES) return;

    const { x, y } = this.getTileCoordinate();
    console.log("rendering tile", {
      row: this.row,
      column: this.column,
      x,
      y,
      type: this.type,
    });
    context.drawImage(
      assets,
      this.type * TILE_SIZE,
      0,
      TILE_SIZE,
      TILE_SIZE,
      x,
      y,
      TILE_SIZE,
      TILE_SIZE
    );
  }
}
