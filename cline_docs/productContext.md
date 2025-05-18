# Product Context: Street Fighter Clone

## Why This Project Exists
- To create a simplified but functional implementation of a classic fighting game
- To demonstrate game development principles using web technologies (Next.js, React, Canvas API)
- To provide a customizable foundation that can be extended with custom sprites and sounds
- To serve as an educational resource for web-based game development

## Problems It Solves
- Provides an accessible implementation of fighting game mechanics using modern web technologies
- Demonstrates how to build real-time interactive experiences in the browser
- Offers a complete game loop with player input, physics, AI responses, and scoring
- Shows how to structure a game with component-based architecture
- Implements responsive design principles for canvas-based games

## How It Should Work
- Players control a character using keyboard inputs to fight against an NPC opponent
- Game consists of five rounds with increasing AI difficulty
- Each round lasts 60 seconds with health bars and timer
- Player wins by depleting the NPC's health or having more health when time expires
- Player's health partially restores between rounds (20% up to 100%)
- Game includes special move combinations for advanced techniques:
  - Fireball: Down → Right → Light Punch (within 200ms)
  - Uppercut: Right → Heavy Punch (within 200ms)
- Controls support movement (left/right), jumping, crouching/blocking, and various attacks
- After round five, the game shows a "You Win" or "Game Over" overlay
- Canvas automatically scales to fill the browser window
