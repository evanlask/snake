import '../css/app.css';
import { CanvasRenderer } from './CanvasRenderer.ts';
import { Game } from './Game.ts';

const element = document.getElementById('app');

if (element) {
  const game = new Game({
    dimensions: {
      width: 25,
      height: 25,
    },
    speedInitial: 200,
    speedMinimum: 80,
    speedStep: 5,
    tileSize: 16,
  });

  new CanvasRenderer(element, game);
}
