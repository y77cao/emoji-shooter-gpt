import { NUMBER_EMOJI_TYPES, TILE_SIZE } from "./constants";
import { Tile } from "./Tile";
import { randRange } from "./utils";

export class Grid {
  x: number; // X position
  y: number; // Y position
  width: number; // Width, gets calculated
  height: number; // Height, gets calculated
  columns: number; // Number of tile columns
  rows: number; // Number of tile rows
  tileWidth: number = TILE_SIZE; // Visual width of a tile
  tileHeight: number = TILE_SIZE; // Visual height of a tile
  rowHeight: number = 32; // Height of a row
  tiles: Tile[][]; // The two-dimensional tile array

  constructor(x: number, y: number, columns: number, rows: number) {
    this.x = x;
    this.y = y;
    this.columns = columns;
    this.rows = rows;
    this.tiles = [];

    // Initialize the two-dimensional tile array
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        // Define a tile type and a shift parameter for animation
        row.push(new Tile(i, j, -1, 0));
      }
      this.tiles.push(row);
    }

    this.width = this.columns * this.tileWidth + this.tileWidth / 2;
    this.height = (this.rows - 1) * this.rowHeight + this.tileHeight;
  }

  init() {
    // Create a level with random tiles
    for (let i = 0; i < this.rows; i++) {
      var randomTile = randRange(0, NUMBER_EMOJI_TYPES - 1);
      var count = 0;
      for (let j = 0; j < this.columns; j++) {
        if (count >= 2) {
          // Change the random tile
          var newtile = randRange(0, NUMBER_EMOJI_TYPES - 1);

          // Make sure the new tile is different from the previous tile
          if (newtile == randomTile) {
            newtile = (newtile + 1) % NUMBER_EMOJI_TYPES;
          }
          randomTile = newtile;
          count = 0;
        }
        count++;

        if (i < this.rows / 2) {
          this.tiles[i][j].type = randomTile;
        } else {
          this.tiles[i][j].type = -1;
        }
      }
    }
  }

  render(context: CanvasRenderingContext2D) {
    // Top to bottom
    for (let i = 0; i < this.rows; ++i) {
      for (let j = 0; j < this.columns; ++j) {
        // Get the tile
        const tile = this.tiles[i][j];

        // Check if there is a tile present
        if (tile.type >= 0) {
          // Support transparency
          context.save();
          context.globalAlpha = tile.alpha;

          // Draw the tile using the color
          tile.render(context);

          context.restore();
        }
      }
    }
  }
}
