/**
 * Seed file for images
 * Must run FIRST because users.avatar_id references images.id
 * Avatar images from papergames.io
 */

exports.seed = async function (knex) {
    // Truncate ALL tables in correct order (respecting FK constraints)
    // This handles the circular dependency: users.avatar_id -> images.id
    await knex.raw('TRUNCATE TABLE reviews, rankings, user_achievements, messages, friends, game_sessions, achievements, games, users, images RESTART IDENTITY CASCADE');

    // Insert images with specific IDs
    await knex('images').insert([
        { id: 1, url: 'https://papergames.io/en/assets/images/avatars/22ee1de6-0076-4fc3-830f-6884d5e23be5.svg' },
        { id: 2, url: 'https://papergames.io/en/assets/images/avatars/11610f96-1c63-4091-9699-c735e304125f.svg' },
        { id: 3, url: 'https://papergames.io/en/assets/images/avatars/77da7063-2e60-4f9f-ae60-dbc9e2df9cef.svg' },
        { id: 4, url: 'https://papergames.io/en/assets/images/avatars/11fcfbf6-558d-4336-95ea-077f1577272f.svg' },
        { id: 5, url: 'https://papergames.io/en/assets/images/avatars/a1679bb4-e7ce-4f11-b8af-bf48f38633e3.svg' },
        { id: 6, url: 'https://papergames.io/en/assets/images/avatars/47b0d348-4e13-4cc0-b116-e6aebeb89802.svg' },
        { id: 7, url: 'https://papergames.io/en/assets/images/avatars/8bedf801-0505-459a-9a8a-ae2aee57f571.svg' },
        { id: 8, url: 'https://papergames.io/en/assets/images/avatars/5d5fe840-d897-4db6-99a8-fa5e3dd55681.svg' },
        { id: 9, url: 'https://papergames.io/en/assets/images/avatars/8b9b9213-38b9-4f8f-8072-07a718418005.svg' },
        { id: 10, url: 'https://papergames.io/en/assets/images/avatars/bfc39d5d-ac8e-4f70-8de9-a91bc39debe0.svg' },
        { id: 11, url: 'https://papergames.io/en/assets/images/avatars/93acfaea-d1f0-4ed4-b154-b445f5799be2.svg' },
        { id: 12, url: 'https://papergames.io/en/assets/images/avatars/328de0bf-59dc-445d-9d4a-4403cdb2061e.svg' },
        { id: 13, url: 'https://papergames.io/en/assets/images/avatars/af0064c7-df69-45a4-8bd9-73514a83b5e4.svg' },
        { id: 14, url: 'https://papergames.io/en/assets/images/avatars/eeb89bda-bbb2-4fd1-a7af-b6996c02eabd.svg' },
        { id: 15, url: 'https://papergames.io/en/assets/images/avatars/c2f5609f-b81f-4de4-a544-5eae4d6d9180.svg' },
        { id: 16, url: 'https://papergames.io/en/assets/images/avatars/8d5a0ef8-a68d-478c-85f7-e7c3e1113688.svg' },
        { id: 17, url: 'https://papergames.io/en/assets/images/avatars/2bd7f9e0-0a4b-44f7-9ab4-f5128cd5e59c.svg' },
        { id: 18, url: 'https://papergames.io/en/assets/images/avatars/cad17f31-6dd8-4b9c-9099-a51f7c35cb2e.svg' },
        { id: 19, url: 'https://papergames.io/en/assets/images/avatars/79a26694-76db-412f-aab2-20c3b1f484e5.svg' },
        { id: 20, url: 'https://papergames.io/en/assets/images/avatars/v_1.svg' },
        { id: 21, url: 'https://papergames.io/en/assets/images/avatars/v_2.svg' },
        { id: 22, url: 'https://papergames.io/en/assets/images/avatars/v_3.svg' },
        { id: 23, url: 'https://papergames.io/en/assets/images/avatars/v_5.svg' },
        { id: 24, url: 'https://papergames.io/en/assets/images/avatars/v_4.svg' },
        { id: 25, url: 'https://papergames.io/en/assets/images/avatars/v_6.svg' },
        { id: 26, url: 'https://papergames.io/en/assets/images/avatars/v_7.svg' },
        { id: 27, url: 'https://papergames.io/en/assets/images/avatars/v_9.svg' },
        { id: 28, url: 'https://papergames.io/en/assets/images/avatars/v_8.svg' },
        { id: 29, url: 'https://papergames.io/en/assets/images/avatars/75a0baff-65bd-4988-876a-98e9f207beeb.svg' },
        { id: 30, url: 'https://papergames.io/en/assets/images/avatars/11b086a5-b430-4833-87a6-0d82562d3d2e.svg' },
        { id: 31, url: 'https://papergames.io/en/assets/images/avatars/c79b8350-2b15-44e7-ab77-dcb56f6b91ff.svg' },
        { id: 32, url: 'https://papergames.io/en/assets/images/avatars/47b47da5-0712-4f25-94e7-7681ba5a4da7.svg' },
        { id: 33, url: 'https://papergames.io/en/assets/images/avatars/a71feacc-f841-4f8b-9971-9bebcfb1f6ec.svg' },
        { id: 34, url: 'https://papergames.io/en/assets/images/avatars/62bfc624-25cf-4287-ba8b-f1201d97f7c2.svg' },
        { id: 35, url: 'https://papergames.io/en/assets/images/avatars/d4158e88-e144-4690-97e4-667ae0356b2d.svg' },
        { id: 36, url: 'https://papergames.io/en/assets/images/avatars/57ca232c-e5ae-4e5a-b5d0-835e8d44426b.svg' },
        { id: 37, url: 'https://papergames.io/en/assets/images/avatars/5b977185-c30b-4f85-9fa4-e7a94c3fac1e.svg' },
        { id: 38, url: 'https://papergames.io/en/assets/images/avatars/69cb2a03-4a74-4437-a649-dbb342e05940.svg' },
        { id: 39, url: 'https://papergames.io/en/assets/images/avatars/1db41a62-6b6b-4ac5-a6e9-7cb5a9392b6b.svg' },
        { id: 40, url: 'https://papergames.io/en/assets/images/avatars/952689eb-4985-49ef-9cdc-f840525014dc.svg' },
        { id: 41, url: 'https://papergames.io/en/assets/images/avatars/b039a8b6-a0fd-4d9f-88ad-7e2e5623335b.svg' },
        { id: 42, url: 'https://papergames.io/en/assets/images/avatars/eeb89bda-bbb2-4fd1-a7af-b6996c02eabd.svg' },
        { id: 43, url: 'https://papergames.io/en/assets/images/avatars/c2f5609f-b81f-4de4-a544-5eae4d6d9180.svg' },
        { id: 44, url: 'https://papergames.io/en/assets/images/avatars/0a1b9db1-55e4-422a-9a6e-ddce0b9f2f60.svg' },
        { id: 45, url: 'https://papergames.io/en/assets/images/avatars/92b1d316-597d-47fe-a267-5ca9836ea94d.svg' },
        { id: 46, url: 'https://papergames.io/en/assets/images/avatars/7eb8fe98-30b1-4e70-8b96-94b1d3e2fddb.svg' },
        { id: 47, url: 'https://papergames.io/en/assets/images/avatars/30f77b18-67d0-4bc3-86cd-8d4fa3a6d741.svg' },
        { id: 48, url: 'https://papergames.io/en/assets/images/avatars/fedf6679-566b-4aac-8141-295132842ec3.svg' },
        { id: 49, url: 'https://papergames.io/en/assets/images/avatars/8634f5b6-402c-4b43-a363-aba864533e76.svg' },
        { id: 50, url: 'https://papergames.io/en/assets/images/avatars/8d5a0ef8-a68d-478c-85f7-e7c3e1113688.svg' },
        { id: 51, url: 'https://papergames.io/en/assets/images/avatars/134cefc8-45ad-4610-95e8-e5a8ba1f9782.svg' },
        { id: 52, url: 'https://papergames.io/en/assets/images/avatars/871e3dad-6d5f-4d99-9910-0eb732f40798.svg' }
    ]);
    
    // Reset sequence
    await knex.raw('SELECT setval(\'images_id_seq\', (SELECT MAX(id) FROM images))');
};
