export const TILE_SIZE = 40;
export const NUMBER_EMOJI_TYPES = 7;
export const COLLISION_RADIUS = TILE_SIZE / 2;
export const ANIMATION_SPEED = 1000;

export const neighborsOffsets = [
  [
    [1, 0],
    [1, -1],
    [0, 1],
    [0, -1],
    [-1, 0],
    [-1, -1],
  ], // even
  [
    [1, 0],
    [1, 1],
    [0, 1],
    [0, -1],
    [-1, 0],
    [-1, 1],
  ], // odd
];
