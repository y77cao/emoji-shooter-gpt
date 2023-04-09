import {
  COLLISION_RADIUS,
  neighborsOffsets,
  NUMBER_EMOJI_TYPES,
  TILE_SIZE,
} from "./constants";
import { Tile } from "./Tile";
import { circleIntersection, randRange } from "./utils";

type GridTile = {
  tile: Tile;
  row: number;
  column: number;
};
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
  clusterToBeRemoved: GridTile[] = []; // Array of tiles to be removed

  constructor(x: number, y: number, columns: number, rows: number) {
    this.x = x;
    this.y = y;
    this.columns = columns;
    this.rows = rows;
    this.tiles = [];

    this.width = this.columns * this.tileWidth + this.tileWidth / 2;
    this.height = (this.rows - 1) * this.rowHeight + this.tileHeight;
  }

  init() {
    // Create a level with random tiles
    for (let i = 0; i < this.rows; i++) {
      if (i < this.rows / 2) {
        this.tiles.push(this.generateRow());
      } else {
        this.tiles.push(this.generateRow(true));
      }
    }
  }

  addRowToTop() {
    this.tiles.unshift(this.generateRow());
    this.tiles.pop();
  }

  generateRow(empty = false): Tile[] {
    let randomType = randRange(0, NUMBER_EMOJI_TYPES - 1);
    let count = 0;
    const row = [];
    for (let i = 0; i < this.columns; i++) {
      if (empty) {
        row.push(new Tile(-1, 0));
        continue;
      }

      if (count >= 2) {
        // Change the random tile
        let newType = randRange(0, NUMBER_EMOJI_TYPES - 1);

        // Make sure the new tile is different from the previous tile
        if (newType == randomType) {
          newType = (newType + 1) % NUMBER_EMOJI_TYPES;
        }
        randomType = newType;
        count = 0;
      }
      count++;
      row.push(new Tile(randomType, 0));
    }

    return row;
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

  getClosestGridPosition(
    incomingX: number,
    incomingY: number
  ): { row: number; column: number } {
    let row = Math.floor((incomingY - this.y) / this.tileWidth);

    // Check for offset
    let xOffset = 0;
    if (row % 2) {
      xOffset = this.tileWidth / 2;
    }
    let column = Math.floor((incomingX - xOffset - this.x) / this.tileWidth);

    if (column < 0) {
      column = 0;
    }

    if (column >= this.columns) {
      column = this.columns - 1;
    }

    if (row < 0) {
      row = 0;
    }

    if (row >= this.rows) {
      row = this.rows - 1;
    }

    console.log({ column, row, xOffset, incomingX, incomingY });
    if (this.tiles[row][column].type !== -1) {
      // Tile is not empty, shift the new tile downwards
      for (let nextRow = row + 1; nextRow < this.rows; nextRow++) {
        if (this.tiles[nextRow][column].type === -1) {
          row = nextRow;
          break;
        }
      }
    }

    return { row, column };
  }

  resetProcessed() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.tiles[i][j].processed = false;
      }
    }
  }

  resetToBeRemoved() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.tiles[i][j].toBeRemoved = false;
      }
    }
  }

  findCluster(
    row: number,
    column: number,
    matchType = false,
    reset = true,
    skipRemoved = true
  ) {
    // Reset the processed flags
    if (reset) {
      this.resetProcessed();
    }

    const targetTile: GridTile = {
      tile: this.tiles[row][column],
      row,
      column,
    };

    const toProcess = [targetTile];
    const foundCluster = [];

    while (toProcess.length > 0) {
      const currentTile = toProcess.pop() as GridTile;
      currentTile.tile.processed = true;

      if (currentTile.tile.type == -1) {
        continue;
      }
      if (skipRemoved && currentTile.tile.toBeRemoved) {
        continue;
      }

      foundCluster.push(currentTile);

      const neighbors = this.getNeighbors(currentTile.row, currentTile.column);
      for (let i = 0; i < neighbors.length; i++) {
        if (
          !neighbors[i].tile.processed &&
          (!matchType || neighbors[i].tile.type == targetTile.tile.type)
        ) {
          toProcess.push(neighbors[i]);
        }
      }
      if (matchType) {
        console.log(
          `neighbors of (${currentTile.row}, ${currentTile.column}): ${neighbors
            .map((t) => `(${t.row}, ${t.column})`)
            .join(", ")}`
        );
        console.log(this.tiles);
      }
    }

    // Return the found cluster
    return foundCluster;
  }

  findFloatingClusters() {
    this.resetProcessed();

    const foundClusters = [];

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const tile = this.tiles[i][j];
        if (!tile.processed) {
          const cluster = this.findCluster(i, j, false, false, true);
          if (cluster.length <= 0) {
            continue;
          }

          if (this.isClusterFloating(cluster)) {
            foundClusters.push(cluster);
          }
        }
      }
    }

    return foundClusters;
  }

  isClusterFloating(cluster: GridTile[]) {
    for (let k = 0; k < cluster.length; k++) {
      if (cluster[k].row == 0) {
        return false;
      }
    }

    return true;
  }

  getNeighbors(row: number, column: number): GridTile[] {
    const neighbors = [];
    const offset = neighborsOffsets[row % 2];
    // Get the neighbors
    for (let i = 0; i < offset.length; i++) {
      // Neighbor coordinate
      const nr = row + offset[i][0];
      const nc = column + offset[i][1];

      // Make sure the tile is valid
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.columns) {
        neighbors.push({
          tile: this.tiles[nr][nc],
          row: nr,
          column: nc,
        });
      }
    }

    return neighbors;
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
