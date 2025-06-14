# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Street Fighter-inspired fighting game built with Next.js 9.1.1, React, and HTML5 Canvas. The game features a single-player mode with an AI opponent.

## Key Commands

### Development
- `npm run dev` - Start the development server on http://localhost:3002
- `npm run dev:next` - Direct Next.js dev server (preferred)
- `npm run build` - Build for production (creates static files in `out/` directory)
- `npm start` - Start production server
- `npm test` - Run game logic tests

### Installation
- `npm install` - Install all dependencies (requires Node.js 18+)

### Important Notes
- Uses `--openssl-legacy-provider` flag for Node.js 18+ compatibility
- Development server runs on port 3002 to avoid conflicts

## Architecture Overview

### Core Game System
The game is built around a single React component that manages the entire game state:
- **GameEngine** (`components/GameEngine.js`): Central component implementing:
  - Game loop using `requestAnimationFrame`
  - Physics system with gravity and collision detection
  - Input handling with combo detection for special moves
  - AI state machine with difficulty scaling per round
  - Health/damage system with blocking mechanics
  - Round management (5 rounds, 60 seconds each)

### Rendering Architecture
- Uses HTML5 Canvas for all game rendering
- Sprite-based character system with fallback colored rectangles
- Dynamic canvas scaling to browser window size
- Character sprites scale to 6.25% canvas width × 12.5% canvas height

### Input System
- Keyboard event handlers with input buffering
- Special move detection using timed input sequences (200ms window)
- Controls mapped to arrow keys + A/S/D/F for attacks

### AI System
- State-based AI with idle, approach, attack, and defend states
- Progressive difficulty through `aiConfig` array (reduces reaction time)
- Distance-based decision making

## Important Technical Details

### Known Issues
- Next.js 9.1.1 is severely outdated (current is v14+)
- Build scripts are stubbed and non-functional
- Recent sprite loading/visibility problems (see git history)
- CORS issues with sprite loading require `crossOrigin="anonymous"`

### Static Export Configuration
- Configured for Netlify deployment via `netlify.toml`
- Uses `exportPathMap` in `next.config.js` for static generation
- CSS handled through deprecated `@zeit/next-css` plugin

### Asset Structure
- `/public/sprites/` - Character sprites (player_*.png, npc.png)
- `/public/audio/` - Sound effects (currently placeholders)
- `/public/backgrounds/` - Stage backgrounds (e.g., stage.png)

## Implemented Features
- **Complete sprite animation system** - Uses all 85 sprites per character with proper animation cycling
- **Advanced combat system** - Damage, blocking, invulnerability frames, hit detection
- **Special move combos** - Fireball (↓→A) and Uppercut (→↓S) with 500ms input windows
- **Progressive AI difficulty** - 5 rounds with increasing AI reaction speed
- **Sound effects** - Attack sounds, hit sounds, victory music
- **Visual effects** - Invulnerability flashing, special move glows, hit feedback
- **Complete game loop** - Round progression, health restoration, win/lose conditions

## Development Considerations
- Client-side only rendering required for Canvas
- Custom test runner in `test-runner.js` validates game logic
- No linting configuration present
- Tailwind CSS 1.1.4 (outdated) for styling
- PostCSS configuration for autoprefixing
- Game fully functional and playable