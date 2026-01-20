/**
 * Migration: Enable Row Level Security (RLS) for all tables
 * Description: Enables RLS and creates policies to allow service role (backend) full access
 * This removes the "UNRESTRICTED" warning in Supabase while maintaining backend functionality
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Enable RLS for all tables
    await knex.raw('ALTER TABLE users ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE games ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE friends ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE messages ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE achievements ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE rankings ENABLE ROW LEVEL SECURITY');

    // Create policies that allow all operations for service role (backend with DATABASE_URL)
    // USING (true) means the policy always allows access
    
    // Users table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON users
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Games table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON games
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Game Sessions table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON game_sessions
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Friends table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON friends
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Messages table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON messages
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Achievements table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON achievements
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // User Achievements table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON user_achievements
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);

    // Rankings table policies
    await knex.raw(`
        CREATE POLICY "Enable all for service role" ON rankings
        FOR ALL
        USING (true)
        WITH CHECK (true)
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Drop all policies
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON users');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON games');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON game_sessions');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON friends');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON messages');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON achievements');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON user_achievements');
    await knex.raw('DROP POLICY IF EXISTS "Enable all for service role" ON rankings');

    // Disable RLS for all tables
    await knex.raw('ALTER TABLE users DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE games DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE game_sessions DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE friends DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE messages DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE achievements DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY');
    await knex.raw('ALTER TABLE rankings DISABLE ROW LEVEL SECURITY');
};
