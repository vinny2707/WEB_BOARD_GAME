/**
 * Migration: Create images table and add avatar to users
 * Description: Store uploaded image URLs with reference to users
 */

exports.up = async function (knex) {
    // Create images table
    await knex.schema.createTable('images', function (table) {
        table.increments('id').primary();
        table.string('url', 500).notNullable();
        table.integer('uploaded_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        
        // Index for faster lookups
        table.index('uploaded_by');
    });

    // Add avatar_id column to users table
    await knex.schema.alterTable('users', function (table) {
        table.integer('avatar_id').unsigned().references('id').inTable('images').onDelete('SET NULL');
    });
};

exports.down = async function (knex) {
    // Remove avatar_id from users first (foreign key constraint)
    await knex.schema.alterTable('users', function (table) {
        table.dropColumn('avatar_id');
    });

    // Drop images table
    await knex.schema.dropTableIfExists('images');
};
