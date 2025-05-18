import { useEffect, useRef, useState } from 'react'

const GRAVITY = 0.5
const PLAYER_SPEED = 5
const JUMP_SPEED = -10

const INITIAL_STATE = {
  x: 100,
  y: 0,
  vx: 0,
  vy: 0,
  width: 50,
  height: 50,
  hp: 100,
  blocking: false,
}

const NPC_STATE = {
  x: 650,
  y: 0,
  vx: 0,
  vy: 0,
  width: 50,
  height: 50,
  hp: 100,
  blocking: false,
}

export default function GameEngine() {
  const canvasRef = useRef(null)
  const backgroundRef = useRef(null)
  const groundRef = useRef(350)
  const [spriteSize, setSpriteSize] = useState({ width: 50, height: 50 })
  const [player, setPlayer] = useState({ ...INITIAL_STATE })
  const [npc, setNpc] = useState({ ...NPC_STATE })
  const [round, setRound] = useState(1)
  const [timer, setTimer] = useState(60)
  const [overlay, setOverlay] = useState('')
  const keys = useRef({})
  const lastLight = useRef(0)
  const inputBuffer = useRef([])
  const frameRef = useRef()

  // NPC AI settings
  const aiConfig = [
    { delay: 1000, interval: 3000 },
    { delay: 800, interval: 2500 },
    { delay: 600, interval: 2000 },
    { delay: 400, interval: 1500 },
    { delay: 200, interval: 1000 },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const sw = canvas.width * 0.0625
    const sh = canvas.height * 0.125
    setSpriteSize({ width: sw, height: sh })
    groundRef.current = canvas.height - sh
    setPlayer(p => ({ ...p, width: sw, height: sh, x: canvas.width * 0.125, y: groundRef.current }))
    setNpc(n => ({ ...n, width: sw, height: sh, x: canvas.width * 0.8125, y: groundRef.current }))
    backgroundRef.current = new Image()
    backgroundRef.current.src = '/backgrounds/stage.png'

    function handleKeyDown(e) {
      keys.current[e.code] = true
      inputBuffer.current.push({ code: e.code, time: Date.now() })
      // keep last 3 inputs
      if (inputBuffer.current.length > 3) inputBuffer.current.shift()
    }
    function handleKeyUp(e) {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    let aiInterval

    function chooseNpcAction() {
      const actions = ['idle', 'approach', 'attack', 'defend']
      const action = actions[Math.floor(Math.random() * actions.length)]
      setTimeout(() => {
        if (action === 'approach') {
          setNpc(n => ({ ...n, vx: n.x > player.x ? -PLAYER_SPEED : PLAYER_SPEED }))
        } else if (action === 'attack') {
          if (Math.abs(npc.x - player.x) < 60) {
            dealDamage('npc', 20)
          }
        } else if (action === 'defend') {
          setNpc(n => ({ ...n, blocking: true }))
          setTimeout(() => setNpc(n => ({ ...n, blocking: false })), 500)
        }
      }, aiConfig[round - 1].delay)
    }

    function startNpcAI() {
      aiInterval = setInterval(chooseNpcAction, aiConfig[round - 1].interval)
    }
    startNpcAI()

    const timerInterval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) return 0
        return t - 1
      })
    }, 1000)

    function dealDamage(target, dmg) {
      if (target === 'npc') {
        setNpc(n => {
          const block = n.blocking ? 0.5 : 1
          return { ...n, hp: Math.max(n.hp - dmg * block, 0) }
        })
      } else {
        setPlayer(p => {
          const block = p.blocking ? 0.5 : 1
          return { ...p, hp: Math.max(p.hp - dmg * block, 0) }
        })
      }
    }

    function processInput() {
      let p = { ...player }
      if (keys.current['ArrowLeft']) p.vx = -PLAYER_SPEED
      else if (keys.current['ArrowRight']) p.vx = PLAYER_SPEED
      else p.vx = 0

      if (keys.current['ArrowUp'] && p.y === groundRef.current) {
        p.vy = JUMP_SPEED
      }

      p.blocking = keys.current['ArrowDown'] || false

      // Attacks
      if (keys.current['KeyA']) {
        const now = Date.now()
        let dmg = 10
        if (now - lastLight.current < 300) dmg *= 1.2
        lastLight.current = now
        dealDamage('npc', dmg)
      }
      if (keys.current['KeyS']) dealDamage('npc', 20)
      if (keys.current['KeyD']) dealDamage('npc', 10)
      if (keys.current['KeyF']) dealDamage('npc', 20)

      // specials
      const buf = inputBuffer.current
      const seq = buf.map(b => b.code).join('-')
      const times = buf.map(b => b.time)
      if (
        seq === 'ArrowDown-ArrowRight-KeyA' &&
        times[2] - times[0] <= 200
      ) {
        dealDamage('npc', 30)
        inputBuffer.current = []
      }
      if (
        seq === 'ArrowRight-KeyS' &&
        times[1] - times[0] <= 200
      ) {
        dealDamage('npc', 30)
        inputBuffer.current = []
      }

      // gravity
      p.vy += GRAVITY
      p.y += p.vy
      p.x += p.vx
      if (p.y > groundRef.current) {
        p.y = groundRef.current
        p.vy = 0
      }
      p.x = Math.max(0, Math.min(canvas.width - spriteSize.width, p.x))
      setPlayer(p)
    }

    function updateNpc() {
      setNpc(n => {
        let newN = { ...n }
        newN.vy += GRAVITY
        newN.y += newN.vy
        newN.x += newN.vx
        if (newN.y > groundRef.current) {
          newN.y = groundRef.current
          newN.vy = 0
        }
        newN.x = Math.max(0, Math.min(canvas.width - spriteSize.width, newN.x))
        return newN
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (backgroundRef.current && backgroundRef.current.complete) {
        ctx.drawImage(backgroundRef.current, 0, 0, canvas.width, canvas.height)
      }
      ctx.fillStyle = 'blue'
      ctx.fillRect(player.x, player.y - player.height, player.width, player.height)
      ctx.fillStyle = 'red'
      ctx.fillRect(npc.x, npc.y - npc.height, npc.width, npc.height)
    }

    function gameLoop() {
      processInput()
      updateNpc()
      draw()

      // check end conditions
      if (player.hp <= 0 || npc.hp <= 0 || timer === 0) {
        endRound()
        return
      }

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    function endRound() {
      cancelAnimationFrame(frameRef.current)
      clearInterval(timerInterval)
      clearInterval(aiInterval)

      const playerWin = player.hp > npc.hp
      if (playerWin) {
        if (round === 5) {
          setOverlay('You Win')
          return
        }
        setRound(r => r + 1)
        setPlayer(p => ({ ...INITIAL_STATE, hp: Math.min(p.hp + 20, 100) }))
        setNpc({ ...NPC_STATE })
        setTimer(60)
      } else {
        setOverlay('Game Over')
      }
    }

    gameLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearInterval(timerInterval)
      clearInterval(aiInterval)
      cancelAnimationFrame(frameRef.current)
    }
  }, [round])

  useEffect(() => {
    if (timer === 0) {
      // handle timer expiry
    }
  }, [timer])

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
            <div
              className="health-inner"
              style={{ width: `${npc.hp}%` }}
            ></div>
          </div>
        </div>
        <canvas ref={canvasRef} id="gameCanvas" width="800" height="400" className="border w-full h-full"></canvas>
        {overlay && <div className="overlay">{overlay}</div>}
      </div>
    </div>
  )
}
