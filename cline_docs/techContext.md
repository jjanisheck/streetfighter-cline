# Technical Context: Street Fighter Clone

## Technologies Used
- **Next.js** (v9.1.1) - React framework for the application
- **React** (v16.11.0) - UI library for component-based development
- **Tailwind CSS** (v1.1.4) - Utility-first CSS framework for styling
- **@zeit/next-css** - For CSS modules support in Next.js
- **styled-components** - For server-side rendering styles in _document.js
- **HTML5 Canvas API** - For rendering the game graphics
- **JavaScript** - Primary programming language

## Development Setup
- Node.js with NODE_OPTIONS='--openssl-legacy-provider' for OpenSSL compatibility
- Development server available via `npm run dev`
- Access the application at `http://localhost:3000`
- Production builds created with `npm run build`
- Static export generated in the `out/` directory

## Technical Constraints
- Game canvas automatically scales to fill the browser window
- Sprites are scaled to 6.25% of canvas width and 12.5% of canvas height
- Designed for keyboard input only
- Timing-based special move detection (within 200ms)
- Game loop includes input handling, state updates, and rendering
- Optimized for static export and deployment on Netlify
- Uses placeholder assets that can be replaced with custom sprites and sounds
- Physics system with gravity and ground collision detection
- NPC AI with variable reaction times based on round number
