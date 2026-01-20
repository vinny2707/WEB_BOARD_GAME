/**
 * Migration: Add created_at to rankings table
 * Description: Track when user first started playing each game
 */

exports.up = async function (knex) {
    // Check if column already exists
    const hasColumn = await knex.schema.hasColumn('rankings', 'created_at');
    if (!hasColumn) {
        await knex.schema.table('rankings', function (table) {
            // Add created_at with default NOW()
            // This will auto-populate for existing records
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
    }
};

exports.down = async function (knex) {
    const hasColumn = await knex.schema.hasColumn('rankings', 'created_at');
    if (hasColumn) {
        await knex.schema.table('rankings', function (table) {
            table.dropColumn('created_at');
        });
    }
};
