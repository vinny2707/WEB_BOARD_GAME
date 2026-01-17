/**
 * Seed: Messages
 * Creates sample messages between users for testing
 */

exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('messages').del();

    // Reset ID sequence to 1
    await knex.raw('ALTER SEQUENCE messages_id_seq RESTART WITH 1');

    // Insert messages
    await knex('messages').insert([
        // ========================================
        // Conversation: User 2 (John) ↔ User 3 (Jane) - 6 messages
        // ========================================
        {
            sender_id: 2,
            receiver_id: 3,
            content: 'Hey Jane! Want to play Caro later?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '5 days'"),
            read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '10 minutes'")
        },
        {
            sender_id: 3,
            receiver_id: 2,
            content: 'Sure! I\'m free after 3 PM',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '15 minutes'"),
            read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'")
        },
        {
            sender_id: 2,
            receiver_id: 3,
            content: 'Perfect! See you then 🎮',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '25 minutes'"),
            read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'")
        },
        {
            sender_id: 3,
            receiver_id: 2,
            content: 'That was a great game! You\'re getting better',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '2 days'"),
            read_at: knex.raw("NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'")
        },
        {
            sender_id: 2,
            receiver_id: 3,
            content: 'Thanks! Want a rematch tomorrow?',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '1 day'"),
            read_at: null
        },
        {
            sender_id: 3,
            receiver_id: 2,
            content: 'Definitely! Same time?',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '12 hours'"),
            read_at: null
        },

        // ========================================
        // Conversation: User 2 (John) ↔ User 5 (Sarah) - 4 messages
        // ========================================
        {
            sender_id: 5,
            receiver_id: 2,
            content: 'Hi John! I saw your high score on Snake game. Impressive!',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '7 days'"),
            read_at: knex.raw("NOW() - INTERVAL '7 days' + INTERVAL '30 minutes'")
        },
        {
            sender_id: 2,
            receiver_id: 5,
            content: 'Thank you Sarah! I\'ve been practicing a lot',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '7 days' + INTERVAL '1 hour'"),
            read_at: knex.raw("NOW() - INTERVAL '7 days' + INTERVAL '2 hours'")
        },
        {
            sender_id: 5,
            receiver_id: 2,
            content: 'Any tips for a beginner?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '6 days'"),
            read_at: knex.raw("NOW() - INTERVAL '6 days' + INTERVAL '15 minutes'")
        },
        {
            sender_id: 2,
            receiver_id: 5,
            content: 'Sure! The key is to plan your moves ahead and avoid corners',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '6 days' + INTERVAL '20 minutes'"),
            read_at: knex.raw("NOW() - INTERVAL '6 days' + INTERVAL '25 minutes'")
        },

        // ========================================
        // Conversation: User 3 (Jane) ↔ User 6 (David) - 5 messages
        // ========================================
        {
            sender_id: 6,
            receiver_id: 3,
            content: 'Jane, congrats on reaching top rank in Match 3!',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '4 days'"),
            read_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '1 hour'")
        },
        {
            sender_id: 3,
            receiver_id: 6,
            content: 'Thanks David! It took a lot of practice',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '2 hours'"),
            read_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '3 hours'")
        },
        {
            sender_id: 6,
            receiver_id: 3,
            content: 'We should team up for the next tournament',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '3 days'"),
            read_at: knex.raw("NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'")
        },
        {
            sender_id: 3,
            receiver_id: 6,
            content: 'That sounds great! When is it?',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '2 days'"),
            read_at: null
        },
        {
            sender_id: 6,
            receiver_id: 3,
            content: 'Next weekend. I\'ll send you the details',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '1 day'"),
            read_at: null
        },

        // ========================================
        // Conversation: User 5 (Sarah) ↔ User 7 (Emily) - 3 messages
        // ========================================
        {
            sender_id: 7,
            receiver_id: 5,
            content: 'Sarah! Long time no see. How have you been?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '10 days'"),
            read_at: knex.raw("NOW() - INTERVAL '10 days' + INTERVAL '2 hours'")
        },
        {
            sender_id: 5,
            receiver_id: 7,
            content: 'Emily! I\'ve been great, just busy with work. How about you?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '10 days' + INTERVAL '3 hours'"),
            read_at: knex.raw("NOW() - INTERVAL '10 days' + INTERVAL '4 hours'")
        },
        {
            sender_id: 7,
            receiver_id: 5,
            content: 'Same here! We should catch up over a game sometime',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '9 days'"),
            read_at: knex.raw("NOW() - INTERVAL '9 days' + INTERVAL '1 hour'")
        },

        // ========================================
        // Conversation: User 4 (Mike) ↔ User 8 (Robert) - 4 messages
        // ========================================
        {
            sender_id: 4,
            receiver_id: 8,
            content: 'Robert, did you see the new Memory game update?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '8 days'"),
            read_at: knex.raw("NOW() - INTERVAL '8 days' + INTERVAL '30 minutes'")
        },
        {
            sender_id: 8,
            receiver_id: 4,
            content: 'Yes! The new cards are amazing',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '8 days' + INTERVAL '1 hour'"),
            read_at: knex.raw("NOW() - INTERVAL '8 days' + INTERVAL '2 hours'")
        },
        {
            sender_id: 4,
            receiver_id: 8,
            content: 'Want to play a quick match?',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '3 days'"),
            read_at: null
        },
        {
            sender_id: 8,
            receiver_id: 4,
            content: 'Sure! Give me 10 minutes',
            is_read: false,
            sent_at: knex.raw("NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'"),
            read_at: null
        },

        // ========================================
        // Conversation: User 6 (David) ↔ User 9 (Lisa) - 3 messages
        // ========================================
        {
            sender_id: 9,
            receiver_id: 6,
            content: 'David, can you help me with Tic Tac Toe strategy?',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '5 days'"),
            read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'")
        },
        {
            sender_id: 6,
            receiver_id: 9,
            content: 'Of course! Always start with the center or a corner',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '30 minutes'"),
            read_at: knex.raw("NOW() - INTERVAL '5 days' + INTERVAL '45 minutes'")
        },
        {
            sender_id: 9,
            receiver_id: 6,
            content: 'Thanks! That really helped',
            is_read: true,
            sent_at: knex.raw("NOW() - INTERVAL '4 days'"),
            read_at: knex.raw("NOW() - INTERVAL '4 days' + INTERVAL '10 minutes'")
        }
    ]);
};
