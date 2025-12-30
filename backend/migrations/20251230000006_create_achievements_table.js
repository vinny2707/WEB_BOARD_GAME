/**
 * Migration: Create achievements table
 * Description: Store available achievements that users can unlock
 */

exports.up = function (knex) {
    return knex.schema.createTable('achievements', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Achievement Information
        table.string('name', 100).notNullable();
        table.text('description');
        table.string('icon', 255);

        // Category
        table.string('category', 50); // beginner, expert, social, special

        // Points & Criteria
        table.integer('points').defaultTo(0);
        table.json('unlock_criteria').notNullable(); // JSON defining unlock conditions

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Indexes
        table.index('category');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('achievements');
};
