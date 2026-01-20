/**
 * Migration: Drop uploaded_by from images table
 * Description: Removes the circular dependency with users table
 */

exports.up = async function (knex) {
    await knex.schema.alterTable('images', function (table) {
        table.dropColumn('uploaded_by');
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('images', function (table) {
        table.integer('uploaded_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
        table.index('uploaded_by');
    });
};
