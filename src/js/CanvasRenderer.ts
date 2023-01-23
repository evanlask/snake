import { Game } from './Game';
import { Position } from './types';

export class CanvasRenderer {
  // Elements
  public canvasElement: HTMLCanvasElement;
  public element: HTMLElement;

  // State
  public frame: number = 0;
  public running: boolean = true;

  // Canvas rendering context
  private ctx: CanvasRenderingContext2D;

  // Misc
  private animationFrame?: number;

  // Game instance
  private game: Game;

  constructor(element: HTMLElement, game: Game) {
    this.element = element;
    this.game = game;

    // Create canvas element
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = this.game.options.dimensions.width * this.game.options.tileSize;
    this.canvasElement.height = this.game.options.dimensions.height * this.game.options.tileSize;

    // Attempt to get rendering context
    const ctx = this.canvasElement.getContext('2d');

    if (!ctx) {
      throw new Error('Unable to get 2d context.');
    }

    this.ctx = ctx;

    // Append canvas element to container
    this.element.append(this.canvasElement);

    this.start();
  }

  private clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  private drawFood() {
    this.drawTile(this.game.food.position, '#00ff00');
  }

  private drawTile(position: Position, color: string) {
    const { x, y } = this.transformPosition(position);
    const size = this.transformSize(1);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  private drawScore() {
    const { score } = this.game;

    const fontSize = 24;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${fontSize}px Helvetica, Arial, sans-serif`;
    this.ctx.fillText(score.toString(), 10, fontSize + 5);
  }

  private drawSnake() {
    const { snake } = this.game;
    const { position } = snake;

    position.forEach((position, index) => {
      const isHead = index === 0;

      this.drawTile(position, isHead ? '#ff0000' : '#CC0000');
    });
  }

  private render() {
    this.clear();
    this.drawFood();
    this.drawSnake();
    this.drawScore();

    this.frame += 1;

    if (this.running) {
      this.animationFrame = requestAnimationFrame(this.render.bind(this));
    }
  }

  public start() {
    this.running = true;

    this.render();
  }

  public stop() {
    this.running = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private transformPosition(position: Position) {
    return {
      x: position.x * this.game.options.tileSize,
      y: position.y * this.game.options.tileSize,
    } as Position;
  }

  private transformSize(size: number) {
    return size * this.game.options.tileSize;
  }
}
