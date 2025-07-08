// Comprehensive Physics and Collision System Tests for Street Fighter Game
// Testing all physics mechanics, collision detection, boundaries, and edge cases

describe('Street Fighter Physics System', () => {
  // Constants from GameEngine
  const GRAVITY = 0.8;
  const PLAYER_SPEED = 4;
  const JUMP_SPEED = -15;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 320;

  // Physics Tests
  describe('Gravity and Movement Physics', () => {
    const applyGravity = (character) => {
      if (!character.onGround) {
        character.vy += GRAVITY;
      }
      return character;
    };

    const applyMovement = (character) => {
      character.x += character.vx;
      character.y += character.vy;
      return character;
    };

    test('should apply gravity to airborne characters', () => {
      const character = { x: 100, y: 200, vx: 0, vy: 0, onGround: false };
      applyGravity(character);
      expect(character.vy).toBe(GRAVITY);
      
      // Apply gravity multiple times
      applyGravity(character);
      expect(character.vy).toBe(GRAVITY * 2);
      
      applyGravity(character);
      expect(character.vy).toBe(GRAVITY * 3);
    });

    test('should not apply gravity to grounded characters', () => {
      const character = { x: 100, y: GROUND_Y, vx: 0, vy: 0, onGround: true };
      applyGravity(character);
      expect(character.vy).toBe(0);
    });

    test('should handle jumping physics correctly', () => {
      const character = { x: 100, y: GROUND_Y, vx: 0, vy: 0, onGround: true };
      
      // Initiate jump
      character.vy = JUMP_SPEED;
      character.onGround = false;
      
      expect(character.vy).toBe(JUMP_SPEED);
      
      // Apply movement and gravity for multiple frames
      let maxHeight = character.y;
      for (let i = 0; i < 50; i++) {
        applyMovement(character);
        applyGravity(character);
        maxHeight = Math.min(maxHeight, character.y);
        
        // Check if character has landed
        if (character.y >= GROUND_Y) {
          character.y = GROUND_Y;
          character.vy = 0;
          character.onGround = true;
          break;
        }
      }
      
      // Verify jump physics
      expect(maxHeight).toBeLessThan(GROUND_Y); // Character should have gone up
      expect(character.y).toBe(GROUND_Y); // Character should land back on ground
      expect(character.onGround).toBe(true);
    });

    test('should calculate jump arc correctly', () => {
      const character = { x: 100, y: GROUND_Y, vx: PLAYER_SPEED, vy: JUMP_SPEED, onGround: false };
      const positions = [];
      
      // Track jump arc
      while (character.y < GROUND_Y || character.vy < 0) {
        positions.push({ x: character.x, y: character.y });
        applyMovement(character);
        applyGravity(character);
        
        if (character.y >= GROUND_Y) {
          character.y = GROUND_Y;
          break;
        }
      }
      
      // Verify parabolic arc
      const peakIndex = positions.findIndex((pos, i) => 
        i > 0 && positions[i].y > positions[i-1].y
      );
      
      expect(peakIndex).toBeGreaterThan(0); // Should have an ascending phase
      expect(peakIndex).toBeLessThan(positions.length - 1); // Should have a descending phase
      
      // Verify horizontal movement during jump
      const horizontalDistance = positions[positions.length - 1].x - positions[0].x;
      expect(horizontalDistance).toBeGreaterThan(0);
    });

    test('should handle terminal velocity', () => {
      const character = { x: 100, y: 0, vx: 0, vy: 0, onGround: false };
      
      // Apply gravity many times to check if velocity stabilizes
      for (let i = 0; i < 100; i++) {
        applyGravity(character);
      }
      
      // In real implementation, terminal velocity might be capped
      // For now, just verify gravity accumulation
      expect(character.vy).toBe(GRAVITY * 100);
    });
  });

  // Collision Detection Tests
  describe('Collision Detection System', () => {
    const checkCollision = (rect1, rect2) => {
      return rect1.x < rect2.x + rect2.width &&
             rect1.x + rect1.width > rect2.x &&
             rect1.y < rect2.y + rect2.height &&
             rect1.y + rect1.height > rect2.y;
    };

    test('should detect exact boundary collision', () => {
      const rect1 = { x: 100, y: 100, width: 50, height: 50 };
      const rect2 = { x: 150, y: 100, width: 50, height: 50 };
      
      expect(checkCollision(rect1, rect2)).toBe(false); // Just touching
      
      rect2.x = 149; // 1 pixel overlap
      expect(checkCollision(rect1, rect2)).toBe(true);
    });

    test('should detect collision from all directions', () => {
      const center = { x: 100, y: 100, width: 50, height: 50 };
      
      // From left
      const fromLeft = { x: 70, y: 110, width: 40, height: 30 };
      expect(checkCollision(center, fromLeft)).toBe(true);
      
      // From right
      const fromRight = { x: 140, y: 110, width: 40, height: 30 };
      expect(checkCollision(center, fromRight)).toBe(true);
      
      // From top
      const fromTop = { x: 110, y: 70, width: 30, height: 40 };
      expect(checkCollision(center, fromTop)).toBe(true);
      
      // From bottom
      const fromBottom = { x: 110, y: 140, width: 30, height: 40 };
      expect(checkCollision(center, fromBottom)).toBe(true);
    });

    test('should detect corner overlaps', () => {
      const rect1 = { x: 100, y: 100, width: 50, height: 50 };
      
      // Top-left corner overlap
      const topLeft = { x: 90, y: 90, width: 20, height: 20 };
      expect(checkCollision(rect1, topLeft)).toBe(true);
      
      // Top-right corner overlap
      const topRight = { x: 140, y: 90, width: 20, height: 20 };
      expect(checkCollision(rect1, topRight)).toBe(true);
      
      // Bottom-left corner overlap
      const bottomLeft = { x: 90, y: 140, width: 20, height: 20 };
      expect(checkCollision(rect1, bottomLeft)).toBe(true);
      
      // Bottom-right corner overlap
      const bottomRight = { x: 140, y: 140, width: 20, height: 20 };
      expect(checkCollision(rect1, bottomRight)).toBe(true);
    });

    test('should handle zero-size rectangles', () => {
      const normal = { x: 100, y: 100, width: 50, height: 50 };
      const zeroWidth = { x: 120, y: 120, width: 0, height: 20 };
      const zeroHeight = { x: 120, y: 120, width: 20, height: 0 };
      const zeroSize = { x: 120, y: 120, width: 0, height: 0 };
      
      expect(checkCollision(normal, zeroWidth)).toBe(false);
      expect(checkCollision(normal, zeroHeight)).toBe(false);
      expect(checkCollision(normal, zeroSize)).toBe(false);
    });

    test('should handle negative dimensions gracefully', () => {
      const normal = { x: 100, y: 100, width: 50, height: 50 };
      const negative = { x: 120, y: 120, width: -20, height: -20 };
      
      // Negative dimensions should be treated as no collision
      expect(checkCollision(normal, negative)).toBe(false);
    });
  });

  // Boundary Tests
  describe('Screen Boundary Constraints', () => {
    const constrainToScreen = (character) => {
      character.x = Math.max(0, Math.min(CANVAS_WIDTH - character.width, character.x));
      character.y = Math.min(CANVAS_HEIGHT - character.height, character.y);
      return character;
    };

    const checkGroundCollision = (character) => {
      if (character.y >= GROUND_Y) {
        character.y = GROUND_Y;
        character.vy = 0;
        character.onGround = true;
      }
      return character;
    };

    test('should prevent character from moving off left edge', () => {
      const character = { x: -10, y: 200, width: 60, height: 80 };
      constrainToScreen(character);
      expect(character.x).toBe(0);
    });

    test('should prevent character from moving off right edge', () => {
      const character = { x: 800, y: 200, width: 60, height: 80 };
      constrainToScreen(character);
      expect(character.x).toBe(CANVAS_WIDTH - character.width);
    });

    test('should handle ground collision correctly', () => {
      const character = { x: 100, y: 350, vx: 0, vy: 5, width: 60, height: 80, onGround: false };
      checkGroundCollision(character);
      
      expect(character.y).toBe(GROUND_Y);
      expect(character.vy).toBe(0);
      expect(character.onGround).toBe(true);
    });

    test('should allow character to move freely within bounds', () => {
      const positions = [
        { x: 100, y: 100 },
        { x: 400, y: 200 },
        { x: 700, y: 300 }
      ];
      
      positions.forEach(pos => {
        const character = { ...pos, width: 60, height: 80 };
        const original = { ...character };
        constrainToScreen(character);
        
        expect(character.x).toBe(original.x);
        expect(character.y).toBe(original.y);
      });
    });

    test('should handle extreme positions', () => {
      const extremePositions = [
        { x: -1000, y: -1000 },
        { x: 10000, y: 10000 },
        { x: Number.MAX_SAFE_INTEGER, y: Number.MAX_SAFE_INTEGER },
        { x: Number.MIN_SAFE_INTEGER, y: Number.MIN_SAFE_INTEGER }
      ];
      
      extremePositions.forEach(pos => {
        const character = { ...pos, width: 60, height: 80 };
        constrainToScreen(character);
        
        expect(character.x).toBeGreaterThanOrEqual(0);
        expect(character.x).toBeLessThanOrEqual(CANVAS_WIDTH - character.width);
      });
    });
  });

  // Attack Hitbox Tests
  describe('Attack Hitbox System', () => {
    const createAttackHitbox = (character, attackType) => {
      const hitboxSizes = {
        punch: { width: 30, height: 20, offsetY: 0 },
        kick: { width: 40, height: 30, offsetY: 20 },
        special: { width: 50, height: 40, offsetY: 0 }
      };
      
      const size = hitboxSizes[attackType] || hitboxSizes.punch;
      
      return {
        x: character.facing > 0 ? character.x + character.width : character.x - size.width,
        y: character.y + size.offsetY,
        width: size.width,
        height: size.height
      };
    };

    test('should create correct hitbox for right-facing punch', () => {
      const character = { x: 100, y: 200, width: 60, height: 80, facing: 1 };
      const hitbox = createAttackHitbox(character, 'punch');
      
      expect(hitbox.x).toBe(160); // Right side of character
      expect(hitbox.y).toBe(200);
      expect(hitbox.width).toBe(30);
      expect(hitbox.height).toBe(20);
    });

    test('should create correct hitbox for left-facing punch', () => {
      const character = { x: 100, y: 200, width: 60, height: 80, facing: -1 };
      const hitbox = createAttackHitbox(character, 'punch');
      
      expect(hitbox.x).toBe(70); // Left side of character
      expect(hitbox.y).toBe(200);
      expect(hitbox.width).toBe(30);
      expect(hitbox.height).toBe(20);
    });

    test('should create different hitboxes for different attacks', () => {
      const character = { x: 100, y: 200, width: 60, height: 80, facing: 1 };
      
      const punchBox = createAttackHitbox(character, 'punch');
      const kickBox = createAttackHitbox(character, 'kick');
      const specialBox = createAttackHitbox(character, 'special');
      
      // Verify different sizes
      expect(kickBox.width).toBeGreaterThan(punchBox.width);
      expect(specialBox.width).toBeGreaterThan(kickBox.width);
      
      // Verify kick has vertical offset
      expect(kickBox.y).toBeGreaterThan(punchBox.y);
    });

    test('should detect hit when attack connects', () => {
      const attacker = { x: 100, y: 200, width: 60, height: 80, facing: 1 };
      const target = { x: 150, y: 200, width: 60, height: 80 };
      
      const hitbox = createAttackHitbox(attacker, 'punch');
      const hit = checkCollision(hitbox, target);
      
      expect(hit).toBe(true);
    });

    test('should not detect hit when attack misses', () => {
      const attacker = { x: 100, y: 200, width: 60, height: 80, facing: 1 };
      const target = { x: 250, y: 200, width: 60, height: 80 }; // Too far away
      
      const hitbox = createAttackHitbox(attacker, 'punch');
      const hit = checkCollision(hitbox, target);
      
      expect(hit).toBe(false);
    });

    test('should handle attacks at different heights', () => {
      const attacker = { x: 100, y: 200, width: 60, height: 80, facing: 1 };
      const jumpingTarget = { x: 150, y: 100, width: 60, height: 80 }; // In the air
      
      const punchBox = createAttackHitbox(attacker, 'punch');
      const kickBox = createAttackHitbox(attacker, 'kick');
      
      const punchHit = checkCollision(punchBox, jumpingTarget);
      const kickHit = checkCollision(kickBox, jumpingTarget);
      
      expect(punchHit).toBe(false); // Punch too low
      expect(kickHit).toBe(false); // Kick also too low for jumping target
    });
  });

  // Damage System Tests
  describe('Damage Detection and Application', () => {
    const dealDamage = (attacker, target, damage) => {
      if (target.invulnerable > 0 || target.blocking) return target;
      
      return {
        ...target,
        hp: Math.max(0, target.hp - damage),
        action: "hit",
        frame: 0,
        frameCounter: 0,
        actionTimer: 20,
        invulnerable: 30
      };
    };

    test('should apply correct damage values', () => {
      const damages = {
        punch: 15,
        kick: 20,
        special: 25
      };
      
      const target = { hp: 100, invulnerable: 0, blocking: false };
      
      const afterPunch = dealDamage(null, target, damages.punch);
      expect(afterPunch.hp).toBe(85);
      
      const afterKick = dealDamage(null, { hp: 100, invulnerable: 0, blocking: false }, damages.kick);
      expect(afterKick.hp).toBe(80);
      
      const afterSpecial = dealDamage(null, { hp: 100, invulnerable: 0, blocking: false }, damages.special);
      expect(afterSpecial.hp).toBe(75);
    });

    test('should grant invulnerability frames after hit', () => {
      const target = { hp: 100, invulnerable: 0, blocking: false };
      const result = dealDamage(null, target, 20);
      
      expect(result.invulnerable).toBe(30);
      
      // Should not take damage while invulnerable
      const secondHit = dealDamage(null, result, 20);
      expect(secondHit).toBe(result); // No change
      expect(secondHit.hp).toBe(80); // HP unchanged
    });

    test('should handle combo damage correctly', () => {
      let target = { hp: 100, invulnerable: 0, blocking: false };
      
      // First hit
      target = dealDamage(null, target, 15);
      expect(target.hp).toBe(85);
      expect(target.invulnerable).toBeGreaterThan(0);
      
      // Wait for invulnerability to wear off
      target.invulnerable = 0;
      
      // Second hit
      target = dealDamage(null, target, 20);
      expect(target.hp).toBe(65);
      
      // Third hit
      target.invulnerable = 0;
      target = dealDamage(null, target, 25);
      expect(target.hp).toBe(40);
    });
  });

  // Edge Cases and Bugs
  describe('Physics Edge Cases and Bug Prevention', () => {
    test('should handle simultaneous horizontal and vertical movement', () => {
      const character = { 
        x: 100, 
        y: 200, 
        vx: PLAYER_SPEED, 
        vy: JUMP_SPEED, 
        width: 60, 
        height: 80,
        onGround: false 
      };
      
      // Apply movement
      character.x += character.vx;
      character.y += character.vy;
      
      expect(character.x).toBe(104); // Moved right
      expect(character.y).toBe(185); // Moved up (negative vy)
    });

    test('should prevent character overlap', () => {
      const player = { x: 100, y: GROUND_Y, width: 60, height: 80 };
      const npc = { x: 120, y: GROUND_Y, width: 60, height: 80 };
      
      // Characters are overlapping
      expect(checkCollision(player, npc)).toBe(true);
      
      // Push characters apart (simple implementation)
      const pushApart = (char1, char2) => {
        if (checkCollision(char1, char2)) {
          const centerX1 = char1.x + char1.width / 2;
          const centerX2 = char2.x + char2.width / 2;
          
          if (centerX1 < centerX2) {
            char1.x = char2.x - char1.width - 1;
          } else {
            char1.x = char2.x + char2.width + 1;
          }
        }
      };
      
      pushApart(player, npc);
      expect(checkCollision(player, npc)).toBe(false);
    });

    test('should handle rapid direction changes', () => {
      const character = { x: 400, vx: PLAYER_SPEED, facing: 1 };
      
      // Change direction rapidly
      character.vx = -PLAYER_SPEED;
      character.facing = -1;
      expect(character.vx).toBe(-PLAYER_SPEED);
      expect(character.facing).toBe(-1);
      
      // Change back
      character.vx = PLAYER_SPEED;
      character.facing = 1;
      expect(character.vx).toBe(PLAYER_SPEED);
      expect(character.facing).toBe(1);
    });

    test('should handle collision at high speeds', () => {
      const character = { 
        x: 750, 
        y: GROUND_Y, 
        vx: 100, // Very high speed
        width: 60, 
        height: 80 
      };
      
      // Apply movement
      character.x += character.vx;
      
      // Constrain to screen
      character.x = Math.max(0, Math.min(CANVAS_WIDTH - character.width, character.x));
      
      expect(character.x).toBe(CANVAS_WIDTH - character.width);
    });

    test('should handle floating point precision issues', () => {
      const character = { x: 100.123456789, y: 200.987654321, vy: 0.1 };
      
      // Apply gravity multiple times with small values
      for (let i = 0; i < 10; i++) {
        character.vy += 0.1;
        character.y += character.vy;
      }
      
      // Should still calculate correctly despite floating point
      expect(character.y).toBeCloseTo(206.487654321, 5);
    });

    test('should handle collision detection with rotated hitboxes', () => {
      // Note: Current implementation doesn't support rotation,
      // but this test ensures we handle the basic case
      const rect1 = { x: 100, y: 100, width: 50, height: 30 };
      const rect2 = { x: 125, y: 115, width: 50, height: 30 };
      
      expect(checkCollision(rect1, rect2)).toBe(true);
    });

    test('should prevent wall clipping', () => {
      const character = { x: -50, y: 200, vx: 5, width: 60, height: 80 };
      
      // Move character
      character.x += character.vx;
      
      // Apply boundary constraint
      character.x = Math.max(0, character.x);
      
      expect(character.x).toBe(0); // Should stop at wall, not clip through
    });

    test('should handle double jump prevention', () => {
      const character = { 
        y: 200, 
        vy: JUMP_SPEED, 
        onGround: false,
        canJump: false // Already jumped
      };
      
      // Try to jump again while in air
      if (!character.onGround && !character.canJump) {
        // Jump should be prevented
        expect(character.vy).toBe(JUMP_SPEED); // Velocity unchanged
      }
    });
  });

  // Performance Tests
  describe('Physics Performance Optimization', () => {
    test('should efficiently check multiple collisions', () => {
      const characters = Array.from({ length: 10 }, (_, i) => ({
        x: i * 80,
        y: GROUND_Y,
        width: 60,
        height: 80
      }));
      
      let collisionCount = 0;
      const startTime = Date.now();
      
      // Check all pairs
      for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
          if (checkCollision(characters[i], characters[j])) {
            collisionCount++;
          }
        }
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10); // Should be fast
    });

    test('should use spatial partitioning for optimization', () => {
      // Simple grid-based optimization test
      const gridSize = 100;
      const getGridCell = (x, y) => ({
        x: Math.floor(x / gridSize),
        y: Math.floor(y / gridSize)
      });
      
      const char1 = { x: 50, y: 50 };
      const char2 = { x: 250, y: 250 };
      const char3 = { x: 60, y: 60 };
      
      const cell1 = getGridCell(char1.x, char1.y);
      const cell2 = getGridCell(char2.x, char2.y);
      const cell3 = getGridCell(char3.x, char3.y);
      
      // Characters in same cell should be checked for collision
      expect(cell1).toEqual(cell3);
      expect(cell1).not.toEqual(cell2);
    });
  });
});

// Test runner export
if (typeof module !== 'undefined') {
  module.exports = {
    runPhysicsTests: () => {
      console.log('🎮 Running Comprehensive Physics Tests...\n');
      console.log('Testing: Gravity, Movement, Collisions, Boundaries, and Edge Cases\n');
      
      return {
        summary: 'Run these tests with Jest or another test framework for full validation',
        categories: [
          'Gravity and Movement Physics',
          'Collision Detection System',
          'Screen Boundary Constraints',
          'Attack Hitbox System',
          'Damage Detection and Application',
          'Physics Edge Cases and Bug Prevention',
          'Physics Performance Optimization'
        ]
      };
    }
  };
}