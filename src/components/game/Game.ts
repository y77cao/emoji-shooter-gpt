import { NUMBER_EMOJI_TYPES } from "@/constants";
import { writeStory } from "@/redux/appReducer";
import { store } from "@/redux/store";
import { randRange } from "@/utils";
import { ANIMATION_SPEED, TILE_SIZE } from "./constants";
import { Grid } from "./Grid";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { degToRad, drawCenterText, getMousePos, radToDeg } from "./utils";

enum State {
  INIT,
  READY,
  SHOOT,
  REMOVE,
  OVER,
}

export class Game {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  initialized: boolean = false;
  state: State = State.INIT;
  round: number = 0;

  grid: Grid;
  player: Player;

  lastFrame: number = 0;
  fpsTime: number = 0;
  frameCount: number = 0;
  fps: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    const grid = new Grid(10, 10, 9, 14);
    const player = new Player(
      grid.x + grid.width / 2 - grid.tileWidth / 2,
      grid.y + grid.height
    );
    this.grid = grid;
    this.player = player;
  }

  init() {
    // Add mouse events
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));

    // New game
    this.newGame();

    // Enter main loop
    this.main(0);
  }

  // Main loop
  main(tframe: number) {
    window.requestAnimationFrame(this.main.bind(this));
    // Request animation frames

    if (!this.initialized) {
      // Preloader

      // Clear the canvas
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw the frame
      this.drawFrame();

      this.initialized = true;
    } else {
      // Update and render the game
      this.update(tframe);
      this.render();
    }
  }

  // Update the game state
  update(tframe: number) {
    const dt = (tframe - this.lastFrame) / 1000;
    this.lastFrame = tframe;

    this.updateFps(dt);

    if (this.state == State.READY) {
      // noop
    } else if (this.state == State.SHOOT) {
      // Bubble is moving
      this.shootBubble(dt);
    } else if (this.state == State.REMOVE) {
      this.removeCluster(dt);
    }
  }

  shootBubble(dt: number) {
    // Move the bubble in the direction of the mouse
    this.player.bubbleX +=
      dt * ANIMATION_SPEED * Math.cos(degToRad(this.player.bubbleAngle));
    this.player.bubbleY +=
      dt * ANIMATION_SPEED * -1 * Math.sin(degToRad(this.player.bubbleAngle));

    // Handle left and right collisions with the this.grid
    if (this.player.bubbleX <= this.grid.x) {
      // Left edge
      this.player.bubbleAngle = 180 - this.player.bubbleAngle;
      this.player.bubbleX = this.grid.x;
    } else if (
      this.player.bubbleX + this.grid.tileWidth >=
      this.grid.x + this.grid.width
    ) {
      // Right edge
      this.player.bubbleAngle = 180 - this.player.bubbleAngle;
      this.player.bubbleX = this.grid.x + this.grid.width - this.grid.tileWidth;
    }

    // Collisions with the top of the this.grid
    if (this.player.bubbleY <= this.grid.y) {
      // Top collision
      this.player.bubbleY = this.grid.y;
      this.snapBubble();
      return;
    }

    if (this.grid.hasCollision(this.player.bubbleX, this.player.bubbleY)) {
      // Collision with another bubble
      this.snapBubble();
    }
  }

  snapBubble() {
    // Get the grid position
    const centerX = this.player.bubbleX + this.grid.tileWidth / 2;
    const centerY = this.player.bubbleY + this.grid.tileHeight / 2;
    let { row, column } = this.grid.getClosestGridPosition(centerX, centerY);

    // Hide the player bubble
    this.player.bubble.visible = false;

    // Set the tile
    this.grid.tiles[row][column].type = this.player.bubble.type;

    // Check for game over
    if (this.isGameOver()) {
      return;
    }

    // Find clusters
    const cluster = this.grid.findCluster(row, column, true, true, false);

    if (cluster.length >= 3) {
      cluster.forEach((gridTile) => (gridTile.tile.toBeRemoved = true));
      this.grid.clusterToBeRemoved = cluster;
      this.setGameState(State.REMOVE);

      const state = store.getState();
      const clusterType = cluster[0].tile.type;
      const { assets } = state.app;
      console.log(cluster[0].tile.type, assets);
      const emojiName = assets[clusterType].name;
      store.dispatch(writeStory(emojiName));

      return;
    }

    this.round++;
    if (this.round >= 5) {
      // Add two rows to the top
      this.grid.addRowToTop();
      this.grid.addRowToTop();
      this.round = 0;
    }

    if (this.isGameOver()) {
      return;
    }

    // Next bubble
    this.newBubble();
    this.setGameState(State.READY);
  }

  removeCluster(dt: number) {
    // Find floating clusters
    const floatingClusters = this.grid.findFloatingClusters();
    const cluster = this.grid.clusterToBeRemoved;

    // Pop bubbles
    let tilesLeft = false;
    for (let i = 0; i < cluster.length; i++) {
      const tile = cluster[i].tile;

      if (tile.type >= 0) {
        tilesLeft = true;

        // Alpha animation
        tile.alpha -= dt * 8;
        if (tile.alpha < 0) {
          tile.alpha = 0;
        }

        if (tile.alpha == 0) {
          tile.type = -1;
          tile.alpha = 1;
        }
      }
    }

    // Drop bubbles
    for (let i = 0; i < floatingClusters.length; i++) {
      for (let j = 0; j < floatingClusters[i].length; j++) {
        const { tile, row, column } = floatingClusters[i][j];

        if (tile.type >= 0) {
          tilesLeft = true;

          // Accelerate dropped tiles
          tile.velocity += dt * 1200;
          tile.shift += dt * tile.velocity;

          // Alpha animation
          tile.alpha -= dt * 3;
          if (tile.alpha < 0) {
            tile.alpha = 0;
          }

          // Check if the bubbles are past the bottom of the level
          if (
            tile.alpha == 0 ||
            row * TILE_SIZE + tile.shift >
              (this.grid.rows - 1) * TILE_SIZE + TILE_SIZE
          ) {
            tile.type = -1;
            tile.shift = 0;
            tile.alpha = 1;
          }
        }
      }
    }

    if (!tilesLeft) {
      // Next bubble
      this.newBubble();

      // Check for game over
      let tileFound = false;
      for (var i = 0; i < this.grid.rows; i++) {
        for (var j = 0; j < this.grid.columns; j++) {
          if (this.grid.tiles[i][j].type != -1) {
            tileFound = true;
            break;
          }
        }
      }

      this.grid.resetToBeRemoved();
      this.grid.clusterToBeRemoved = [];
      if (tileFound) {
        this.setGameState(State.READY);
      } else {
        this.setGameState(State.OVER);
      }
    }
  }

  isGameOver() {
    const lastRowNonEmpty = this.grid.tiles[this.grid.tiles.length - 1].some(
      (t) => t.type !== -1
    );

    if (lastRowNonEmpty) {
      // Game over
      this.setGameState(State.OVER);
      return true;
    }

    return false;
  }

  updateFps(dt: number) {
    if (this.fpsTime > 0.25) {
      // Calculate fps
      this.fps = Math.round(this.frameCount / this.fpsTime);

      // Reset time and framecount
      this.fpsTime = 0;
      this.frameCount = 0;
    }

    // Increase time and framecount
    this.fpsTime += dt;
    this.frameCount++;
  }

  drawFrame() {
    // Draw background
    this.context.fillStyle = "#efe8ff";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    // Draw the frame around the game
    this.drawFrame();

    // Render tiles
    this.grid.render(this.context);

    // Render player bubble
    this.player.render(this.context);

    // Game Over overlay
    if (this.state === State.OVER) {
      this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = "#ffffff";
      this.context.font = "12px Verdana";
      drawCenterText(
        this.context,
        "Story is over. Check it out ->",
        this.grid.x,
        this.grid.y + this.grid.height / 2 + 10,
        this.grid.width
      );
      drawCenterText(
        this.context,
        "Click to re-write",
        this.grid.x,
        this.grid.y + this.grid.height / 2 + 40,
        this.grid.width
      );
    }
  }

  setGameState(state: State) {
    this.state = state;
  }

  newGame() {
    // Reset score
    this.round = 0;

    // Set the gamestate to ready
    this.setGameState(State.READY);

    // Create the this.grid
    this.grid.init();

    // Init the next bubble and set the current bubble

    this.newBubble();
  }

  newBubble() {
    const nextType = this.getRandTypeForPlayerBubble();
    const newTile = new Tile(nextType, 0);
    this.player.setBubble(newTile);
  }

  getRandTypeForPlayerBubble() {
    const usedTypes = Array.from(
      new Set(this.grid.tiles.flat().map((tile) => tile.type))
    ).filter((type) => type !== -1);

    if (usedTypes.length > 0) {
      return usedTypes[randRange(0, usedTypes.length - 1)];
    }

    return randRange(0, NUMBER_EMOJI_TYPES - 1);
  }

  // On mouse movement
  onMouseMove(e: MouseEvent) {
    // Get the mouse position
    const pos = getMousePos(this.canvas, e);

    // Get the mouse angle
    let mouseAngle = radToDeg(
      Math.atan2(
        this.player.y + this.grid.tileHeight / 2 - pos.y,
        pos.x - (this.player.x + this.grid.tileWidth / 2)
      )
    );

    // Convert range to 0, 360 degrees
    if (mouseAngle < 0) {
      mouseAngle = 180 + (180 + mouseAngle);
    }

    // Restrict angle to 8, 172 degrees
    const lbound = 8;
    const ubound = 172;
    if (mouseAngle > 90 && mouseAngle < 270) {
      // Left
      if (mouseAngle > ubound) {
        mouseAngle = ubound;
      }
    } else {
      // Right
      if (mouseAngle < lbound || mouseAngle >= 270) {
        mouseAngle = lbound;
      }
    }

    // Set the player angle
    this.player.setAngle(mouseAngle);
  }

  onMouseDown(e: MouseEvent) {
    if (this.state == State.READY) {
      this.setGameState(State.SHOOT);
    } else if (this.state == State.OVER) {
      this.newGame();
    }
  }
}
