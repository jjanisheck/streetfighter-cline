# System Patterns: Street Fighter Clone

## Architecture Patterns
- **Component-Based Architecture** - Using React components for UI separation
- **Game Loop Pattern** - Implemented in the GameEngine component using requestAnimationFrame
- **State Machine** - For AI behaviors with "idle", "approach", "attack", and "defend" states
- **Event-Driven Input** - Keyboard event listeners for player controls with input buffering
- **Physics System** - Simple physics with gravity, velocity, and ground collision

## Key Technical Decisions
- Canvas-based rendering rather than DOM-based for performance
- Responsive canvas that scales to fill the browser window
- Next.js static export for easy deployment
- Tailwind for responsive styling and layout
- Sprite-based animation system for characters
- Timing-based combo detection for special moves (200ms window)
- Input buffer system to capture and detect special move combinations
- Progressive AI difficulty that increases with each round

## System Structure
- **Pages Layer** - Entry points and page layouts (`pages/`)
  - `index.js` - Main game page with canvas
  - `_app.js` - Next.js custom App component
  - `_document.js` - Next.js custom Document with styled-components integration
  
- **Components Layer** - Reusable UI and game components (`components/`)
  - `GameEngine.js` - Core game logic and rendering
    - Game loop using requestAnimationFrame
    - Input handling with keyboard events
    - NPC AI state machine
    - Physics simulation
    - Canvas rendering
  - Button components for UI controls
  - HealthMeter component for displaying character health
  
- **Assets** - Static resources (`public/`)
  - Sprite sheets for player and NPC characters in `public/sprites/`
  - Audio files for game sounds in `public/audio/`
  - Background images in `public/backgrounds/`
  
- **Styles** - Global styles and Tailwind configuration (`styles/`)

## Data Flow
1. User input captured via keyboard event listeners and stored in buffer
2. Game loop processes inputs on each animation frame
3. Special moves detected based on input buffer and timing
4. Player state updated based on inputs (position, velocity, action)
5. Physics system applies gravity and handles collisions
6. AI state machine determines NPC responses with difficulty-based delays
7. Game state rendered to canvas with appropriate sprites
8. UI components (health bars, timer) update to reflect current game state
9. Round end conditions checked (health, timer) to progress game
