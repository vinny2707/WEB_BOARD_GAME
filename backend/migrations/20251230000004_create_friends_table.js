/**
 * Migration: Create friends table
 * Description: Store friend relationships between users
 */

exports.up = function (knex) {
    return knex.schema.createTable('friends', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Foreign Keys
        table.integer('user_id').unsigned().notNullable();
        table.integer('friend_id').unsigned().notNullable();

        // Status
        table.enu('status', ['pending', 'accepted', 'rejected', 'blocked']).defaultTo('pending');

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Foreign Key Constraints
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('friend_id').references('users.id').onDelete('CASCADE');

        // Unique constraint for user pairs (prevent duplicates)
        table.unique(['user_id', 'friend_id']);

        // Check constraint (prevent self-friendship)
        table.check('user_id != friend_id', [], 'chk_not_self_friend');

        // Indexes
        table.index('user_id');
        table.index('friend_id');
        table.index('status');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('friends');
};
