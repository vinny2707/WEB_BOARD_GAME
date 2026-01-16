/**
 * Seed: Friends (Unidirectional)
 * Creates friend relationships between users
 * Note: Only one record per friendship (not bidirectional in DB)
 */

exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('friends').del();

  // Reset ID sequence to 1
  await knex.raw('ALTER SEQUENCE friends_id_seq RESTART WITH 1');

  // Insert friend relationships (UNIDIRECTIONAL)
  // Rule: Only store once per relationship
  await knex('friends').insert([
    // User 2's relationships
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

    // User 3's relationships (removed duplicate with user 2)
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

    // User 4's relationships (removed duplicate with user 3)
    {
      user_id: 4,
      friend_id: 10,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '12 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '12 days'")
    },

    // User 5's relationships (removed duplicates)
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

    // User 6's relationships (removed duplicates)
    {
      user_id: 6,
      friend_id: 8,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '16 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '16 days'")
    },

    // User 7's relationships (removed duplicates)
    {
      user_id: 7,
      friend_id: 10,
      status: 'pending',
      created_at: knex.raw("NOW() - INTERVAL '3 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '3 days'")
    },

    // User 8's relationships (removed duplicates)
    {
      user_id: 8,
      friend_id: 9,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '11 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '11 days'")
    },

    // User 9's relationships (removed duplicates)
    {
      user_id: 9,
      friend_id: 10,
      status: 'accepted',
      created_at: knex.raw("NOW() - INTERVAL '8 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '8 days'")
    },

    // Blocked relationships
    {
      user_id: 6,
      friend_id: 11, // Banned user
      status: 'blocked',
      created_at: knex.raw("NOW() - INTERVAL '5 days'"),
      updated_at: knex.raw("NOW() - INTERVAL '5 days'")
    }
  ]);
};
