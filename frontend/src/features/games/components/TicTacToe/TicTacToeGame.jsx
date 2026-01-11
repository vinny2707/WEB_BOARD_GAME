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
  <div className={`player-card ${isActive ? 'active' : ''} ${isLeft ? 'left' : 'right'}`}>
    <div className="player-avatar">
      {avatar}
    </div>
    <div className="player-info">
      <div className="player-name">{name}</div>
      <div className="player-timer">{timer}</div>
    </div>
    <div className={`player-symbol ${symbol.toLowerCase()}`}>
      {symbol}
    </div>
  </div>
);

// Score Display
const ScoreDisplay = ({ playerScore, aiScore }) => (
  <div className="score-center">
    <span className="score-value player">{playerScore}</span>
    <span className="score-divider">-</span>
    <span className="score-value ai">{aiScore}</span>
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
    <div className="papergames-layout">
      {/* Top Navigation */}
      <div className="game-topbar">
        <button className="topbar-btn" onClick={() => navigate('/games')}>
          <Home size={20} />
        </button>
        <div className="topbar-title">TIC TAC TOE</div>
        <button className="topbar-btn" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-title">Độ khó</div>
          <div className="difficulty-options">
            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`diff-option ${difficulty === key ? 'active' : ''}`}
                onClick={() => { setDifficulty(key); handleReset(); setShowSettings(false); }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player Bar */}
      <div className="players-bar">
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
      <div className="game-area">
        <TicTacToeBoard
          board={board}
          onCellClick={handleCellClick}
          winningLine={getWinningLine()}
          hintCell={hintCell}
          disabled={!isXNext || isAIThinking || gameStatus !== 'playing'}
        />

        {/* Status Message */}
        <div className={`game-message ${gameStatus !== 'playing' ? 'ended' : ''}`}>
          {getStatusMessage()}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="game-actions">
        <button
          className="action-btn"
          onClick={handleUndo}
          disabled={moveHistory.length < 2 || gameStatus !== 'playing' || isAIThinking}
        >
          <ArrowLeft size={18} />
          <span>Quay lại</span>
        </button>

        <button
          className="action-btn hint"
          onClick={handleHint}
          disabled={gameStatus !== 'playing' || isAIThinking}
        >
          <Lightbulb size={18} />
          <span>Gợi ý</span>
        </button>

        {gameStatus !== 'playing' && (
          <button className="action-btn primary" onClick={handleReset}>
            <RotateCcw size={18} />
            <span>Chơi lại</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TicTacToeGame;
