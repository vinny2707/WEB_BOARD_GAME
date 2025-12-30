/**
 * Migration: Create games table
 * Description: Store available board games with configuration
 */

exports.up = function (knex) {
    return knex.schema.createTable('games', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Game Information
        table.string('name', 100).notNullable();
        table.string('type', 50).notNullable().unique();
        table.text('description');

        // Board Configuration
        table.integer('rows').notNullable();
        table.integer('cols').notNullable();

        // Status & Assets
        table.boolean('enabled').defaultTo(true);
        table.string('icon', 255);
        table.text('rules');

        // Settings (JSON for flexible configuration)
        table.json('settings');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Indexes
        table.index('enabled');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('games');
};
