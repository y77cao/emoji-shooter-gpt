import {
  ANIMATION_SPEED,
  COLLISION_RADIUS,
  NUMBER_EMOJI_TYPES,
} from "./constants";
import { Grid } from "./Grid";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { degToRad, getMousePos, radToDeg, randRange } from "./utils";

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
  score: number = 0;
  state: State = State.INIT;
  round: number = 0;

  grid: Grid;
  player: Player;

  animationState: number = 0;
  lastFrame: number = 0;
  fpsTime: number = 0;
  frameCount: number = 0;
  fps: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    const grid = new Grid(4, 4, 9, 16);
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
      // Game is ready for player input
    } else if (this.state == State.SHOOT) {
      // Bubble is moving
      this.shootBubble(dt);
    }
  }

  shootBubble(dt: number) {
    // Bubble is moving

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
    let { x: newGridX, y: newGridY } = this.grid.getGridPosition(
      centerX,
      centerY
    );

    // Make sure the grid position is valid
    if (newGridX < 0) {
      newGridX = 0;
    }

    if (newGridX >= this.grid.columns) {
      newGridX = this.grid.columns - 1;
    }

    if (newGridY < 0) {
      newGridY = 0;
    }

    if (newGridY >= this.grid.rows) {
      newGridY = this.grid.rows - 1;
    }

    // Check if the tile is empty
    let addtile = false;
    if (this.grid.tiles[newGridX][newGridY].type != -1) {
      // Tile is not empty, shift the new tile downwards
      for (let newrow = newGridY + 1; newrow < this.grid.rows; newrow++) {
        if (this.grid.tiles[newGridX][newrow].type == -1) {
          newGridY = newrow;
          addtile = true;
          break;
        }
      }
    } else {
      addtile = true;
    }

    // // Add the tile to the grid
    // if (addtile) {
    //   // Hide the player bubble
    //   player.bubble.visible = false;

    //   // Set the tile
    //   this.grid.tiles[newGridX][newGridY].type = player.bubble.tiletype;

    //   // Check for game over
    //   if (checkGameOver()) {
    //     return;
    //   }

    //   // Find clusters
    //   cluster = findCluster(newGridX, newGridY, true, true, false);

    //   if (cluster.length >= 3) {
    //     // Remove the cluster
    //     setGameState(gamestates.removecluster);
    //     return;
    //   }
    // }

    // // No clusters found
    // turncounter++;
    // if (turncounter >= 5) {
    //   // Add a row of bubbles
    //   addBubbles();
    //   turncounter = 0;
    //   rowoffset = (rowoffset + 1) % 2;

    //   if (checkGameOver()) {
    //     return;
    //   }
    // }

    // Next bubble
    this.newBubble();
    this.setGameState(State.READY);
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
    this.context.fillStyle = "#e8eaec";
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
      //   this.context.fillStyle = "rgba(0, 0, 0, 0.8)";
      //   this.context.fillRect(
      //     0,
      //     0,
      //     this.grid.width + 8,
      //     this.grid.height + 2 * this.grid.tileHeight + 8 - yOffset
      //   );
      //   this.context.fillStyle = "#ffffff";
      //   this.context.font = "24px Verdana";
      //   drawCenterText(
      //     "Game Over!",
      //     this.grid.x,
      //     this.grid.y + this.grid.height / 2 + 10,
      //     this.grid.width
      //   );
      //   drawCenterText(
      //     "Click to start",
      //     this.grid.x,
      //     this.grid.y + this.grid.height / 2 + 40,
      //     this.grid.width
      //   );
    }
  }

  setGameState(state: State) {
    this.state = state;
    this.animationState = 0;
  }

  newGame() {
    // Reset score
    this.score = 0;
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
    this.player.bubble = newTile;
  }

  getRandTypeForPlayerBubble() {
    const usedTypes = Array.from(
      new Set(this.grid.tiles.flat().map((tile) => tile.type))
    );

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
