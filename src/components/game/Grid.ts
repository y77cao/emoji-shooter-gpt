import { COLLISION_RADIUS, NUMBER_EMOJI_TYPES, TILE_SIZE } from "./constants";
import { Tile } from "./Tile";
import { circleIntersection, randRange } from "./utils";

export class Grid {
  x: number; // X position
  y: number; // Y position
  width: number; // Width, gets calculated
  height: number; // Height, gets calculated
  columns: number; // Number of tile columns
  rows: number; // Number of tile rows
  tileWidth: number = TILE_SIZE; // Visual width of a tile
  tileHeight: number = TILE_SIZE; // Visual height of a tile
  rowHeight: number = 34; // Height of a row
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
        row.push(new Tile(-1, 0));
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

  getTileCoordinate(row: number, column: number): { x: number; y: number } {
    var tileX = column * TILE_SIZE;

    // X offset for odd or even rows
    if (row % 2) {
      tileX += TILE_SIZE / 2;
    }

    var tileY = row * TILE_SIZE;
    return { x: tileX, y: tileY };
  }

  hasCollision(incomingX: number, incomingY: number): boolean {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        var tile = this.tiles[i][j];

        // Skip empty tiles
        if (tile.type < 0) {
          continue;
        }

        // Check for intersections
        const { x, y } = this.getTileCoordinate(i, j);
        if (
          circleIntersection(
            incomingX + this.tileWidth / 2,
            incomingY + this.tileHeight / 2,
            COLLISION_RADIUS,
            x + this.tileWidth / 2,
            y + this.tileHeight / 2,
            COLLISION_RADIUS
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  getGridPosition(
    incomingX: number,
    incomingY: number
  ): { x: number; y: number } {
    var gridy = Math.floor((incomingY - this.y) / this.rowHeight);

    // Check for offset
    var xoffset = 0;
    if (gridy % 2) {
      xoffset = this.tileWidth / 2;
    }
    var gridx = Math.floor((incomingX - xoffset - this.x) / this.tileWidth);

    return { x: gridx, y: gridy };
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
          const { x, y } = this.getTileCoordinate(i, j);
          tile.render(context, x, y);

          context.restore();
        }
      }
    }
  }
}
