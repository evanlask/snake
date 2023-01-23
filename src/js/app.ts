import '../css/app.scss';

import { Game } from './Game';
import { CanvasRenderer } from './CanvasRenderer';

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
