/**
 * Seed: Messages
 * Creates sample messages between friends
 */

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('messages').del();

  // Insert messages
  await knex('messages').insert([
    // Conversation between John (2) and Jane (3)
    {
      sender_id: 2,
      receiver_id: 3,
      content: 'Hey Jane! Want to play a game of chess later?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '5 days'"),
      read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '10 minutes'")
    },
    {
      sender_id: 3,
      receiver_id: 2,
      content: 'Sure! I\'d love to. What time works for you?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'")
    },
    {
      sender_id: 2,
      receiver_id: 3,
      content: 'How about 7 PM tonight?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '25 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'")
    },
    {
      sender_id: 3,
      receiver_id: 2,
      content: 'Perfect! See you then 😊',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '35 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '37 minutes'")
    },

    // Conversation between Sarah (5) and Emily (7)
    {
      sender_id: 5,
      receiver_id: 7,
      content: 'Great game yesterday! You\'re getting really good at Reversi.',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '2 days'"),
      read_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'")
    },
    {
      sender_id: 7,
      receiver_id: 5,
      content: 'Thanks! I\'ve been practicing a lot. Want a rematch?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'")
    },
    {
      sender_id: 5,
      receiver_id: 7,
      content: 'Absolutely! I won\'t go easy on you this time 😄',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '12 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'")
    },

    // Conversation between Mike (4) and Chris (10)
    {
      sender_id: 4,
      receiver_id: 10,
      content: 'Hey Chris, I noticed you\'ve been playing a lot of Connect Four lately.',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '1 day'"),
      read_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '30 minutes'")
    },
    {
      sender_id: 10,
      receiver_id: 4,
      content: 'Yeah! It\'s my favorite game. Do you play?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '35 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '40 minutes'")
    },
    {
      sender_id: 4,
      receiver_id: 10,
      content: 'I do! We should have a tournament sometime.',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '42 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '45 minutes'")
    },
    {
      sender_id: 10,
      receiver_id: 4,
      content: 'That sounds awesome! Let me know when you\'re free.',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '1 day' + INTERVAL '50 minutes'"),
      read_at: null
    },

    // Conversation between David (6) and Robert (8)
    {
      sender_id: 6,
      receiver_id: 8,
      content: 'Did you see the new achievement system? There are some cool challenges!',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '3 hours'"),
      read_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '20 minutes'")
    },
    {
      sender_id: 8,
      receiver_id: 6,
      content: 'Yeah! I\'m trying to get the Speed Demon achievement. So hard!',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '25 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '27 minutes'")
    },
    {
      sender_id: 6,
      receiver_id: 8,
      content: 'Keep practicing! You\'ll get it. I believe in you 💪',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '30 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '3 hours' + INTERVAL '32 minutes'")
    },

    // Conversation between Lisa (9) and Jane (3)
    {
      sender_id: 9,
      receiver_id: 3,
      content: 'Your Gomoku strategy is amazing! Can you teach me some tricks?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '12 hours'"),
      read_at: knex.raw("NOW() - INTERVAL '11 hours'")
    },
    {
      sender_id: 3,
      receiver_id: 9,
      content: 'Of course! The key is to think 3-4 moves ahead and control the center.',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '11 hours' + INTERVAL '5 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '11 hours' + INTERVAL '10 minutes'")
    },
    {
      sender_id: 9,
      receiver_id: 3,
      content: 'That makes sense. Let\'s practice together sometime!',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '11 hours' + INTERVAL '15 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '11 hours' + INTERVAL '20 minutes'")
    },
    {
      sender_id: 3,
      receiver_id: 9,
      content: 'Definitely! How about this weekend?',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '11 hours' + INTERVAL '25 minutes'"),
      read_at: null
    },

    // Random messages
    {
      sender_id: 2,
      receiver_id: 5,
      content: 'GG! That was a close match!',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '6 hours'"),
      read_at: knex.raw("NOW() - INTERVAL '6 hours' + INTERVAL '2 minutes'")
    },
    {
      sender_id: 5,
      receiver_id: 2,
      content: 'Yeah! You almost had me there. Rematch?',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '6 hours' + INTERVAL '5 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '6 hours' + INTERVAL '7 minutes'")
    },
    {
      sender_id: 7,
      receiver_id: 3,
      content: 'Thanks for accepting my friend request!',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '15 days'"),
      read_at: knex.raw("NOW() - INTERVAL '15 days' + INTERVAL '1 hour'")
    },
    {
      sender_id: 3,
      receiver_id: 7,
      content: 'No problem! Always happy to have more gaming friends 🎮',
      is_read: true,
      sent_at: knex.raw("NOW() - INTERVAL '15 days' + INTERVAL '1 hour' + INTERVAL '10 minutes'"),
      read_at: knex.raw("NOW() - INTERVAL '15 days' + INTERVAL '1 hour' + INTERVAL '15 minutes'")
    },

    // Recent unread messages
    {
      sender_id: 8,
      receiver_id: 9,
      content: 'Hey! Are you online? Want to play some checkers?',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '30 minutes'"),
      read_at: null
    },
    {
      sender_id: 10,
      receiver_id: 9,
      content: 'I just unlocked the Century Player achievement! 🎉',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '15 minutes'"),
      read_at: null
    },
    {
      sender_id: 4,
      receiver_id: 5,
      content: 'Reminder: Our chess tournament starts tomorrow at 6 PM!',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '10 minutes'"),
      read_at: null
    },
    {
      sender_id: 6,
      receiver_id: 2,
      content: 'Just wanted to say thanks for the tips yesterday. Really helped!',
      is_read: false,
      sent_at: knex.raw("NOW() - INTERVAL '5 minutes'"),
      read_at: null
    }
  ]);
};
