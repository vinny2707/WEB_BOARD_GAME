/**
 * Migration: Create messages table
 * Description: Store messages between users
 */

exports.up = function (knex) {
    return knex.schema.createTable('messages', function (table) {
        // Primary Key
        table.increments('id').primary();

        // Foreign Keys
        table.integer('sender_id').unsigned().notNullable();
        table.integer('receiver_id').unsigned().notNullable();

        // Message Content
        table.text('content').notNullable();

        // Read Status
        table.boolean('is_read').defaultTo(false);

        // Timestamps
        table.timestamp('sent_at').defaultTo(knex.fn.now());
        table.timestamp('read_at');

        // Foreign Key Constraints
        table.foreign('sender_id').references('users.id').onDelete('CASCADE');
        table.foreign('receiver_id').references('users.id').onDelete('CASCADE');

        // Check constraint (prevent self-messaging)
        table.check('sender_id != receiver_id', [], 'chk_not_self_message');

        // Indexes
        table.index('sender_id');
        table.index('receiver_id');
        table.index(['receiver_id', 'is_read']);
        table.index('sent_at');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('messages');
};
