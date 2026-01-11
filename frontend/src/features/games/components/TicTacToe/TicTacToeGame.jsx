import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Lightbulb, Settings, Home } from 'lucide-react';
import TicTacToeBoard from './TicTacToeBoard';
import { findBestMove, getHint, checkWinner, isDraw } from './TicTacToeAI';

const DIFFICULTY_LABELS = {
  easy: 'Dễ',
  medium: 'Trung Bình',
  hard: 'Khó'
};

// Player Card Component
const PlayerCard = ({ name, symbol, avatar, isActive, timer, score, isLeft }) => (
  <div className={`flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl border-2 transition-all min-w-[140px]
    ${isActive ? 'border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]' : 'border-transparent'}
    ${isLeft ? '' : 'flex-row-reverse text-right'}`}
  >
    <div className="w-10 h-10 flex items-center justify-center bg-card rounded-full text-xl shadow-sm">
      {avatar}
    </div>
    <div className="flex-1">
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="font-mono text-xs text-muted-foreground">{timer}</div>
    </div>
    <div className={`w-7 h-7 flex items-center justify-center rounded-md text-base font-bold
      ${symbol === 'X' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-600'}`}
    >
      {symbol}
    </div>
  </div>
);

// Score Display
const ScoreDisplay = ({ playerScore, aiScore }) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-foreground rounded-full">
    <span className="font-mono text-xl font-bold text-emerald-500">{playerScore}</span>
    <span className="font-bold text-background">-</span>
    <span className="font-mono text-xl font-bold text-orange-500">{aiScore}</span>
  </div>
);

const TicTacToeGame = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [playerTime, setPlayerTime] = useState(0);
  const [aiTime, setAiTime] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [hintCell, setHintCell] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Timer for current player
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      if (isXNext && !isAIThinking) {
        setPlayerTime(prev => prev + 1);
      } else if (!isXNext) {
        setAiTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isXNext, gameStatus, isAIThinking]);

  // AI makes a move
  useEffect(() => {
    if (!isXNext && gameStatus === 'playing' && !isAIThinking) {
      setIsAIThinking(true);
      setHintCell(null);

      const timer = setTimeout(() => {
        const aiMove = findBestMove(board, difficulty);
        if (aiMove !== -1) {
          makeMove(aiMove, 'O');
        }
        setIsAIThinking(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isXNext, gameStatus, board, difficulty]);

  const makeMove = useCallback((index, player) => {
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);
    setMoveHistory(prev => [...prev, { index, player }]);

    const winnerMark = checkWinner(newBoard);
    if (winnerMark) {
      setWinner(winnerMark);
      setGameStatus('win');
      setScore(prev => ({
        ...prev,
        [winnerMark === 'X' ? 'player' : 'ai']: prev[winnerMark === 'X' ? 'player' : 'ai'] + 1
      }));
    } else if (isDraw(newBoard)) {
      setGameStatus('draw');
    } else {
      setIsXNext(player === 'O');
    }
  }, [board]);

  const handleCellClick = useCallback((index) => {
    if (!isXNext || board[index] || gameStatus !== 'playing' || isAIThinking) return;
    setHintCell(null);
    makeMove(index, 'X');
  }, [board, isXNext, gameStatus, isAIThinking, makeMove]);

  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setPlayerTime(0);
    setAiTime(0);
    setHintCell(null);
    setIsAIThinking(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (moveHistory.length < 2 || gameStatus !== 'playing' || isAIThinking) return;

    const newHistory = [...moveHistory];
    const newBoard = [...board];

    // Undo AI move + player move
    newBoard[newHistory.pop().index] = null;
    newBoard[newHistory.pop().index] = null;

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setIsXNext(true);
    setHintCell(null);
  }, [board, moveHistory, gameStatus, isAIThinking]);

  const handleHint = useCallback(() => {
    if (gameStatus !== 'playing' || isAIThinking) return;
    const hint = getHint(board);
    if (hint !== -1) {
      setHintCell(hint);
      setTimeout(() => setHintCell(null), 3000);
    }
  }, [board, gameStatus, isAIThinking]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinningLine = () => {
    if (!winner) return null;
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return line;
      }
    }
    return null;
  };

  const getStatusMessage = () => {
    if (isAIThinking) return 'Đang suy nghĩ...';
    if (gameStatus === 'win') return winner === 'X' ? '🎉 Bạn thắng!' : '🤖 Máy thắng!';
    if (gameStatus === 'draw') return '🤝 Hòa!';
    return isXNext ? 'Lượt của bạn' : 'Lượt của máy';
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-background">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          onClick={() => navigate('/games')}
        >
          <Home size={20} />
        </button>
        <div className="text-lg font-bold tracking-wider text-foreground">TIC TAC TOE</div>
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 bg-card border-b border-border">
          <div className="text-sm font-semibold text-foreground mb-2">Độ khó</div>
          <div className="flex gap-2">
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`flex-1 py-2 px-4 bg-secondary border-2 rounded-lg text-sm font-medium transition-all
                  ${difficulty === key
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'text-muted-foreground border-transparent hover:border-emerald-500'}`}
                onClick={() => { setDifficulty(key); handleReset(); setShowSettings(false); }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Bar */}
      <div className="flex items-center justify-center gap-4 p-4 bg-card">
        <PlayerCard
          name="Bạn"
          symbol="X"
          avatar="👤"
          isActive={isXNext && gameStatus === 'playing'}
          timer={formatTime(playerTime)}
          score={score.player}
          isLeft={true}
        />

        <ScoreDisplay playerScore={score.player} aiScore={score.ai} />

        <PlayerCard
          name="Paper Man"
          symbol="O"
          avatar="🤖"
          isActive={!isXNext && gameStatus === 'playing'}
          timer={formatTime(aiTime)}
          score={score.ai}
          isLeft={false}
        />
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <TicTacToeBoard
          board={board}
          onCellClick={handleCellClick}
          winningLine={getWinningLine()}
          hintCell={hintCell}
          disabled={!isXNext || isAIThinking || gameStatus !== 'playing'}
        />

        {/* Status Message */}
        <div className={`text-base font-medium px-4 py-2 rounded-full shadow-sm
          ${gameStatus !== 'playing'
            ? 'text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            : 'bg-card text-foreground'}`}
        >
          {getStatusMessage()}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-card border-t border-border">
        <button
          className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleUndo}
          disabled={moveHistory.length < 2 || gameStatus !== 'playing' || isAIThinking}
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>

        <button
          className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-amber-500 transition-all hover:bg-amber-500/15 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={handleHint}
          disabled={gameStatus !== 'playing' || isAIThinking}
        >
          <Lightbulb size={18} />
          <span>Gợi ý</span>
        </button>

        {gameStatus !== 'playing' && (
          <button
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 rounded-xl text-sm font-medium text-white transition-all hover:bg-emerald-600"
            onClick={handleReset}
          >
            <RotateCcw size={18} />
            <span>Chơi lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
