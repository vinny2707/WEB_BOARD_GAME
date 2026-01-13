import React from 'react'
import { useNavigate } from 'react-router-dom'

// Game board preview components
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

const ChessPreview = () => (
  <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0 rounded overflow-hidden">
    {[...Array(16)].map((_, i) => {
      const row = Math.floor(i / 4)
      const col = i % 4
      const isLight = (row + col) % 2 === 0
      const piece = (i === 0 || i === 3) ? '♞' :
        (i === 12 || i === 15) ? '♝' :
          (i === 5) ? '♟' :
            (i === 10) ? '♙' : null
      return (
        <div
          key={i}
          className={`flex items-center justify-center text-lg font-bold
            ${isLight ? 'bg-emerald-200' : 'bg-emerald-600'}`}
        >
          {piece && <span className={isLight ? 'text-gray-800' : 'text-white'}>{piece}</span>}
        </div>
      )
    })}
  </div>
)

const CheckersPreview = () => (
  <div className="w-full h-full grid grid-cols-4 grid-rows-4 gap-0 rounded overflow-hidden">
    {[...Array(16)].map((_, i) => {
      const row = Math.floor(i / 4)
      const col = i % 4
      const isLight = (row + col) % 2 === 0
      const hasPiece = !isLight && (row < 2 || row > 1)
      const pieceColor = row < 2 ? 'bg-gray-800' : row > 1 ? 'bg-white border-2 border-gray-300' : null
      return (
        <div
          key={i}
          className={`flex items-center justify-center
            ${isLight ? 'bg-emerald-200' : 'bg-emerald-500'}`}
        >
          {hasPiece && pieceColor && (
            <div className={`w-4 h-4 rounded-full ${pieceColor}`} />
          )}
        </div>
      )
    })}
  </div>
)

const GomokuPreview = () => (
  <div className="w-full h-full relative bg-white rounded border border-gray-200">
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

const Connect4Preview = () => (
  <div className="w-full h-full bg-white rounded border border-gray-200 p-2">
    <div className="grid grid-cols-4 grid-rows-4 gap-1 h-full">
      {[...Array(16)].map((_, i) => {
        const row = Math.floor(i / 4)
        const pieces = [
          [null, null, null, null],
          [null, 'teal', null, null],
          [null, 'teal', 'dark', null],
          ['dark', 'teal', 'dark', 'teal']
        ]
        const piece = pieces[row][i % 4]
        return (
          <div
            key={i}
            className={`rounded-full border ${piece === 'teal' ? 'bg-emerald-400 border-emerald-500' :
              piece === 'dark' ? 'bg-gray-700 border-gray-800' :
                'bg-gray-100 border-gray-200'
              }`}
          />
        )
      })}
    </div>
  </div>
)

// Game data
const games = [
  {
    id: 'tic-tac-toe',
    name: 'TIC TAC TOE',
    preview: TicTacToePreview,
    path: '/games/tic-tac-toe',
    available: true
  },
  {
    id: 'chess',
    name: 'CHESS',
    preview: ChessPreview,
    path: null,
    available: false
  },
  {
    id: 'checkers',
    name: 'CHECKERS',
    preview: CheckersPreview,
    path: null,
    available: false
  },
  {
    id: 'gomoku',
    name: 'CARO 5 HÀNG',
    preview: GomokuPreview,
    path: '/games/gomoku',
    available: true
  },
  {
    id: 'caro4',
    name: 'CARO 4 HÀNG',
    preview: Caro4Preview,
    path: '/games/caro4',
    available: true
  },
  {
    id: 'connect4',
    name: 'CONNECT 4',
    preview: Connect4Preview,
    path: null,
    available: false
  }
]

const GameCard = ({ game, onClick }) => {
  const PreviewComponent = game.preview

  return (
    <div
      className={`flex flex-col bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${game.available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
      onClick={() => game.available && onClick(game.path)}
    >
      {/* Preview Area */}
      <div className="flex-1 p-4 flex items-center justify-center aspect-square">
        <PreviewComponent />
      </div>

      {/* Title Bar */}
      <div className="text-center py-3 px-4 bg-secondary text-sm font-semibold text-foreground border-t border-border">
        <span>{game.name}</span>
        {!game.available && (
          <span className="text-[10px] opacity-70 ml-1">(Soon)</span>
        )}
      </div>
    </div>
  )
}

const Games = () => {
  const navigate = useNavigate()

  const handleGameClick = (path) => {
    if (path) {
      navigate(path)
    }
  }

  return (
    <div className="flex-1 w-full h-full p-8 bg-background">
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