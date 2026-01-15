/**
 * Migration: Create reviews table
 * Description: Store user reviews and ratings for games
 */

exports.up = function (knex) {
    return knex.schema.createTable('reviews', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Foreign Keys
        table.integer('game_id').unsigned().notNullable()
            .references('id').inTable('games')
            .onDelete('CASCADE'); // If game is deleted, reviews are deleted

        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE'); // If user is deleted, reviews are deleted

        // Review Content
        table.integer('rating').notNullable(); // 1-5 stars
        table.text('comment'); // Optional comment

        // Constraints
        table.check('rating >= 1 AND rating <= 5'); // Ensure rating is between 1 and 5
        table.unique(['game_id', 'user_id']); // One review per game per user

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Indexes for performance
        table.index('game_id');
        table.index('user_id');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('reviews');
};
