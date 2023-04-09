import { NUMBER_EMOJI_TYPES } from "./constants";
import { Grid } from "./Grid";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { getMousePos, radToDeg, randRange } from "./utils";

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

    const grid = new Grid(4, 4, 15, 14);
    const player = new Player(
      grid.x + grid.width / 2 - grid.tileWidth / 2,
      grid.y + grid.height
    );
    this.grid = grid;
    this.player = player;
  }

  init() {
    // Add mouse events
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mousedown", this.onMouseDown);

    // New game
    this.newGame();

    // Enter main loop
    window.requestAnimationFrame(this.main.bind(this));
    this.main(0);
  }

  // Main loop
  main(tframe: number) {
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
    var dt = (tframe - this.lastFrame) / 1000;
    this.lastFrame = tframe;

    this.updateFps(dt);

    if (this.state == State.READY) {
      // Game is ready for player input
    } else if (this.state == State.SHOOT) {
      // Bubble is moving
      // TODO stateShootBubble(dt);
    } else if (this.state == State.REMOVE) {
      // Remove cluster and drop tiles
      // TODO stateRemoveCluster(dt);
    }
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
    // this.player.render(this.context);

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

    // Create the level
    this.grid.init();

    // Init the next bubble and set the current bubble
    // nextBubble();
    this.newBubble();
  }

  newBubble() {
    const x = this.player.x;
    const y = this.player.y;
    const nextType = this.getRandTypeForPlayerBubble();
    const newTile = new Tile(x, y, nextType, 0);
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
    var pos = getMousePos(this.canvas, e);

    // Get the mouse angle
    var mouseAngle = radToDeg(
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
    var lbound = 8;
    var ubound = 172;
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
    this.player.angle = mouseAngle;
  }

  onMouseDown(e: MouseEvent) {
    // Get the mouse position
    var pos = getMousePos(this.canvas, e);

    if (this.state == State.READY) {
      // TODO shootBubble();
    } else if (this.state == State.OVER) {
      this.newGame();
    }
  }
}
