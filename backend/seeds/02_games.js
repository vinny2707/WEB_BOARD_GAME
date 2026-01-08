/**
 * Seed: Games
 * Creates various board games with configurations
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('games').del();

  // Insert games
  await knex('games').insert([
    {
      id: 1,
      name: 'Chess',
      type: 'chess',
      description: 'Classic strategy board game played on an 8x8 checkered board. Capture the opponent\'s king to win.',
      rows: 8,
      cols: 8,
      enabled: true,
      icon: '♟️',
      rules: 'Each piece has unique movement rules. The goal is to checkmate the opponent\'s king.',
      settings: JSON.stringify({
        timeControl: ['5+0', '10+0', '15+10', '30+0'],
        allowUndo: false,
        allowHints: true,
        difficulty: ['beginner', 'intermediate', 'advanced', 'expert']
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      name: 'Checkers',
      type: 'checkers',
      description: 'Traditional board game where players capture opponent pieces by jumping over them.',
      rows: 8,
      cols: 8,
      enabled: true,
      icon: '⚫',
      rules: 'Move diagonally and capture by jumping. King pieces can move backwards.',
      settings: JSON.stringify({
        forcedCapture: true,
        allowFlyingKings: false,
        boardStyle: 'classic'
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 3,
      name: 'Gomoku (Five in a Row)',
      type: 'gomoku',
      description: 'Strategic board game where players try to get five pieces in a row horizontally, vertically, or diagonally.',
      rows: 15,
      cols: 15,
      enabled: true,
      icon: '⚪',
      rules: 'Players alternate placing pieces on the board. First to get 5 in a row wins.',
      settings: JSON.stringify({
        winCondition: 5,
        allowOverline: false,
        openingRules: ['standard', 'pro', 'swap', 'swap2']
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 4,
      name: 'Tic Tac Toe',
      type: 'tictactoe',
      description: 'Simple classic game where players try to get three in a row.',
      rows: 3,
      cols: 3,
      enabled: true,
      icon: '❌',
      rules: 'Players alternate placing X and O. First to get 3 in a row wins.',
      settings: JSON.stringify({
        allowDraw: true,
        aiDifficulty: ['easy', 'medium', 'hard']
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 5,
      name: 'Connect Four',
      type: 'connect_four',
      description: 'Vertical board game where players drop pieces to connect four in a row.',
      rows: 6,
      cols: 7,
      enabled: true,
      icon: '🔴',
      rules: 'Drop pieces from the top. Pieces fall to the lowest available space. Connect 4 to win.',
      settings: JSON.stringify({
        winCondition: 4,
        gravity: true,
        allowDiagonal: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 6,
      name: 'Reversi (Othello)',
      type: 'reversi',
      description: 'Strategy game where players flip opponent pieces by trapping them between their own pieces.',
      rows: 8,
      cols: 8,
      enabled: true,
      icon: '⚫',
      rules: 'Place pieces to trap opponent pieces. Trapped pieces are flipped to your color.',
      settings: JSON.stringify({
        showValidMoves: true,
        allowPass: true,
        countPieces: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 7,
      name: 'Chinese Checkers',
      type: 'chinese_checkers',
      description: 'Star-shaped board game where players race to move all pieces to the opposite corner.',
      rows: 17,
      cols: 17,
      enabled: false,
      icon: '🌟',
      rules: 'Move pieces by jumping over others. First to move all pieces to opposite corner wins.',
      settings: JSON.stringify({
        playerCount: [2, 3, 4, 6],
        allowJumpChains: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Reset sequence
  await knex.raw('SELECT setval(\'games_id_seq\', (SELECT MAX(id) FROM games))');
};
