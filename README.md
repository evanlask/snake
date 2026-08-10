# Snake

The classic Snake game, rendered to an HTML canvas. No dependencies, no framework — just TypeScript and a 2D context.

## Playing

Arrow keys steer. The snake stays still until you press one.

Eat the green food to grow and score a point. The game speeds up as you go: ticks start at 200ms and drop 5ms per point, down to a floor of 80ms. Hit a wall or your own tail and the game restarts.

## Running it

Needs Node 24.

```sh
npm install
npm run dev
```

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run build`     | Production build into `dist/`           |
| `npm run check`     | Format, lint and type-check in one pass |
| `npm run check:fix` | Same, but writes fixes                  |
| `npm run clean`     | Remove everything generated             |
| `npm run dev`       | Dev server with HMR                     |
| `npm run preview`   | Serve the built output                  |
| `npm run test`      | Run tests                               |

Built on [Vite+](https://viteplus.dev), which bundles the dev server, bundler, test runner, linter, formatter and type checker into one dependency. It is all configured from `vite.config.ts`.

## Layout

```text
src/
├── index.html       entry — the Vite root is src/, not the repo root
├── css/app.css
└── js/
    ├── app.ts             wires the game to the DOM
    ├── Game.ts            tick loop, scoring, collision handling
    ├── Snake.ts           movement, growth, collision tests
    ├── Food.ts            position holder
    ├── CanvasRenderer.ts  draw loop
    ├── types.ts
    └── utils.ts           position and direction helpers
```

Two independent loops: `Game` advances on a `setTimeout` tick whose interval is the current speed, while `CanvasRenderer` redraws on `requestAnimationFrame` and reads whatever state it finds. Frame rate is unrelated to game speed.

`Direction` in `types.ts` is a const object rather than an enum, because enums emit runtime code and `tsconfig.json` sets `erasableSyntaxOnly`.
