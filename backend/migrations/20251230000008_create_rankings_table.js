/**
 * Migration: Create rankings table
 * Description: Store user rankings and statistics for each game
 */

exports.up = function (knex) {
    return knex.schema.createTable('rankings', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Foreign Keys
        table.integer('user_id').unsigned().notNullable();
        table.integer('game_id').unsigned().notNullable();

        // Game Statistics
        table.integer('total_games').defaultTo(0);
        table.integer('total_wins').defaultTo(0);
        table.integer('total_losses').defaultTo(0);
        table.integer('total_draws').defaultTo(0);
        table.decimal('win_rate', 5, 2).defaultTo(0.00); // Percentage

        // Scores
        table.integer('total_score').defaultTo(0);
        table.integer('best_score').defaultTo(0);

        // Ranking
        table.integer('global_rank');

        // Timestamps
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Foreign Key Constraints
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('game_id').references('games.id').onDelete('CASCADE');

        // Unique constraint (one ranking record per user per game)
        table.unique(['user_id', 'game_id']);

        // Indexes
        table.index('user_id');
        table.index(['game_id', 'total_score']);
        table.index(['game_id', 'global_rank']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('rankings');
};
