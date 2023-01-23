export enum Direction {
  Up,
  Right,
  Down,
  Left,
}

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
