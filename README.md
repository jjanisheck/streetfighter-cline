
# Street Fighter Clone

A simplified single-player fighting game built with **Next.js**, **Tailwind CSS** and the HTML5 **Canvas** API. The project ships with placeholder art and is ready to deploy on Netlify.

## Features
- 800×400 canvas centered on the page
- Five rounds against an NPC with increasing difficulty
- Health bars and a round timer
- Keyboard controls with special move detection
- Simple AI states: idle, approach, attack and defend
- Tailwind styling and Next.js configuration for static export

## Getting Started
1. Install **Node.js 18** or later.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser to play.

## Build and Deploy
To create a production build run:
```bash
npm run build
```
The `out/` directory can be deployed directly. The included `netlify.toml` configures Netlify's Next.js plugin for easy deployment.

## Project Structure
- `pages/index.js` – renders the canvas and `GameEngine` component
- `components/GameEngine.js` – game loop, input handling and simple AI
- `styles/` – global styles and Tailwind configuration
- `public/sprites/` – placeholder character sprites
- `public/audio/` – placeholder sound effects
- `netlify.toml` – Netlify build settings

## Controls
- **ArrowLeft** / **ArrowRight** – move
- **ArrowUp** – jump
- **ArrowDown** – crouch / block
- **A** – light punch
- **S** – heavy punch
- **D** – light kick
- **F** – heavy kick
- **Specials** (within 200&nbsp;ms)
  - Fireball: ArrowDown → ArrowRight → A
  - Uppercut: ArrowRight → S

## Gameplay
Each round lasts **60 seconds**. Win by knocking the NPC to 0&nbsp;HP or by having more HP when time runs out. After every round positions reset, player HP restores by 20% (up to 100%), and the AI reaction speed increases. After round five, winning shows a **“You Win”** overlay; otherwise **“Game Over”** is displayed.

## Assets
All images and audio in `public/` are placeholders. Replace them with your own sprites and sound effects to customise the game.

---

This project is provided for educational purposes only.

