# Technical Context: Street Fighter Clone

## Technologies Used
- **Next.js** (v13.4.7) - React framework for the application
- **React** (v18.2.0) - UI library for component-based development
- **Tailwind CSS** (v3.3.5) - Utility-first CSS framework for styling
- **HTML5 Canvas API** - For rendering the game graphics
- **JavaScript** - Primary programming language

## Development Setup
- Node.js 18+ required for development
- Development server available via `npm run dev`
- Access the application at `http://localhost:3000`
- Production builds created with `npm run build`
- Static export generated in the `out/` directory

## Technical Constraints
- Game canvas is fixed at 800×400 pixels
- Designed for keyboard input only
- Timing-based special move detection (within 200ms)
- Game loop includes input handling, state updates, and rendering
- Optimized for static export and deployment on Netlify
- Uses placeholder assets that can be replaced with custom sprites and sounds
