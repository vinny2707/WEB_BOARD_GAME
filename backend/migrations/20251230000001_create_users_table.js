/**
 * Migration: Create users table
 * Description: Store user accounts with authentication and profile information
 */

exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Authentication
        table.string('username', 50).notNullable().unique();
        table.string('email', 255).notNullable().unique();
        table.string('password_hash', 255).notNullable();

        // Profile Information
        table.string('full_name', 100);
        table.date('dob');

        // Role & Status
        table.enu('role', ['admin', 'user']).defaultTo('user');
        table.enu('status', ['active', 'inactive', 'banned']).defaultTo('active');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('last_login');

        // Indexes
        table.index('status');
        table.index('role');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
