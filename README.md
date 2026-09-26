# Common Ground Games

A small static game collection. Open `index.html` directly in a browser; no build step or package installation is required.

## Project layout

```text
index.html
README.md
games/
  math-castle-quest.html
  number-guessing-game.html
  rock-paper-scissors.html
scripts/
  games/
    math-castle-quest.js
    number-guessing.js
    rock-paper-scissors.js
styles/
  catalog.css
  games/
    math-castle-quest.css
    number-guessing.css
    rock-paper-scissors.css
```

## Adding a game

1. Add its page to `games/`.
2. Put page styles in `styles/games/` and behavior in `scripts/games/`.
3. Link those assets from the game page using paths relative to `games/` (for example, `../styles/games/my-game.css`).
4. Add a catalog entry in `index.html` that points to the page.
