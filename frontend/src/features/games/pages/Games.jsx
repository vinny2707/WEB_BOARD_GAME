import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'

// Game data
const games = [
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Cờ caro 3x3 kinh điển',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    textColor: 'text-emerald-700',
    icon: '⭕',
    tag: 'HOT',
    tagColor: 'bg-orange-500',
    path: '/games/tic-tac-toe',
    gridSize: '3x3'
  },
  {
    id: 'chess',
    name: 'Cờ Vua',
    description: 'Chess - Trò chơi chiến thuật',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    textColor: 'text-amber-700',
    icon: '♟️',
    tag: 'COMING SOON',
    tagColor: 'bg-gray-400',
    path: null,
    gridSize: '8x8'
  },
  {
    id: 'checkers',
    name: 'Cờ Đam',
    description: 'Checkers - Cờ nhảy đơn giản',
    color: 'from-red-400 to-rose-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-100',
    textColor: 'text-red-700',
    icon: '⚫',
    tag: 'COMING SOON',
    tagColor: 'bg-gray-400',
    path: null,
    gridSize: '8x8'
  },
  {
    id: 'gomoku',
    name: 'Cờ Caro',
    description: 'Gomoku - Caro 15x15',
    color: 'from-purple-400 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
    textColor: 'text-purple-700',
    icon: '🎯',
    tag: 'COMING SOON',
    tagColor: 'bg-gray-400',
    path: null,
    gridSize: '15x15'
  }
]

const GameCard = ({ game, onClick }) => {
  const isAvailable = game.path !== null

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-4 cursor-pointer
        transition-all duration-300 ease-out
        ${game.bgColor}
        ${isAvailable
          ? 'hover:scale-105 hover:shadow-xl active:scale-100'
          : 'opacity-70 cursor-not-allowed'
        }
      `}
      onClick={() => isAvailable && onClick(game.path)}
    >
      {/* Tag */}
      <span className={`
        absolute top-3 right-3 px-2 py-1
        text-[10px] font-bold text-white rounded-full
        ${game.tagColor}
      `}>
        {game.tag}
      </span>

      {/* Content */}
      <div className="flex flex-col h-full">
        <h3 className={`text-lg font-bold ${game.textColor} mb-1`}>
          {game.name}
        </h3>

        <p className={`text-xs ${game.textColor} opacity-70 mb-4`}>
          {game.description}
        </p>

        {/* Game Preview */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div className={`
            text-6xl transform transition-transform
            ${isAvailable ? 'group-hover:scale-110' : ''}
          `}>
            {game.icon}
          </div>
        </div>

        {/* Grid Size */}
        <div className={`text-xs ${game.textColor} opacity-50 text-center`}>
          Bàn {game.gridSize}
        </div>
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
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Gamepad2 className="w-6 h-6 text-emerald-500" />
          <h1 className="text-2xl font-bold text-foreground">Chọn Game</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Chọn một trò chơi để bắt đầu
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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