import { useEffect, useRef, useState } from "react";

const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const JUMP_SPEED = -10;

const INITIAL_STATE = {
  x: 100,
  y: 0,
  vx: 0,
  vy: 0,
  width: 50,
  height: 50,
  hp: 100,
  blocking: false,
  action: "resting", // 'resting', 'kicking', 'punching', 'running'
};

const NPC_STATE = {
  x: 650,
  y: 0,
  vx: 0,
  vy: 0,
  width: 50,
  height: 50,
  hp: 100,
  blocking: false,
};

export default function GameEngine() {
  const canvasRef = useRef(null);
  const backgroundRef = useRef(null);
  const groundRef = useRef(350);
  const [spriteSize, setSpriteSize] = useState({ width: 50, height: 50 });
  const [player, setPlayer] = useState({ ...INITIAL_STATE });
  const [npc, setNpc] = useState({ ...NPC_STATE });
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState(60);
  const [overlay, setOverlay] = useState("");
  const keys = useRef({});
  const lastLight = useRef(0);
  const inputBuffer = useRef([]);
  const frameRef = useRef();

  // NPC AI settings
  const aiConfig = [
    { delay: 1000, interval: 3000 },
    { delay: 800, interval: 2500 },
    { delay: 600, interval: 2000 },
    { delay: 400, interval: 1500 },
    { delay: 200, interval: 1000 },
  ];

  // --- SPRITE IMAGES (persist across renders) ---
  const playerSpritesRef = useRef({
    resting: null,
    kicking: null,
    punching: null,
    running: null,
  });
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const npcSpriteRef = useRef(null);
  const [loadingErrors, setLoadingErrors] = useState([]);

  // Only initialize images on the client (not during SSR)
  useEffect(() => {
    if (typeof window !== "undefined") {
      let loadedCount = 0;
      let errorCount = 0;
      const totalImages = 5; // 4 player sprites + 1 NPC sprite
      const errors = [];

      // Helper function to track loaded images
      const onImageLoad = (name) => {
        console.log(`Sprite loaded successfully: ${name}`);
        loadedCount++;
        checkAllLoaded();
      };

      // Helper function to handle load errors
      const onImageError = (imgName) => {
        console.error(`Failed to load sprite: ${imgName}`);
        errors.push(imgName);
        errorCount++;
        checkAllLoaded();
      };

      // Check if all images have been processed (loaded or failed)
      const checkAllLoaded = () => {
        if (loadedCount + errorCount === totalImages) {
          console.log(
            `All sprites processed: ${loadedCount} loaded, ${errorCount} failed`
          );
          setLoadingErrors(errors);
          setSpritesLoaded(true);
        }
      };

      // Load player sprites with event handlers
      const loadSprite = (name, src) => {
        const img = new window.Image();
        img.onload = () => onImageLoad(name);
        img.onerror = () => onImageError(src);
        img.src = src;
        playerSpritesRef.current[name] = img;
      };

      // Create fallback sprite (colored rectangle)
      const createFallbackSprite = (color) => {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 100, 100);
        return canvas;
      };

      // Ensure fallbacks exist for all sprite types
      playerSpritesRef.current.fallbackResting = createFallbackSprite("blue");
      playerSpritesRef.current.fallbackKicking = createFallbackSprite("green");
      playerSpritesRef.current.fallbackPunching =
        createFallbackSprite("yellow");
      playerSpritesRef.current.fallbackRunning = createFallbackSprite("purple");

      loadSprite("resting", "/sprites/player/sprite_1.png");
      loadSprite("kicking", "/sprites/player/sprite_2.png");
      loadSprite("punching", "/sprites/player/sprite_3.png");
      loadSprite("running", "/sprites/player/sprite_4.png");

      // Load NPC sprite
      npcSpriteRef.current = new window.Image();
      npcSpriteRef.current.onload = () => onImageLoad("npc");
      npcSpriteRef.current.onerror = () => {
        onImageError("NPC sprite");
        // Create fallback NPC sprite (red rectangle)
        npcSpriteRef.current = createFallbackSprite("red");
      };
      npcSpriteRef.current.src = "/sprites/npc/sprite_1.png";
    }
  }, []);
  // --- END SPRITE IMAGES ---

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const sw = canvas.width * 0.0625;
    const sh = canvas.height * 0.125;
    setSpriteSize({ width: sw, height: sh });
    groundRef.current = canvas.height - sh;
    setPlayer((p) => ({
      ...p,
      width: sw,
      height: sh,
      x: canvas.width * 0.125,
      y: groundRef.current,
    }));
    setNpc((n) => ({
      ...n,
      width: sw,
      height: sh,
      x: canvas.width * 0.8125,
      y: groundRef.current,
    }));
    backgroundRef.current = new Image();
    backgroundRef.current.src = "/backgrounds/stage.png";

    const preventKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    function handleKeyDown(e) {
      if (preventKeys.includes(e.code)) e.preventDefault();
      keys.current[e.code] = true;
      inputBuffer.current.push({ code: e.code, time: Date.now() });
      // keep last 3 inputs
      if (inputBuffer.current.length > 3) inputBuffer.current.shift();
    }
    function handleKeyUp(e) {
      if (preventKeys.includes(e.code)) e.preventDefault();
      keys.current[e.code] = false;
    }
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    let aiInterval;

    function chooseNpcAction() {
      const actions = ["idle", "approach", "attack", "defend"];
      const action = actions[Math.floor(Math.random() * actions.length)];
      setTimeout(() => {
        if (action === "approach") {
          setNpc((n) => ({
            ...n,
            vx: n.x > player.x ? -PLAYER_SPEED : PLAYER_SPEED,
          }));
        } else if (action === "attack") {
          if (Math.abs(npc.x - player.x) < 60) {
            dealDamage("npc", 20);
          }
        } else if (action === "defend") {
          setNpc((n) => ({ ...n, blocking: true }));
          setTimeout(() => setNpc((n) => ({ ...n, blocking: false })), 500);
        }
      }, aiConfig[round - 1].delay);
    }

    function startNpcAI() {
      aiInterval = setInterval(chooseNpcAction, aiConfig[round - 1].interval);
    }
    startNpcAI();

    const timerInterval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) return 0;
        return t - 1;
      });
    }, 1000);

    function dealDamage(target, dmg) {
      if (target === "npc") {
        setNpc((n) => {
          const block = n.blocking ? 0.5 : 1;
          return { ...n, hp: Math.max(n.hp - dmg * block, 0) };
        });
      } else {
        setPlayer((p) => {
          const block = p.blocking ? 0.5 : 1;
          return { ...p, hp: Math.max(p.hp - dmg * block, 0) };
        });
      }
    }

    function processInput() {
      let p = { ...player };
      // Default action
      p.action = "resting";

      if (keys.current["ArrowLeft"]) {
        p.vx = -PLAYER_SPEED;
        p.action = "running";
      } else if (keys.current["ArrowRight"]) {
        p.vx = PLAYER_SPEED;
        p.action = "running";
      } else p.vx = 0;

      if (keys.current["ArrowUp"] && p.y === groundRef.current) {
        p.vy = JUMP_SPEED;
      }

      p.blocking = keys.current["ArrowDown"] || false;

      // Attacks
      if (keys.current["KeyA"]) {
        const now = Date.now();
        let dmg = 10;
        if (now - lastLight.current < 300) dmg *= 1.2;
        lastLight.current = now;
        dealDamage("npc", dmg);
        p.action = "punching";
      }
      if (keys.current["KeyS"]) {
        dealDamage("npc", 20);
        p.action = "kicking";
      }
      if (keys.current["KeyD"]) {
        dealDamage("npc", 10);
        p.action = "punching";
      }
      if (keys.current["KeyF"]) {
        dealDamage("npc", 20);
        p.action = "kicking";
      }

      // specials
      const buf = inputBuffer.current;
      const seq = buf.map((b) => b.code).join("-");
      const times = buf.map((b) => b.time);
      if (seq === "ArrowDown-ArrowRight-KeyA" && times[2] - times[0] <= 200) {
        dealDamage("npc", 30);
        inputBuffer.current = [];
        p.action = "punching";
      }
      if (seq === "ArrowRight-KeyS" && times[1] - times[0] <= 200) {
        dealDamage("npc", 30);
        inputBuffer.current = [];
        p.action = "kicking";
      }

      // gravity
      p.vy += GRAVITY;
      p.y += p.vy;
      p.x += p.vx;
      if (p.y > groundRef.current) {
        p.y = groundRef.current;
        p.vy = 0;
      }
      p.x = Math.max(0, Math.min(canvas.width - spriteSize.width, p.x));
      setPlayer(p);
    }

    function updateNpc() {
      setNpc((n) => {
        let newN = { ...n };
        newN.vy += GRAVITY;
        newN.y += newN.vy;
        newN.x += newN.vx;
        if (newN.y > groundRef.current) {
          newN.y = groundRef.current;
          newN.vy = 0;
        }
        newN.x = Math.max(0, Math.min(canvas.width - spriteSize.width, newN.x));
        return newN;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (backgroundRef.current && backgroundRef.current.complete) {
        ctx.drawImage(backgroundRef.current, 0, 0, canvas.width, canvas.height);
      }

      // Draw character boxes for debugging (always visible)
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        player.x,
        player.y - player.height,
        player.width,
        player.height
      );

      ctx.strokeStyle = "red";
      ctx.strokeRect(npc.x, npc.y - npc.height, npc.width, npc.height);

      // Draw player sprite
      let spriteKey = player.action;
      let spriteImg = playerSpritesRef.current[spriteKey];
      let fallbackKey = `fallback${
        spriteKey.charAt(0).toUpperCase() + spriteKey.slice(1)
      }`;
      let fallbackImg = playerSpritesRef.current[fallbackKey];

      // Debug output (once per second to reduce console spam)
      if (Math.floor(Date.now() / 1000) % 5 === 0) {
        console.log("Draw player:", {
          action: player.action,
          position: `${player.x},${player.y}`,
          size: `${player.width}×${player.height}`,
          spriteAvailable: spriteImg ? "yes" : "no",
          spriteComplete: spriteImg
            ? spriteImg.complete
              ? "yes"
              : "no"
            : "n/a",
          naturalWidth: spriteImg ? spriteImg.naturalWidth : "n/a",
          usingFallback:
            !spriteImg || !spriteImg.complete || !spriteImg.naturalWidth
              ? "yes"
              : "no",
        });
      }

      // Try to use the sprite image first, if it's properly loaded
      if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
        // Draw solid color first to make sprite visible
        ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
        ctx.fillRect(
          player.x,
          player.y - player.height,
          player.width,
          player.height
        );

        // Draw the sprite with increased size (2x original size)
        ctx.drawImage(
          spriteImg,
          player.x - player.width / 2, // Center the sprite
          player.y - player.height * 2, // Raise it up a bit
          player.width * 2,
          player.height * 2
        );
      }
      // If sprite unavailable, try to use the canvas fallback
      else if (fallbackImg) {
        ctx.drawImage(
          fallbackImg,
          player.x,
          player.y - player.height,
          player.width,
          player.height
        );
      }
      // Last resort fallback
      else {
        ctx.fillStyle = "blue";
        ctx.fillRect(
          player.x,
          player.y - player.height,
          player.width,
          player.height
        );
      }

      // Draw NPC sprite or fallback
      if (npcSpriteRef.current) {
        // Draw solid color first to make sprite visible
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(npc.x, npc.y - npc.height, npc.width, npc.height);

        // If it's an image with valid properties
        if (
          npcSpriteRef.current instanceof HTMLImageElement &&
          npcSpriteRef.current.complete &&
          npcSpriteRef.current.naturalWidth > 0
        ) {
          // Draw NPC sprite with increased size
          ctx.drawImage(
            npcSpriteRef.current,
            npc.x - npc.width / 2, // Center the sprite
            npc.y - npc.height * 2, // Raise it up a bit
            npc.width * 2,
            npc.height * 2
          );
        }
        // If it's a canvas fallback
        else if (npcSpriteRef.current instanceof HTMLCanvasElement) {
          ctx.drawImage(
            npcSpriteRef.current,
            npc.x,
            npc.y - npc.height,
            npc.width,
            npc.height
          );
        }
        // Last resort
        else {
          ctx.fillStyle = "red";
          ctx.fillRect(npc.x, npc.y - npc.height, npc.width, npc.height);
        }
      } else {
        ctx.fillStyle = "red";
        ctx.fillRect(npc.x, npc.y - npc.height, npc.width, npc.height);
      }
    }

    function gameLoop() {
      processInput();
      updateNpc();
      draw();

      // check end conditions
      if (player.hp <= 0 || npc.hp <= 0 || timer === 0) {
        endRound();
        return;
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    }

    function endRound() {
      cancelAnimationFrame(frameRef.current);
      clearInterval(timerInterval);
      clearInterval(aiInterval);

      const playerWin = player.hp > npc.hp;
      if (playerWin) {
        if (round === 5) {
          setOverlay("You Win");
          return;
        }
        setRound((r) => r + 1);
        setPlayer((p) => ({ ...INITIAL_STATE, hp: Math.min(p.hp + 20, 100) }));
        setNpc({ ...NPC_STATE });
        setTimer(60);
      } else {
        setOverlay("Game Over");
      }
    }

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(timerInterval);
      clearInterval(aiInterval);
      cancelAnimationFrame(frameRef.current);
    };
  }, [round]);

  useEffect(() => {
    if (timer === 0) {
      // handle timer expiry
    }
  }, [timer]);

  return (
    <div>
      <div className="relative w-screen h-screen">
        <div className="flex justify-between mb-2">
          <div className="w-1/2 mr-2 health-bar">
            <div
              className="health-inner"
              style={{ width: `${player.hp}%` }}
            ></div>
          </div>
          <div className="text-xl">{timer}</div>
          <div className="w-1/2 ml-2 health-bar">
            <div className="health-inner" style={{ width: `${npc.hp}%` }}></div>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          width="800"
          height="400"
          className="border w-full h-full"
        ></canvas>
        {overlay && <div className="overlay">{overlay}</div>}
      </div>
    </div>
  );
}
