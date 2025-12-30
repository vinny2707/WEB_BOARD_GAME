/**
 * Migration: Create user_achievements table
 * Description: Track user progress and unlocked achievements
 */

exports.up = function (knex) {
    return knex.schema.createTable('user_achievements', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Foreign Keys
        table.integer('user_id').unsigned().notNullable();
        table.integer('achievement_id').unsigned().notNullable();

        // Progress Tracking
        table.json('progress'); // JSON storing current progress

        // Unlock Timestamp
        table.timestamp('unlocked_at'); // NULL if not yet unlocked

        // Foreign Key Constraints
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('achievement_id').references('achievements.id').onDelete('CASCADE');

        // Unique constraint (one record per user per achievement)
        table.unique(['user_id', 'achievement_id']);

        // Indexes
        table.index('user_id');
        table.index(['user_id', 'unlocked_at']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_achievements');
};
