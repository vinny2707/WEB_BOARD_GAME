/**
 * Seed: Game Sessions
 * Creates sample game session records
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('game_sessions').del();

  // Insert game sessions
  const sessions = [
    // John's sessions (user_id: 2)
    {
      user_id: 2,
      game_id: 1, // Chess
      game_state: JSON.stringify({
        board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
        turn: 'white',
        moves: ['e4', 'e5', 'Nf3', 'Nc6'],
        captured: []
      }),
      result: 'win',
      score: 1200,
      moves_count: 42,
      time_elapsed: 1800, // 30 minutes
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '2 days'"),
      ended_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'")
    },
    {
      user_id: 2,
      game_id: 3, // Gomoku
      game_state: JSON.stringify({
        board: Array(15).fill(Array(15).fill(null)),
        lastMove: { row: 7, col: 7 },
        moveHistory: []
      }),
      result: 'loss',
      score: 800,
      moves_count: 35,
      time_elapsed: 900,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '1 day'"),
      ended_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'")
    },
    {
      user_id: 2,
      game_id: 4, // Tic Tac Toe
      game_state: JSON.stringify({
        board: [['X', 'O', 'X'], ['O', 'X', 'O'], ['O', 'X', 'X']],
        winner: 'X'
      }),
      result: 'win',
      score: 100,
      moves_count: 9,
      time_elapsed: 120,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '5 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '5 hours' + INTERVAL '2 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '5 hours' + INTERVAL '2 minutes'")
    },

    // Jane's sessions (user_id: 3)
    {
      user_id: 3,
      game_id: 1, // Chess
      game_state: JSON.stringify({
        board: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R',
        turn: 'black',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6']
      }),
      result: 'win',
      score: 1350,
      moves_count: 55,
      time_elapsed: 2400,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '3 days'"),
      ended_at: knex.raw("NOW() - INTERVAL '3 days' + INTERVAL '40 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '3 days' + INTERVAL '40 minutes'")
    },
    {
      user_id: 3,
      game_id: 2, // Checkers
      game_state: JSON.stringify({
        board: Array(8).fill(Array(8).fill(null)),
        pieces: { black: 8, red: 6 }
      }),
      result: 'win',
      score: 950,
      moves_count: 48,
      time_elapsed: 1500,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '1 day'"),
      ended_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '25 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '25 minutes'")
    },

    // Mike's sessions (user_id: 4)
    {
      user_id: 4,
      game_id: 5, // Connect Four
      game_state: JSON.stringify({
        board: Array(6).fill(Array(7).fill(null)),
        currentPlayer: 'red'
      }),
      result: 'draw',
      score: 500,
      moves_count: 42,
      time_elapsed: 600,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '12 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '12 hours' + INTERVAL '10 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '12 hours' + INTERVAL '10 minutes'")
    },
    {
      user_id: 4,
      game_id: 3, // Gomoku
      game_state: JSON.stringify({
        board: Array(15).fill(Array(15).fill(null)),
        lastMove: null
      }),
      result: null,
      score: 0,
      moves_count: 15,
      time_elapsed: 450,
      status: 'in_progress',
      started_at: knex.raw("NOW() - INTERVAL '1 hour'"),
      ended_at: null,
      saved_at: knex.raw("NOW() - INTERVAL '5 minutes'")
    },

    // Sarah's sessions (user_id: 5)
    {
      user_id: 5,
      game_id: 6, // Reversi
      game_state: JSON.stringify({
        board: Array(8).fill(Array(8).fill(null)),
        blackPieces: 35,
        whitePieces: 29
      }),
      result: 'win',
      score: 1100,
      moves_count: 64,
      time_elapsed: 1800,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '2 days'"),
      ended_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'")
    },
    {
      user_id: 5,
      game_id: 1, // Chess
      game_state: JSON.stringify({
        board: 'incomplete_game',
        turn: 'white'
      }),
      result: null,
      score: 0,
      moves_count: 8,
      time_elapsed: 240,
      status: 'abandoned',
      started_at: knex.raw("NOW() - INTERVAL '6 hours'"),
      ended_at: null,
      saved_at: knex.raw("NOW() - INTERVAL '5 hours'")
    },

    // David's sessions (user_id: 6)
    {
      user_id: 6,
      game_id: 4, // Tic Tac Toe
      game_state: JSON.stringify({
        board: [['X', 'O', null], ['O', 'X', null], [null, null, 'X']],
        winner: 'X'
      }),
      result: 'win',
      score: 100,
      moves_count: 7,
      time_elapsed: 90,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '8 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '8 hours' + INTERVAL '90 seconds'"),
      saved_at: knex.raw("NOW() - INTERVAL '8 hours' + INTERVAL '90 seconds'")
    },

    // Emily's sessions (user_id: 7)
    {
      user_id: 7,
      game_id: 1, // Chess - Fast win (Speed Demon achievement)
      game_state: JSON.stringify({
        board: 'checkmate_position',
        turn: 'black'
      }),
      result: 'win',
      score: 1500,
      moves_count: 15,
      time_elapsed: 280, // Less than 5 minutes
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '10 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '10 hours' + INTERVAL '280 seconds'"),
      saved_at: knex.raw("NOW() - INTERVAL '10 hours' + INTERVAL '280 seconds'")
    },

    // Robert's sessions (user_id: 8)
    {
      user_id: 8,
      game_id: 2, // Checkers
      game_state: JSON.stringify({
        board: Array(8).fill(Array(8).fill(null))
      }),
      result: 'loss',
      score: 600,
      moves_count: 38,
      time_elapsed: 1200,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '4 days'"),
      ended_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '20 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '20 minutes'")
    },

    // Lisa's sessions (user_id: 9)
    {
      user_id: 9,
      game_id: 3, // Gomoku
      game_state: JSON.stringify({
        board: Array(15).fill(Array(15).fill(null)),
        winner: 'black'
      }),
      result: 'win',
      score: 1050,
      moves_count: 41,
      time_elapsed: 1350,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '1 day'"),
      ended_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '22 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '22 minutes'")
    },

    // Chris's sessions (user_id: 10)
    {
      user_id: 10,
      game_id: 5, // Connect Four
      game_state: JSON.stringify({
        board: Array(6).fill(Array(7).fill(null)),
        winner: 'yellow'
      }),
      result: 'win',
      score: 850,
      moves_count: 28,
      time_elapsed: 480,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '3 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '8 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '8 minutes'")
    }
  ];

  await knex('game_sessions').insert(sessions);
};
