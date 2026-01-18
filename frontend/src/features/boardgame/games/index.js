/**
 * Game Registry
 * Central registry for all games
 */

import TicTacToeGame from './tictactoe/TicTacToeGame';

// Register all games here
export const GAMES = {
  tictactoe: TicTacToeGame,
  // Future games:
  // caro4: Caro4Game,
  // caro5: Caro5Game,
  // memory: MemoryGame,
  // match3: Match3Game,
  // snake: SnakeGame,
  // drawing: DrawingGame,
};

// Get game by key
export const getGame = (gameKey) => GAMES[gameKey] || null;

// Get all game keys
export const getGameKeys = () => Object.keys(GAMES);

export default GAMES;
