/**
 * Add refresh_token column to users table
 * Stores JWT token for proper logout/revocation
 */

exports.up = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.text('refresh_token').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('refresh_token');
    });
};
