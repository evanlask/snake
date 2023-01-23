import { Dimensions, Direction, GameOptions } from './types';
import { getDirectionFromKey, getRandomPosition, getRandomPositionWithExclusions } from './utils';

import { Food } from './Food';
import { Snake } from './Snake';

export class Game {
  // Options
  public options: GameOptions;

  // State
  private lastDirectionPressed: Direction | null = null;
  public running: boolean = false;
  public score: number = 0;
  private speed: number;
  public tick: number = 0;

  // Game Entities
  public snake: Snake;
  public food: Food;

  // Misc
  private timeout: number | null = null;

  constructor(options: GameOptions) {
    // Options
    this.options = options;

    // State
    this.speed = this.options.speedInitial;

    // Entities
    this.snake = this.spawnSnake();
    this.food = this.spawnFood();

    // Watch key presses
    document.addEventListener('keydown', this.onKeydown.bind(this));

    this.start();
  }

  private checkGameOver() {
    if (
      this.snake.isOutOfBounds(this.options.dimensions) || // The snake is out of bounds
      this.snake.isCollidedWithTail() // The snake has collided with its own tail
    ) {
      this.stop();

      alert('BOINK!!!');

      this.restart();
    }
  }

  private onKeydown(event: KeyboardEvent) {
    const direction = getDirectionFromKey(event.key);

    if (direction !== null) {
      this.lastDirectionPressed = direction;
      event.preventDefault();
    }
  }

  private snakeDigestion() {
    if (this.snake.isCollidedWithFood(this.food)) {
      this.snake.eat();

      this.score += 1;

      this.food = this.spawnFood();
    }
  }

  private restart() {
    this.score = 0;
    this.speed = this.options.speedInitial;
    this.tick = 0;

    this.food = this.spawnFood();
    this.snake = this.spawnSnake();

    this.start();
  }

  private snakeMovement() {
    if (this.lastDirectionPressed !== null) {
      this.snake.changeDirection(this.lastDirectionPressed);
      this.lastDirectionPressed = null;
    }

    this.snake.move();
  }

  private spawnFood() {
    const position = getRandomPositionWithExclusions(this.options.dimensions, this.snake.position);

    return new Food(position);
  }

  private spawnSnake() {
    const position = getRandomPosition(this.options.dimensions);

    return new Snake(position);
  }

  private start() {
    this.running = true;

    this.update();
  }

  private stop() {
    this.running = false;

    if (this.timeout != null) {
      clearTimeout(this.timeout);

      this.timeout = null;
    }
  }

  private update() {
    if (this.running) {
      this.timeout = setTimeout(this.update.bind(this), this.speed);
    }

    this.snakeMovement();
    this.snakeDigestion();

    this.checkGameOver();

    this.updateSpeed();

    this.tick += 1;
  }

  private updateSpeed() {
    const newSpeed = this.options.speedInitial - this.score * this.options.speedStep;

    this.speed = Math.max(this.options.speedMinimum, newSpeed);
  }
}
