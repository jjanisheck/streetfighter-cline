import { useEffect, useRef, useState } from "react";

const GRAVITY = 0.8;
const PLAYER_SPEED = 4;
const JUMP_SPEED = -15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_Y = 320;

// Animation definitions - using available sprites only
const ANIMATIONS = {
  player: {
    idle: { sprites: [1], speed: 30 },
    walk: { sprites: [1, 2], speed: 8 },
    jump: { sprites: [3], speed: 30 },
    punch: { sprites: [2, 4], speed: 5 },
    kick: { sprites: [3, 4], speed: 5 },
    block: { sprites: [1], speed: 30 },
    hit: { sprites: [3], speed: 10 },
    special: { sprites: [2, 4, 2, 4], speed: 3 },
    crouch: { sprites: [1], speed: 30 },
    victory: { sprites: [4], speed: 30 }
  },
  npc: {
    idle: { sprites: [1], speed: 30 },
    walk: { sprites: [1], speed: 30 },
    jump: { sprites: [1], speed: 30 },
    punch: { sprites: [1], speed: 30 },
    kick: { sprites: [1], speed: 30 },
    block: { sprites: [1], speed: 30 },
    hit: { sprites: [1], speed: 30 },
    special: { sprites: [1], speed: 30 },
    crouch: { sprites: [1], speed: 30 },
    defeat: { sprites: [1], speed: 30 }
  }
};

const INITIAL_PLAYER_STATE = {
  x: 100,
  y: GROUND_Y,
  vx: 0,
  vy: 0,
  width: 60,
  height: 80,
  hp: 100,
  maxHp: 100,
  facing: 1, // 1 = right, -1 = left
  action: "idle",
  frame: 0,
  frameCounter: 0,
  actionTimer: 0,
  blocking: false,
  onGround: true,
  invulnerable: 0,
  comboInputs: [],
  lastInputTime: 0
};

const INITIAL_NPC_STATE = {
  x: 600,
  y: GROUND_Y,
  vx: 0,
  vy: 0,
  width: 60,
  height: 80,
  hp: 100,
  maxHp: 100,
  facing: -1,
  action: "idle",
  frame: 0,
  frameCounter: 0,
  actionTimer: 0,
  blocking: false,
  onGround: true,
  invulnerable: 0,
  aiState: "idle",
  aiTimer: 0,
  lastAction: 0
};

export default function GameEngine() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ ...INITIAL_PLAYER_STATE });
  const [npc, setNpc] = useState({ ...INITIAL_NPC_STATE });
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(60);
  const [gameState, setGameState] = useState("playing"); // playing, roundEnd, gameOver
  const [overlay, setOverlay] = useState("");
  const [winText, setWinText] = useState("");
  
  // Input handling
  const keys = useRef({});
  const frameRef = useRef();
  const gameTime = useRef(0);
  
  // Sprite loading
  const playerSprites = useRef({});
  const npcSprites = useRef({});
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const backgroundImage = useRef(null);
  
  // Sound effects
  const sounds = useRef({
    punch: null,
    kick: null,
    hit: null,
    special: null,
    victory: null
  });

  // Load all sprites
  useEffect(() => {
    if (typeof window === "undefined") return;

    let loadedCount = 0;
    const playerSpritesToLoad = [1, 2, 3, 4]; // Only existing player sprites
    const npcSpritesToLoad = [1]; // Only existing NPC sprites
    const totalSprites = playerSpritesToLoad.length + npcSpritesToLoad.length + 1; // + 1 for background

    const checkAllLoaded = () => {
      loadedCount++;
      console.log(`Loaded ${loadedCount}/${totalSprites} assets`);
      if (loadedCount >= totalSprites) {
        setSpritesLoaded(true);
        console.log("🎮 All sprites loaded successfully! Game ready to play.");
        
        // Log available sprites for debugging
        console.log("Available player sprites:", Object.keys(playerSprites.current));
        console.log("Available NPC sprites:", Object.keys(npcSprites.current));
      }
    };

    // Load player sprites (only the ones that exist)
    playerSpritesToLoad.forEach(i => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        console.log(`Player sprite ${i} loaded successfully`);
        checkAllLoaded();
      };
      img.onerror = (e) => {
        console.warn(`Player sprite ${i} failed to load`);
        img.broken = true;
        checkAllLoaded();
      };
      img.src = `/sprites/player/sprite_${i}.png`;
      playerSprites.current[i] = img;
    });

    // Load NPC sprites (only the ones that exist)
    npcSpritesToLoad.forEach(i => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        console.log(`NPC sprite ${i} loaded successfully`);
        checkAllLoaded();
      };
      img.onerror = (e) => {
        console.warn(`NPC sprite ${i} failed to load`);
        img.broken = true;
        checkAllLoaded();
      };
      img.src = `/sprites/npc/sprite_${i}.png`;
      npcSprites.current[i] = img;
    });

    // Load background
    const bg = new Image();
    bg.crossOrigin = "anonymous";
    bg.onload = checkAllLoaded;
    bg.onerror = checkAllLoaded;
    bg.src = "/backgrounds/stage.png";
    backgroundImage.current = bg;

    // Load sound effects
    const soundFiles = {
      punch: "/audio/sound_1.mp3",
      kick: "/audio/sound_2.mp3", 
      hit: "/audio/sound_3.mp3",
      special: "/audio/sound_4.mp3",
      victory: "/audio/sound_5.mp3"
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 0.3; // Lower volume
      audio.src = src;
      sounds.current[key] = audio;
    });

  }, []);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.code] = true;
      
      // Record combo inputs
      const now = Date.now();
      if (now - player.lastInputTime < 500) { // 500ms combo window
        setPlayer(prev => ({
          ...prev,
          comboInputs: [...prev.comboInputs.slice(-5), e.code], // Keep last 6 inputs
          lastInputTime: now
        }));
      } else {
        setPlayer(prev => ({
          ...prev,
          comboInputs: [e.code],
          lastInputTime: now
        }));
      }
    };

    const handleKeyUp = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [player.lastInputTime]);

  // Play sound effect
  const playSound = (soundName) => {
    try {
      if (sounds.current[soundName]) {
        sounds.current[soundName].currentTime = 0; // Reset to start
        sounds.current[soundName].play().catch(e => {
          // Silently handle autoplay restrictions
          console.log(`Could not play sound: ${soundName}`);
        });
      }
    } catch (error) {
      // Silently handle sound errors
    }
  };

  // Check for special move combos
  const checkSpecialMoves = (inputs) => {
    const inputStr = inputs.join(",");
    
    // Fireball: Down, Down-Right, Right, Punch
    if (inputStr.includes("ArrowDown,ArrowRight,KeyA") || 
        inputStr.includes("ArrowDown,ArrowRight,KeyS")) {
      return "fireball";
    }
    
    // Uppercut: Right, Down, Down-Right, Punch
    if (inputStr.includes("ArrowRight,ArrowDown,KeyS")) {
      return "uppercut";
    }
    
    return null;
  };

  // Get sprite for character animation
  const getSprite = (character, action, frame) => {
    const spriteData = character === "player" ? playerSprites.current : npcSprites.current;
    const animData = ANIMATIONS[character][action];
    
    if (!animData || !animData.sprites || animData.sprites.length === 0) {
      // Return a valid sprite or null
      const fallback = spriteData[1];
      return (fallback && fallback.complete && !fallback.broken && fallback.naturalWidth > 0) ? fallback : null;
    }
    
    // Get the sprite index from the animation array
    const spriteIndex = animData.sprites[frame % animData.sprites.length];
    const sprite = spriteData[spriteIndex];
    
    // Check if sprite is valid and loaded
    if (sprite && sprite.complete && !sprite.broken && sprite.naturalWidth > 0) {
      return sprite;
    }
    
    // Try fallback to first sprite
    const fallback = spriteData[1];
    return (fallback && fallback.complete && !fallback.broken && fallback.naturalWidth > 0) ? fallback : null;
  };

  // Update character animation
  const updateAnimation = (char) => {
    const character = char === player ? "player" : "npc";
    const animData = ANIMATIONS[character][char.action];
    if (!animData || !animData.sprites) return char;

    const newFrameCounter = char.frameCounter + 1;
    let newFrame = char.frame;
    
    if (newFrameCounter >= animData.speed) {
      newFrame = (char.frame + 1) % animData.sprites.length;
      return {
        ...char,
        frame: newFrame,
        frameCounter: 0
      };
    }
    
    return {
      ...char,
      frameCounter: newFrameCounter
    };
  };

  // Collision detection
  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  // Deal damage
  const dealDamage = (attacker, target, damage) => {
    if (target.invulnerable > 0 || target.blocking) return target;
    
    playSound("hit");
    
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

  // AI Logic
  const updateNPCAI = (npcState, playerState) => {
    let newNpc = { ...npcState };
    const distance = Math.abs(playerState.x - npcState.x);
    const aiDifficulty = Math.min(round, 5);
    
    newNpc.aiTimer++;
    
    // Face player
    newNpc.facing = playerState.x > npcState.x ? 1 : -1;
    
    // AI decision making based on distance and round
    if (newNpc.actionTimer <= 0) {
      if (distance > 100) {
        // Move closer
        newNpc.action = "walk";
        newNpc.vx = newNpc.facing * 2;
        newNpc.aiState = "approaching";
      } else if (distance < 80 && Math.random() < 0.1 + (aiDifficulty * 0.05)) {
        // Attack
        const attackType = Math.random();
        if (attackType < 0.4) {
          newNpc.action = "punch";
          newNpc.actionTimer = 25;
        } else if (attackType < 0.7) {
          newNpc.action = "kick";
          newNpc.actionTimer = 30;
        } else {
          newNpc.action = "special";
          newNpc.actionTimer = 40;
        }
        newNpc.frame = 0;
        newNpc.frameCounter = 0;
        newNpc.vx = 0;
      } else if (Math.random() < 0.05 + (aiDifficulty * 0.02)) {
        // Block
        newNpc.action = "block";
        newNpc.blocking = true;
        newNpc.actionTimer = 20;
      } else {
        newNpc.action = "idle";
        newNpc.vx = 0;
        newNpc.blocking = false;
      }
    }
    
    return newNpc;
  };

  // Main game loop
  useEffect(() => {
    if (!spritesLoaded) return;

    const gameLoop = () => {
      gameTime.current++;
      
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };
        
        // Handle input
        if (newPlayer.actionTimer <= 0) {
          // Check for special moves first
          const specialMove = checkSpecialMoves(newPlayer.comboInputs);
          
          if (specialMove && (keys.current.KeyA || keys.current.KeyS)) {
            newPlayer.action = "special";
            newPlayer.actionTimer = 40;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
            newPlayer.comboInputs = [];
            playSound("special");
          } else if (keys.current.KeyA) {
            newPlayer.action = "punch";
            newPlayer.actionTimer = 20;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
            playSound("punch");
          } else if (keys.current.KeyS) {
            newPlayer.action = "punch";
            newPlayer.actionTimer = 25;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
            playSound("punch");
          } else if (keys.current.KeyD) {
            newPlayer.action = "kick";
            newPlayer.actionTimer = 25;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
            playSound("kick");
          } else if (keys.current.KeyF) {
            newPlayer.action = "kick";
            newPlayer.actionTimer = 30;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
            playSound("kick");
          } else if (keys.current.ArrowDown) {
            if (newPlayer.onGround) {
              newPlayer.action = "crouch";
              newPlayer.blocking = true;
            }
          } else if (keys.current.ArrowUp && newPlayer.onGround) {
            newPlayer.action = "jump";
            newPlayer.vy = JUMP_SPEED;
            newPlayer.onGround = false;
            newPlayer.frame = 0;
            newPlayer.frameCounter = 0;
          } else if (keys.current.ArrowLeft) {
            newPlayer.action = "walk";
            newPlayer.vx = -PLAYER_SPEED;
            newPlayer.facing = -1;
          } else if (keys.current.ArrowRight) {
            newPlayer.action = "walk";
            newPlayer.vx = PLAYER_SPEED;
            newPlayer.facing = 1;
          } else {
            newPlayer.action = "idle";
            newPlayer.vx = 0;
            newPlayer.blocking = false;
          }
        }
        
        // Physics
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;
        
        if (!newPlayer.onGround) {
          newPlayer.vy += GRAVITY;
        }
        
        // Ground collision
        if (newPlayer.y >= GROUND_Y) {
          newPlayer.y = GROUND_Y;
          newPlayer.vy = 0;
          newPlayer.onGround = true;
          if (newPlayer.action === "jump") {
            newPlayer.action = "idle";
          }
        }
        
        // Screen boundaries
        newPlayer.x = Math.max(0, Math.min(CANVAS_WIDTH - newPlayer.width, newPlayer.x));
        
        // Update timers
        if (newPlayer.actionTimer > 0) newPlayer.actionTimer--;
        if (newPlayer.invulnerable > 0) newPlayer.invulnerable--;
        
        // Update animation
        newPlayer = updateAnimation(newPlayer);
        
        return newPlayer;
      });

      setNpc(prevNpc => {
        let newNpc = { ...prevNpc };
        
        // AI Update
        newNpc = updateNPCAI(newNpc, player);
        
        // Physics
        newNpc.x += newNpc.vx;
        newNpc.y += newNpc.vy;
        
        if (!newNpc.onGround) {
          newNpc.vy += GRAVITY;
        }
        
        // Ground collision
        if (newNpc.y >= GROUND_Y) {
          newNpc.y = GROUND_Y;
          newNpc.vy = 0;
          newNpc.onGround = true;
        }
        
        // Screen boundaries
        newNpc.x = Math.max(0, Math.min(CANVAS_WIDTH - newNpc.width, newNpc.x));
        
        // Update timers
        if (newNpc.actionTimer > 0) newNpc.actionTimer--;
        if (newNpc.invulnerable > 0) newNpc.invulnerable--;
        
        // Update animation
        newNpc = updateAnimation(newNpc);
        
        return newNpc;
      });

      // Combat detection
      if ((player.action === "punch" || player.action === "kick" || player.action === "special") && 
          player.actionTimer > 15) {
        const attackRect = {
          x: player.facing > 0 ? player.x + player.width : player.x - 30,
          y: player.y,
          width: 30,
          height: player.height
        };
        
        if (checkCollision(attackRect, npc)) {
          const damage = player.action === "special" ? 25 : (player.action === "punch" ? 15 : 20);
          setNpc(prev => dealDamage(player, prev, damage));
        }
      }

      if ((npc.action === "punch" || npc.action === "kick" || npc.action === "special") && 
          npc.actionTimer > 15) {
        const attackRect = {
          x: npc.facing > 0 ? npc.x + npc.width : npc.x - 30,
          y: npc.y,
          width: 30,
          height: npc.height
        };
        
        if (checkCollision(attackRect, player)) {
          const damage = npc.action === "special" ? 25 : (npc.action === "punch" ? 15 : 20);
          setPlayer(prev => dealDamage(npc, prev, damage));
        }
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [spritesLoaded, player.comboInputs, player.lastInputTime]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Time's up - check winner
          if (player.hp > npc.hp) {
            setWinText("Round Won!");
          } else if (npc.hp > player.hp) {
            setWinText("Round Lost!");
          } else {
            setWinText("Draw!");
          }
          setGameState("roundEnd");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState, player.hp, npc.hp]);

  // Check for round end conditions
  useEffect(() => {
    if (gameState === "playing") {
      if (player.hp <= 0) {
        setWinText("Round Lost!");
        setGameState("roundEnd");
      } else if (npc.hp <= 0) {
        setWinText("Round Won!");
        setGameState("roundEnd");
      }
    }
  }, [player.hp, npc.hp, gameState]);

  // Handle round transitions
  useEffect(() => {
    if (gameState === "roundEnd") {
      const timeout = setTimeout(() => {
        if (round >= 5 || player.hp <= 0) {
          const isVictory = player.hp > 0;
          setOverlay(isVictory ? "Victory!" : "Game Over!");
          setGameState("gameOver");
          if (isVictory) {
            playSound("victory");
          }
        } else {
          // Next round
          setRound(prev => prev + 1);
          setTimer(60);
          setPlayer(prev => ({ 
            ...INITIAL_PLAYER_STATE, 
            hp: Math.min(100, prev.hp + 20) // Restore 20 HP
          }));
          setNpc({ ...INITIAL_NPC_STATE });
          setGameState("playing");
          setWinText("");
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [gameState, round, player.hp]);

  // Render function
  useEffect(() => {
    if (!spritesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw background
      if (backgroundImage.current && backgroundImage.current.complete) {
        ctx.drawImage(backgroundImage.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        // Fallback background
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#90EE90";
        ctx.fillRect(0, GROUND_Y + 80, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y - 80);
      }

      // Draw player
      const playerSprite = getSprite("player", player.action, player.frame);
      if (playerSprite) {
        try {
          ctx.save();
          
          // Flash effect when invulnerable
          if (player.invulnerable > 0 && Math.floor(gameTime.current / 5) % 2) {
            ctx.globalAlpha = 0.7;
          }
          
          if (player.facing < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(playerSprite, -player.x - player.width, player.y, player.width, player.height);
          } else {
            ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
          }
          
          // Special move glow effect
          if (player.action === "special" && player.actionTimer > 20) {
            ctx.shadowColor = "#FFD700";
            ctx.shadowBlur = 15;
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 2;
            ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
          }
          
          ctx.restore();
        } catch (error) {
          // Fall back to rectangle if sprite fails
          console.warn("Player sprite error:", error);
          ctx.fillStyle = player.invulnerable > 0 ? "rgba(0,0,255,0.5)" : "blue";
          ctx.fillRect(player.x, player.y, player.width, player.height);
        }
      } else {
        // Fallback rectangle
        ctx.fillStyle = player.invulnerable > 0 ? "rgba(0,0,255,0.5)" : "blue";
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }

      // Draw NPC
      const npcSprite = getSprite("npc", npc.action, npc.frame);
      if (npcSprite) {
        try {
          ctx.save();
          
          // Flash effect when invulnerable
          if (npc.invulnerable > 0 && Math.floor(gameTime.current / 5) % 2) {
            ctx.globalAlpha = 0.7;
          }
          
          if (npc.facing < 0) {
            ctx.scale(-1, 1);
            ctx.drawImage(npcSprite, -npc.x - npc.width, npc.y, npc.width, npc.height);
          } else {
            ctx.drawImage(npcSprite, npc.x, npc.y, npc.width, npc.height);
          }
          
          // Special move glow effect
          if (npc.action === "special" && npc.actionTimer > 20) {
            ctx.shadowColor = "#FF4500";
            ctx.shadowBlur = 15;
            ctx.strokeStyle = "#FF4500";
            ctx.lineWidth = 2;
            ctx.strokeRect(npc.x - 5, npc.y - 5, npc.width + 10, npc.height + 10);
          }
          
          ctx.restore();
        } catch (error) {
          // Fall back to rectangle if sprite fails
          console.warn("NPC sprite error:", error);
          ctx.fillStyle = npc.invulnerable > 0 ? "rgba(255,0,0,0.5)" : "red";
          ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
        }
      } else {
        // Fallback rectangle
        ctx.fillStyle = npc.invulnerable > 0 ? "rgba(255,0,0,0.5)" : "red";
        ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
      }

      // Draw UI
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      
      // Health bars
      ctx.fillStyle = "red";
      ctx.fillRect(20, 20, 200, 20);
      ctx.fillStyle = "green";
      ctx.fillRect(20, 20, (player.hp / player.maxHp) * 200, 20);
      
      ctx.fillStyle = "red";
      ctx.fillRect(CANVAS_WIDTH - 220, 20, 200, 20);
      ctx.fillStyle = "green";
      ctx.fillRect(CANVAS_WIDTH - 220, 20, (npc.hp / npc.maxHp) * 200, 20);

      // Timer and round
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(`Round ${round}`, CANVAS_WIDTH / 2, 30);
      ctx.fillText(`Time: ${timer}`, CANVAS_WIDTH / 2, 55);

      // Win text
      if (winText) {
        ctx.fillStyle = "yellow";
        ctx.font = "30px Arial";
        ctx.fillText(winText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      // Game over overlay
      if (overlay) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText(overlay, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      requestAnimationFrame(render);
    };

    render();
  }, [spritesLoaded, player, npc, round, timer, winText, overlay]);

  if (!spritesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="text-3xl font-bold mb-4">🎮 Street Fighter</div>
          <div className="text-xl mb-4">Loading Game Assets...</div>
          <div className="text-gray-400 mb-4">Loading sprites and background...</div>
          <div className="animate-pulse">
            <div className="w-64 h-4 bg-gray-700 rounded-full mx-auto">
              <div className="h-4 bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Using available sprite assets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <canvas 
        ref={canvasRef}
        className="border-4 border-gray-600 rounded-lg shadow-2xl"
        style={{ maxWidth: "90vw", height: "auto" }}
      />
      <div className="mt-4 text-white text-center">
        <div className="text-sm mb-2">
          <strong>Controls:</strong> Arrow keys to move, A/S = Punch, D/F = Kick, ↓ = Block
        </div>
        <div className="text-xs text-gray-300">
          <strong>Special Moves:</strong> ↓→A = Fireball, →↓S = Uppercut
        </div>
      </div>
    </div>
  );
}