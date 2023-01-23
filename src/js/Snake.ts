import { Food } from './Food';
import { Dimensions, Direction, Position } from './types';
import { isEqualPosition, isOpposingDirections, translatePosition } from './utils';

export class Snake {
  public direction: Direction | null = null;
  private hasEaten: boolean = false;
  public position: Position[];

  constructor(position: Position) {
    this.position = [position];
  }

  public changeDirection(direction: Direction) {
    // Snake can change direction when
    if (
      this.direction === null || // It is not currently moving in any direction
      !isOpposingDirections(direction, this.direction) // Will not change direction back on to itself
    ) {
      this.direction = direction;

      return true;
    }

    return false;
  }

  public eat() {
    this.hasEaten = true;
  }

  public isCollidedWithFood(food: Food) {
    const headPosition = this.position[0];
    const foodPosition = food.position;

    return isEqualPosition(headPosition, foodPosition);
  }

  public isCollidedWithTail() {
    const headPosition = this.position[0];
    const tailPositions = this.position.slice(1, this.position.length);

    return tailPositions.find((tailPosition) => isEqualPosition(headPosition, tailPosition)) !== undefined;
  }

  public isOutOfBounds(dimensions: Dimensions) {
    const headPosition = this.position[0];

    if (
      headPosition.y < 0 || // Top
      headPosition.x >= dimensions.width || // Right
      headPosition.y >= dimensions.height || // Bottom
      headPosition.x < 0 // Left
    ) {
      return true;
    }

    return false;
  }

  public move() {
    // If no direction set there is no movement
    if (this.direction === null) {
      return false;
    }

    // Calculate a new position for the head
    const currentHeadPosition = this.position[0];
    const newHeadPosition = translatePosition(currentHeadPosition, this.direction);

    // Move the head of the snake to new position
    this.position.unshift(newHeadPosition);

    // When the snake has eaten do nothing so that it's tail grows
    if (this.hasEaten) {
      this.hasEaten = false;
    }
    // When the snake has not eaten pop off the end of it's tail so that it does not grow
    else {
      this.position.pop();
    }

    return true;
  }
}
