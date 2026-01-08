/**
 * Seed: Friends
 * Creates friend relationships between users
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('friends').del();

  // Insert friend relationships
  await knex('friends').insert([
    // John's friends (user_id: 2)
    {
      user_id: 2,
      friend_id: 3,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '30 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '30 days'")
    },
    {
      user_id: 2,
      friend_id: 5,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '25 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '25 days'")
    },
    {
      user_id: 2,
      friend_id: 6,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '20 days'")
    },
    {
      user_id: 2,
      friend_id: 8,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '2 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },

    // Jane's friends (user_id: 3)
    {
      user_id: 3,
      friend_id: 2,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '30 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '30 days'")
    },
    {
      user_id: 3,
      friend_id: 4,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '28 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '28 days'")
    },
    {
      user_id: 3,
      friend_id: 7,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '15 days'")
    },
    {
      user_id: 3,
      friend_id: 9,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '10 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '10 days'")
    },

    // Mike's friends (user_id: 4) - Moderator
    {
      user_id: 4,
      friend_id: 3,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '28 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '28 days'")
    },
    {
      user_id: 4,
      friend_id: 5,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '22 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '22 days'")
    },
    {
      user_id: 4,
      friend_id: 10,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '12 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '12 days'")
    },

    // Sarah's friends (user_id: 5)
    {
      user_id: 5,
      friend_id: 2,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '25 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '25 days'")
    },
    {
      user_id: 5,
      friend_id: 4,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '22 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '22 days'")
    },
    {
      user_id: 5,
      friend_id: 6,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '18 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '18 days'")
    },
    {
      user_id: 5,
      friend_id: 7,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '14 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '14 days'")
    },
    {
      user_id: 5,
      friend_id: 9,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '1 day'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },

    // David's friends (user_id: 6)
    {
      user_id: 6,
      friend_id: 2,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '20 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '20 days'")
    },
    {
      user_id: 6,
      friend_id: 5,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '18 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '18 days'")
    },
    {
      user_id: 6,
      friend_id: 8,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '16 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '16 days'")
    },

    // Emily's friends (user_id: 7)
    {
      user_id: 7,
      friend_id: 3,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '15 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '15 days'")
    },
    {
      user_id: 7,
      friend_id: 5,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '14 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '14 days'")
    },
    {
      user_id: 7,
      friend_id: 10,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '3 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },

    // Robert's friends (user_id: 8)
    {
      user_id: 8,
      friend_id: 2,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '2 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '2 days'")
    },
    {
      user_id: 8,
      friend_id: 6,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '16 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '16 days'")
    },
    {
      user_id: 8,
      friend_id: 9,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '11 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '11 days'")
    },

    // Lisa's friends (user_id: 9)
    {
      user_id: 9,
      friend_id: 3,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '10 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '10 days'")
    },
    {
      user_id: 9,
      friend_id: 5,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '1 day'"),
      updated_at: knex.raw("NOW() - INTERVAL '1 day'")
    },
    {
      user_id: 9,
      friend_id: 8,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '11 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '11 days'")
    },
    {
      user_id: 9,
      friend_id: 10,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '8 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '8 days'")
    },

    // Chris's friends (user_id: 10)
    {
      user_id: 10,
      friend_id: 4,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '12 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '12 days'")
    },
    {
      user_id: 10,
      friend_id: 7,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '3 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },
    {
      user_id: 10,
      friend_id: 9,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '8 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '8 days'")
    },

    // Some rejected/blocked relationships
    {
      user_id: 6,
      friend_id: 11, // Banned user
      status: 'blocked',
      created_at: knex.raw("NOW() - INTERVAL '5 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '5 days'")
    },
    {
      user_id: 7,
      friend_id: 11, // Banned user
      status: 'rejected',
      created_at: knex.raw("NOW() - INTERVAL '7 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '6 days'")
    }
  ]);
};
