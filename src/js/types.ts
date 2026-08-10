export const Direction = {
  Up: 0,
  Right: 1,
  Down: 2,
  Left: 3,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

export type Dimensions = {
  width: number;
  height: number;
};

export type GameOptions = {
  dimensions: Dimensions;
  speedInitial: number;
  speedMinimum: number;
  speedStep: number;
  tileSize: number;
};

export type Position = {
  x: number;
  y: number;
};
