import { COLLISION_RADIUS, TILE_SIZE } from "./constants";
import { Tile } from "./Tile";
import { degToRad } from "./utils";

export class Player {
  x: number;
  y: number;
  bubbleX: number;
  bubbleY: number;
  angle: number = 90;
  bubbleAngle: number = 90;
  bubble: Tile;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.bubbleX = x;
    this.bubbleY = y;

    this.bubble = new Tile(0, 0);
  }

  setAngle(angle: number) {
    this.angle = angle;
    this.bubbleAngle = angle;
  }

  setBubble(bubble: Tile) {
    this.bubble = bubble;
    this.bubbleX = this.x;
    this.bubbleY = this.y;
  }

  render(context: CanvasRenderingContext2D) {
    const centerx = this.x + TILE_SIZE / 2;
    const centery = this.y + TILE_SIZE / 2;

    // Draw player background circle
    context.fillStyle = "#7a7a7a";
    context.beginPath();
    context.arc(centerx, centery, COLLISION_RADIUS + 12, 0, 2 * Math.PI, false);
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "#8c8c8c";
    context.stroke();

    // Draw the angle
    context.lineWidth = 2;
    context.strokeStyle = "#0000ff";
    context.beginPath();
    context.moveTo(centerx, centery);
    context.lineTo(
      centerx + 1.5 * TILE_SIZE * Math.cos(degToRad(this.angle)),
      centery - 1.5 * TILE_SIZE * Math.sin(degToRad(this.angle))
    );
    context.stroke();
    this.bubble.render(context, this.bubbleX, this.bubbleY);
  }
}
