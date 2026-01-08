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
      game_id: 1, // Caro Hàng 5
      game_state: JSON.stringify({
        board: Array(15).fill(Array(15).fill(null)),
        lastMove: { row: 7, col: 8 },
        playerO: 'win',
        moveHistory: []
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
      game_id: 4, // Rắn Săn Mồi
      game_state: JSON.stringify({
        snake: [[10,10], [10,9], [10,8]],
        food: [15, 15],
        direction: 'right',
        score: 380
      }),
      result: 'loss',
      score: 380,
      moves_count: 95,
      time_elapsed: 900,
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '1 day'"),
      ended_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'"),
      saved_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'")
    },
    {
      user_id: 2,
      game_id: 3, // Tic Tac Toe
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
      game_id: 2, // Caro Hàng 4
      game_state: JSON.stringify({
        board: Array(10).fill(Array(10).fill(null)),
        lastMove: { row: 5, col: 5 },
        winner: 'X'
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
      game_id: 5, // Ghép Hàng 3
      game_state: JSON.stringify({
        grid: Array(8).fill(Array(8).fill(0)),
        score: 9500,
        moves: 20,
        candiesCleared: 45
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
      game_id: 6, // Cờ Trí Nhớ
      game_state: JSON.stringify({
        grid: Array(4).fill(Array(4).fill({ revealed: false, matched: false })),
        matchedPairs: 6,
        moves: 42
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
      game_id: 1, // Caro Hàng 5 - in progress
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
      game_id: 7, // Bảng Vẽ Tự Do
      game_state: JSON.stringify({
        canvas: 'base64_image_data',
        strokes: 150,
        timeSpent: 1800,
        saved: true
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
      game_id: 2, // Caro Hàng 4 - Abandoned
      game_state: JSON.stringify({
        board: Array(10).fill(Array(10).fill(null)),
        lastMove: { row: 2, col: 3 }
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
      game_id: 3, // Tic Tac Toe
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

    // Emily's sessions (user_id: 7) - Fast win (Speed Demon achievement)
    {
      user_id: 7,
      game_id: 6, // Cờ Trí Nhớ - Fast complete
      game_state: JSON.stringify({
        grid: Array(4).fill(Array(4).fill({ matched: true })),
        matchedPairs: 8,
        moves: 12
      }),
      result: 'win',
      score: 1500,
      moves_count: 12,
      time_elapsed: 58, // Chưa đến 1 phút - Bộ Nhớ Siêu Phàm achievement
      status: 'completed',
      started_at: knex.raw("NOW() - INTERVAL '10 hours'"),
      ended_at: knex.raw("NOW() - INTERVAL '10 hours' + INTERVAL '58 seconds'"),
      saved_at: knex.raw("NOW() - INTERVAL '10 hours' + INTERVAL '58 seconds'")
    },

    // Robert's sessions (user_id: 8)
    {
      user_id: 8,
      game_id: 4, // Rắn Săn Mồi
      game_state: JSON.stringify({
        snake: [[5,5], [5,4], [5,3], [5,2]],
        food: [10, 10],
        finalLength: 8,
        score: 250
      }),
      result: 'loss',
      score: 250,
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
      game_id: 1, // Caro Hàng 5
      game_state: JSON.stringify({
        board: Array(15).fill(Array(15).fill(null)),
        lastMove: { row: 7, col: 8 },
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
      game_id: 5, // Ghép Hàng 3
      game_state: JSON.stringify({
        grid: Array(8).fill(Array(8).fill(0)),
        score: 8500,
        moves: 15,
        combo: 5
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
