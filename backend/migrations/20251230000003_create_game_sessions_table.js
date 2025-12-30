/**
 * Migration: Create game_sessions table
 * Description: Store game sessions with state and results
 */

exports.up = function (knex) {
    return knex.schema.createTable('game_sessions', function (table) {
        // Primary Key (UUID for distributed systems)
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

        // Foreign Keys
        table.integer('user_id').unsigned().notNullable();
        table.integer('game_id').unsigned().notNullable();

        // Game State (JSON for flexible storage)
        table.json('game_state').notNullable();

        // Game Results
        table.enu('result', ['win', 'loss', 'draw']);
        table.integer('score').defaultTo(0);
        table.integer('moves_count').defaultTo(0);
        table.integer('time_elapsed').defaultTo(0); // in seconds

        // Status
        table.enu('status', ['in_progress', 'completed', 'abandoned']).defaultTo('in_progress');

        // Timestamps
        table.timestamp('started_at').defaultTo(knex.fn.now());
        table.timestamp('ended_at');
        table.timestamp('saved_at').defaultTo(knex.fn.now());

        // Foreign Key Constraints
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('game_id').references('games.id').onDelete('RESTRICT');

        // Indexes
        table.index('user_id');
        table.index('game_id');
        table.index(['user_id', 'game_id']);
        table.index('status');
        table.index('started_at');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('game_sessions');
};
