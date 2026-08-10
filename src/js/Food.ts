import type { Position } from './types.ts';

export class Food {
  public position: Position;

  constructor(position: Position) {
    this.position = position;
  }
}
