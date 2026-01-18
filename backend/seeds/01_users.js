const bcrypt = require('bcryptjs');

/**
 * Seed: Users
 * Creates sample users with different roles
 * Updated to match production data
 * Note: 00_images.js handles TRUNCATE for all tables
 */

exports.seed = async function(knex) {
  // 00_images.js already handles truncation, just delete users
  await knex('users').del();

  // Hash password for all users (password: "123456")
  const passwordHash = await bcrypt.hash('123456', 10);

  // Insert users
  await knex('users').insert([
    {
      id: 1,
      username: 'admin',
      email: 'admin@gmail.com',
      password_hash: passwordHash,
      full_name: 'Admin',
      dob: '1985-01-15',
      role: 'admin',
      status: 'active',
      avatar_id: 14,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      username: 'john_doe',
      email: 'john.doe@example.com',
      password_hash: passwordHash,
      full_name: 'John Doe',
      dob: '1990-05-20',
      role: 'user',
      status: 'active',
      avatar_id: 3,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 3,
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      password_hash: passwordHash,
      full_name: 'Jane Smith',
      dob: '1992-08-12',
      role: 'user',
      status: 'active',
      avatar_id: 2,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 4,
      username: 'mike_wilson',
      email: 'mike.wilson@example.com',
      password_hash: passwordHash,
      full_name: 'Mike Wilson',
      dob: '1988-03-25',
      role: 'user',
      status: 'active',
      avatar_id: 4,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 5,
      username: 'sarah_jones',
      email: 'sarah.jones@example.com',
      password_hash: passwordHash,
      full_name: 'Sarah Jones',
      dob: '1995-11-30',
      role: 'user',
      status: 'active',
      avatar_id: 5,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 6,
      username: 'david_brown',
      email: 'david.brown@example.com',
      password_hash: passwordHash,
      full_name: 'David Brown',
      dob: '1987-07-08',
      role: 'admin',
      status: 'active',
      avatar_id: 6,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 7,
      username: 'emily_davis',
      email: 'emily.davis@example.com',
      password_hash: passwordHash,
      full_name: 'Emily Davis',
      dob: '1993-02-14',
      role: 'user',
      status: 'active',
      avatar_id: 7,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 8,
      username: 'robert_miller',
      email: 'robert.miller@example.com',
      password_hash: passwordHash,
      full_name: 'Robert Miller',
      dob: '1991-09-05',
      role: 'user',
      status: 'active',
      avatar_id: 8,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 9,
      username: 'lisa_garcia',
      email: 'lisa.garcia@example.com',
      password_hash: passwordHash,
      full_name: 'Lisa Garcia',
      dob: '1994-12-22',
      role: 'user',
      status: 'active',
      avatar_id: 9,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 10,
      username: 'chris_martinez',
      email: 'chris.martinez@example.com',
      password_hash: passwordHash,
      full_name: 'Chris Martinez',
      dob: '1989-06-18',
      role: 'user',
      status: 'active',
      avatar_id: 10,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 11,
      username: 'banned_user',
      email: 'banned@example.com',
      password_hash: passwordHash,
      full_name: 'Banned User',
      dob: '1990-01-01',
      role: 'user',
      status: 'banned',
      avatar_id: 11,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 12,
      username: 'inactive_user',
      email: 'inactive@example.com',
      password_hash: passwordHash,
      full_name: 'Inactive User',
      dob: '1992-03-15',
      role: 'user',
      status: 'inactive',
      avatar_id: 12,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 13,
      username: 'tranquocvy',
      email: 'quocvy23072005@gmail.com',
      password_hash: passwordHash,
      full_name: 'Trần Quốc Vỹ',
      dob: '2005-07-23',
      role: 'user',
      status: 'active',
      avatar_id: 15,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 14,
      username: 'nkvuong',
      email: 'khacvuong2707@gmail.com',
      password_hash: passwordHash,
      full_name: 'Nguyễn Khắc Vượng',
      dob: '2000-07-27',
      role: 'admin',
      status: 'active',
      avatar_id: 13,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 15,
      username: 'caoty113',
      email: 'caoty113@gmail.com',
      password_hash: passwordHash,
      full_name: 'Cao Quoc Ty',
      dob: '2000-01-13',
      role: 'user',
      status: 'active',
      avatar_id: 16,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);

  // Reset sequences
  await knex.raw('SELECT setval(\'users_id_seq\', (SELECT MAX(id) FROM users))');
};
