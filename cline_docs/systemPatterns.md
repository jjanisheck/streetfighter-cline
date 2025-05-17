# System Patterns: Street Fighter Clone

## Architecture Patterns
- **Component-Based Architecture** - Using React components for UI separation
- **Game Loop Pattern** - Implemented in the GameEngine component
- **State Machine** - For AI behaviors (idle, approach, attack, defend)
- **Event-Driven Input** - Keyboard event listeners for player controls

## Key Technical Decisions
- Canvas-based rendering rather than DOM-based for performance
- Next.js static export for easy deployment
- Tailwind for responsive styling and layout
- Sprite-based animation system for characters
- Timing-based combo detection for special moves

## System Structure
- **Pages Layer** - Entry points and page layouts (`pages/`)
  - `index.js` - Main game page with canvas
  - `_app.js` - Next.js custom App component
  - `_document.js` - Next.js custom Document
  
- **Components Layer** - Reusable UI and game components (`components/`)
  - `GameEngine.js` - Core game logic and rendering
  - Button components for UI controls
  - HealthMeter component for displaying character health
  
- **Assets** - Static resources (`public/`)
  - Sprite sheets for characters
  - Audio files for game sounds
  
- **Styles** - Global styles and Tailwind configuration (`styles/`)

## Data Flow
1. User input captured via event listeners
2. Game engine processes inputs and updates game state
3. AI state machine determines NPC responses
4. Game state rendered to canvas
5. UI components update to reflect current game state
