/**
 * Migration: Allow game_id = 0 for achievement rankings
 * Description: Drop FK constraint on game_id to allow game_id = 0 for achievement points
 */

exports.up = async function (knex) {
    // Drop the foreign key constraint on game_id
    await knex.schema.alterTable('rankings', function (table) {
        table.dropForeign('game_id');
    });
    
    // Add a comment to explain game_id = 0 is for achievements
    await knex.raw(`
        COMMENT ON COLUMN rankings.game_id IS 'Game ID. 0 = achievement points (no game association)';
    `);
};

exports.down = async function (knex) {
    // First, delete any records with game_id = 0 (achievements)
    await knex('rankings').where('game_id', 0).del();
    
    // Re-add the foreign key constraint
    await knex.schema.alterTable('rankings', function (table) {
        table.foreign('game_id').references('games.id').onDelete('CASCADE');
    });
};
