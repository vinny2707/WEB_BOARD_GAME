/**
 * Migration: Optimize friends table
 * - Remove 'rejected' status (reject = DELETE instead)
 * - Add composite indexes for better query performance
 */

exports.up = async function (knex) {
    // Step 1: Delete all rejected relationships (cleanup)
    await knex('friends').where('status', 'rejected').del();

    // Step 2: Add composite indexes for performance
    await knex.schema.table('friends', function (table) {
        table.index(['user_id', 'status'], 'idx_friends_user_status');
        table.index(['friend_id', 'status'], 'idx_friends_friend_status');
    });

    // Step 3: Update enum to remove 'rejected'
    await knex.raw(`
        ALTER TABLE friends 
        DROP CONSTRAINT IF EXISTS friends_status_check;
        
        ALTER TABLE friends
        ADD CONSTRAINT friends_status_check 
        CHECK (status IN ('pending', 'accepted', 'blocked'));
    `);
};

exports.down = async function (knex) {
    // Remove composite indexes
    await knex.schema.table('friends', function (table) {
        table.dropIndex(['user_id', 'status'], 'idx_friends_user_status');
        table.dropIndex(['friend_id', 'status'], 'idx_friends_friend_status');
    });

    // Restore 'rejected' status
    await knex.raw(`
        ALTER TABLE friends 
        DROP CONSTRAINT IF EXISTS friends_status_check;
        
        ALTER TABLE friends
        ADD CONSTRAINT friends_status_check 
        CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked'));
    `);
};
