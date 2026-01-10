/**
 * Migration: Add settings column to game_sessions
 * Description: Allow users to customize game settings per session
 */

exports.up = function (knex) {
    return knex.schema.alterTable('game_sessions', function (table) {
        // Settings for this session (overrides game defaults)
        table.json('settings').nullable();
    });
};

exports.down = function (knex) {
    return knex.schema.alterTable('game_sessions', function (table) {
        table.dropColumn('settings');
    });
};
