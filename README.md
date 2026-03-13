# PayMore: The Acquisition Game

A fast-paced, darkly comedic business strategy game where you must acquire 20 PayMore electronics resale stores before going spectacularly bankrupt.

## Quick Start

```bash
# Install dependencies
npm install   # or: bun install

# Run development server
npm run dev   # or: bun dev

# Build for production
npm run build # or: bun run build
```

## Deploy to Vercel (Free)

### Option 1: One-Click Deploy
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" and select this repository
4. Framework Preset: **Vite**
5. Click "Deploy"

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 3: Netlify
1. Run `npm run build`
2. Drag the `dist/` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

## Access Code

The game is password-gated. The access code is: `PAYMORE2025`

## Shared Leaderboard

The leaderboard uses [jsonblob.com](https://jsonblob.com) for persistent cross-device storage. All players share the same scoreboard. Falls back to localStorage if the API is unavailable.

## Tech Stack

- React 19 + Vite 8
- HTML5 Canvas (pixel art map)
- Web Audio API (chiptune sound effects)
- Google Fonts (Bebas Neue + Press Start 2P)
- jsonblob.com (shared leaderboard)
- No backend required — fully static deployment
