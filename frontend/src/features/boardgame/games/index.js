/**
 * Game Registry
 * Central registry for all games
 */

import TicTacToeGame from './tictactoe/TicTacToeGame';
import SnakeGame from './snake/SnakeGame';
import Caro4Game from './caro4/Caro4Game';
import Caro5Game from './caro5/Caro5Game';
import Match3Game from './match3/Match3Game';

// Register all games here
export const GAMES = {
  tictactoe: TicTacToeGame,
  snake: SnakeGame,
  caro4: Caro4Game,
  caro5: Caro5Game,
  match3: Match3Game,
  // Future games:
  // memory: MemoryGame,
  // drawing: DrawingGame,
};

// Get game by key
export const getGame = (gameKey) => GAMES[gameKey] || null;

// Get all game keys
export const getGameKeys = () => Object.keys(GAMES);

export default GAMES;
