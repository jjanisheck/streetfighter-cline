
import GameEngine from '../components/GameEngine'

export default function Home() {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold">Street Fighter Clone</h1>
      <div className="canvas-container">
        <canvas id="gameCanvas" width="800" height="400" className="border"></canvas>
      </div>
      <GameEngine />
    </div>
  )

}
