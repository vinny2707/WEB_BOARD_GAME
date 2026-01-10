import React, { useState, useCallback, useEffect } from 'react';
import TicTacToeBoard from './TicTacToeBoard';
import GameHeader from '../GameHeader';
import GameControls from '../GameControls';
import { findBestMove, getHint, checkWinner, isDraw } from './TicTacToeAI';

const DIFFICULTY_LABELS = {
  easy: 'Dễ',
  medium: 'Trung Bình',
  hard: 'Khó'
};

const TicTacToeGame = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'win', 'draw'
  const [winner, setWinner] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameTime, setGameTime] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [hintCell, setHintCell] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // AI makes a move
  useEffect(() => {
    if (!isXNext && gameStatus === 'playing' && !isAIThinking) {
      setIsAIThinking(true);
      setHintCell(null);

      // Add delay for better UX
      const timer = setTimeout(() => {
        const aiMove = findBestMove(board, difficulty);
        if (aiMove !== -1) {
          makeMove(aiMove, 'O');
        }
        setIsAIThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isXNext, gameStatus, board, difficulty]);

  // Make a move on the board
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

  // Handle player cell click
  const handleCellClick = useCallback((index) => {
    // Only allow player (X) to click
    if (!isXNext || board[index] || gameStatus !== 'playing' || isAIThinking) return;

    setHintCell(null);
    makeMove(index, 'X');
  }, [board, isXNext, gameStatus, isAIThinking, makeMove]);

  // Reset game
  const handleReset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setGameTime(0);
    setHintCell(null);
    setIsAIThinking(false);
  }, []);

  // Undo last 2 moves (player + AI)
  const handleUndo = useCallback(() => {
    if (moveHistory.length < 2 || gameStatus !== 'playing' || isAIThinking) return;

    const newHistory = [...moveHistory];
    const newBoard = [...board];

    // Undo AI move
    const aiMove = newHistory.pop();
    newBoard[aiMove.index] = null;

    // Undo player move
    const playerMove = newHistory.pop();
    newBoard[playerMove.index] = null;

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setIsXNext(true);
    setHintCell(null);
  }, [board, moveHistory, gameStatus, isAIThinking]);

  // Show hint
  const handleHint = useCallback(() => {
    if (gameStatus !== 'playing' || isAIThinking) return;

    const hint = getHint(board);
    if (hint !== -1 && hint !== null && hint !== undefined) {
      setHintCell(hint);
      // Auto-hide hint after 3 seconds
      setTimeout(() => setHintCell(null), 3000);
    }
  }, [board, gameStatus, isAIThinking]);

  // Change difficulty
  const handleDifficultyChange = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    handleReset();
  }, [handleReset]);

  // Get current score for display
  const getCurrentScore = () => {
    return score.player * 100;
  };

  // Get status message
  const getStatusMessage = () => {
    if (isAIThinking) return 'Máy đang suy nghĩ...';
    if (gameStatus === 'win') {
      return winner === 'X' ? '🎉 BẠN THẮNG!' : '🤖 MÁY THẮNG!';
    }
    if (gameStatus === 'draw') return '🤝 HÒA!';
    return isXNext ? 'Lượt của bạn (X)' : 'Lượt của máy (O)';
  };

  // Get winning line
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

  return (
    <div className="game-container">
      <GameHeader
        title="TIC-TAC-TOE"
        score={getCurrentScore()}
        time={gameTime}
        onTimeUpdate={setGameTime}
        isPlaying={gameStatus === 'playing'}
      />

      {/* Difficulty selector */}
      <div className="difficulty-selector">
        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`difficulty-btn ${difficulty === key ? 'active' : ''}`}
            onClick={() => handleDifficultyChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Score display */}
      <div className="score-display">
        <span className="score-item player">Bạn: {score.player}</span>
        <span className="score-separator">-</span>
        <span className="score-item ai">Máy: {score.ai}</span>
      </div>

      <div className="game-board-wrapper">
        <TicTacToeBoard
          board={board}
          onCellClick={handleCellClick}
          winningLine={getWinningLine()}
          hintCell={hintCell}
          disabled={!isXNext || isAIThinking || gameStatus !== 'playing'}
        />

        <div className={`game-status ${isAIThinking ? 'thinking' : ''}`}>
          {getStatusMessage()}
        </div>
      </div>

      <GameControls
        onUndo={handleUndo}
        onReset={handleReset}
        onHint={handleHint}
        canUndo={moveHistory.length >= 2 && gameStatus === 'playing' && !isAIThinking && isXNext}
        gameStatus={gameStatus}
      />
    </div>
  );
};

export default TicTacToeGame;
