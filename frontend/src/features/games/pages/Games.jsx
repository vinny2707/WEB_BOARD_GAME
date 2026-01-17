import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGames } from '../../../api/gamesApi'
import { Loader2 } from 'lucide-react'
import useClickSound from '../hooks/useClickSound'

// Game board preview components - map by game type
const TicTacToePreview = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Grid lines */}
    <line x1="33" y1="10" x2="33" y2="90" stroke="#2dd4bf" strokeWidth="2" />
    <line x1="66" y1="10" x2="66" y2="90" stroke="#2dd4bf" strokeWidth="2" />
    <line x1="10" y1="33" x2="90" y2="33" stroke="#2dd4bf" strokeWidth="2" />
    <line x1="10" y1="66" x2="90" y2="66" stroke="#2dd4bf" strokeWidth="2" />
    {/* X marks */}
    <g stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round">
      <line x1="15" y1="15" x2="28" y2="28" />
      <line x1="28" y1="15" x2="15" y2="28" />
      <line x1="38" y1="48" x2="61" y2="61" />
      <line x1="61" y1="48" x2="38" y2="61" />
    </g>
    {/* O marks */}
    <circle cx="77" cy="21" r="10" fill="none" stroke="#1e3a5f" strokeWidth="3" />
    <circle cx="21" cy="77" r="10" fill="none" stroke="#1e3a5f" strokeWidth="3" />
  </svg>
)

const GomokuPreview = () => (
  <div className="w-full h-full relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm rounded border border-gray-200 dark:border-zinc-700">
    {/* Grid */}
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      {[20, 40, 60, 80].map(pos => (
        <g key={pos}>
          <line x1={pos} y1="10" x2={pos} y2="90" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="10" y1={pos} x2="90" y2={pos} stroke="#e5e7eb" strokeWidth="0.5" />
        </g>
      ))}
      {/* Stones */}
      <circle cx="40" cy="40" r="6" fill="#1a1a2e" />
      <circle cx="60" cy="40" r="6" fill="#1a1a2e" />
      <circle cx="40" cy="60" r="6" fill="#2dd4bf" />
      <circle cx="60" cy="60" r="6" fill="#1a1a2e" />
      <circle cx="50" cy="50" r="6" fill="#2dd4bf" />
      <circle cx="30" cy="50" r="6" fill="#2dd4bf" />
    </svg>
  </div>
)

const Caro4Preview = () => (
  <div className="w-full h-full relative bg-amber-50 rounded border border-amber-200">
    {/* Grid */}
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      {[25, 50, 75].map(pos => (
        <g key={pos}>
          <line x1={pos} y1="10" x2={pos} y2="90" stroke="#fcd34d" strokeWidth="0.8" />
          <line x1="10" y1={pos} x2="90" y2={pos} stroke="#fcd34d" strokeWidth="0.8" />
        </g>
      ))}
      {/* 4 stones in a row - winning pattern */}
      <circle cx="25" cy="50" r="7" fill="#f59e0b" />
      <circle cx="42" cy="50" r="7" fill="#f59e0b" />
      <circle cx="59" cy="50" r="7" fill="#f59e0b" />
      <circle cx="76" cy="50" r="7" fill="#f59e0b" />
      {/* Opponent stones */}
      <circle cx="50" cy="25" r="6" fill="#475569" />
      <circle cx="50" cy="75" r="6" fill="#475569" />
    </svg>
  </div>
)

const SnakePreview = () => (
  <div className="w-full h-full relative bg-green-50 rounded border border-green-200">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
      {/* Snake body */}
      <rect x="20" y="45" width="12" height="12" rx="2" fill="#22c55e" />
      <rect x="32" y="45" width="12" height="12" rx="2" fill="#22c55e" />
      <rect x="44" y="45" width="12" height="12" rx="2" fill="#22c55e" />
      <rect x="56" y="45" width="12" height="12" rx="2" fill="#16a34a" />
      {/* Snake head */}
      <rect x="68" y="45" width="14" height="12" rx="2" fill="#15803d" />
      <circle cx="77" cy="49" r="2" fill="white" />
      {/* Apple/Food */}
      <circle cx="30" cy="25" r="6" fill="#ef4444" />
      <path d="M30 19 Q33 16 35 19" stroke="#166534" strokeWidth="2" fill="none" />
    </svg>
  </div>
)

const Match3Preview = () => (
  <div className="w-full h-full relative bg-gradient-to-br from-purple-100 to-pink-100 rounded border border-purple-200">
    <div className="absolute inset-1 grid grid-cols-4 grid-rows-4 gap-0.5">
      {['🍎', '🍊', '🍋', '🍇', '🍓', '🍊', '🫐', '🍋', '🍇', '🍎', '🍓', '🫐', '🍋', '🍇', '🍎', '🍓'].map((candy, i) => (
        <div key={i} className="flex items-center justify-center text-sm">
          {candy}
        </div>
      ))}
    </div>
  </div>
)

const MemoryPreview = () => (
  <div className="w-full h-full relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded border border-indigo-200">
    <div className="absolute inset-1 grid grid-cols-4 grid-rows-4 gap-0.5">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
        <div
          key={i}
          className={`flex items-center justify-center text-sm rounded ${i === 5 || i === 10 ? 'bg-white' : 'bg-indigo-400'}`}
        >
          {i === 5 || i === 10 ? '🍎' : <span className="text-white/50 text-xs">?</span>}
        </div>
      ))}
    </div>
  </div>
)

const DrawingPreview = () => (
  <div className="w-full h-full relative bg-gradient-to-br from-teal-100 to-cyan-100 rounded border border-teal-200 overflow-hidden">
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <path d="M20 60 Q40 20 60 50 T90 40" stroke="#14b8a6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 80 Q30 60 50 70" stroke="#0891b2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="75" cy="25" r="8" fill="#f59e0b" opacity="0.8" />
      <rect x="15" y="25" width="12" height="12" fill="#ec4899" opacity="0.8" rx="2" />
    </svg>
    <div className="absolute bottom-1 right-1 text-lg">🎨</div>
  </div>
)

// Fallback preview for games without custom preview (uses icon)
const IconPreview = ({ icon }) => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300">
    <span className="text-5xl">{icon}</span>
  </div>
)

// Map game type to preview component
const PREVIEW_MAP = {
  'tictactoe': TicTacToePreview,
  'caro_5': GomokuPreview,
  'caro_4': Caro4Preview,
  'snake': SnakePreview,
  'match3': Match3Preview,
  'memory_cards': MemoryPreview,
  'drawing_board': DrawingPreview,
}

// Map game type to route path
const ROUTE_MAP = {
  'tictactoe': '/games/tic-tac-toe',
  'caro_5': '/games/gomoku',
  'caro_4': '/games/caro4',
  'snake': '/games/snake',
  'match3': '/games/match3',
  'memory_cards': '/games/memory',
  'drawing_board': '/games/drawing',
}

const GameCard = ({ game, onClick }) => {
  const PreviewComponent = PREVIEW_MAP[game.type]
  const path = ROUTE_MAP[game.type]
  const isAvailable = game.enabled && path

  return (
    <div
      className={`flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${isAvailable ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      onClick={() => isAvailable && onClick(path)}
    >
      {/* Preview Area */}
      <div className="flex-1 p-4 flex items-center justify-center aspect-square">
        {PreviewComponent ? <PreviewComponent /> : <IconPreview icon={game.icon} />}
      </div>

      {/* Title Bar */}
      <div className="text-center py-3 px-4 bg-secondary/80 border-t border-border">
        <span 
          className="text-sm tracking-wide text-foreground"
          style={{ fontFamily: "'Bungee', cursive" }}
        >
          {game.name.toUpperCase()}
        </span>
        {!isAvailable && (
          <span className="text-[10px] text-muted-foreground ml-1">(Soon)</span>
        )}
      </div>
    </div>
  )
}

const Games = () => {
  const navigate = useNavigate()
  const playClick = useClickSound()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getGames(1, 20)
        if (response.success && response.data?.games) {
          setGames(response.data.games)
        } else {
          setError('Failed to load games')
        }
      } catch (err) {
        console.error('Error fetching games:', err)
        setError(err.message || 'Failed to load games')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const handleGameClick = (path) => {
    if (path) {
      playClick()
      navigate(path)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải danh sách game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-4xl">😢</div>
          <p className="text-red-500 font-medium">Không thể tải danh sách game</p>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full h-full p-8">
      {/* Games Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6 max-w-5xl mx-auto">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={handleGameClick}
          />
        ))}
      </div>
    </div>
  )
}

export default Games