const bcrypt = require('bcryptjs');

/**
 * Seed: Users
 * Tạo 100 users với họ tên tiếng Việt
 * 4 admins/team + 96 users thường
 * Dữ liệu trải dài 4 tháng gần nhất
 */

// Số ngày để trải dữ liệu (4 tháng = ~120 ngày)
const DATA_SPREAD_DAYS = 120;

// Danh sách họ Việt Nam phổ biến
const HO = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
    'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Trương', 'Đinh', 'Lương', 'Mai',
    'Đoàn', 'Tạ', 'Cao', 'Lâm', 'Tô', 'Chu', 'Quách', 'Từ', 'Hà', 'Thái'
];

// Danh sách tên đệm
const TEN_DEM = [
    'Văn', 'Thị', 'Hữu', 'Đức', 'Thanh', 'Minh', 'Quốc', 'Hoàng', 'Xuân', 'Thu',
    'Ngọc', 'Kim', 'Anh', 'Hồng', 'Bảo', 'Phương', 'Khánh', 'Tuấn', 'Hải', 'Như',
    'Gia', 'Thiên', 'Công', 'Trung', 'Đình', 'Tiến', 'Quang', 'Nhật', 'Thành', 'Việt'
];

// Danh sách tên chính
const TEN_CHINH = [
    'An', 'Anh', 'Bình', 'Chi', 'Cường', 'Dũng', 'Duy', 'Đạt', 'Giang', 'Hà',
    'Hải', 'Hạnh', 'Hiếu', 'Hoa', 'Hoàng', 'Hùng', 'Hương', 'Hưng', 'Khang', 'Khanh',
    'Khoa', 'Kiên', 'Lan', 'Linh', 'Long', 'Lộc', 'Mai', 'Minh', 'My', 'Nam',
    'Nga', 'Ngân', 'Ngọc', 'Nhân', 'Nhi', 'Nhung', 'Phong', 'Phúc', 'Phương', 'Quân',
    'Quang', 'Quyên', 'Sơn', 'Tâm', 'Thắng', 'Thanh', 'Thảo', 'Thiên', 'Thịnh', 'Thuỷ',
    'Thư', 'Tiến', 'Trang', 'Trinh', 'Trung', 'Trúc', 'Tuấn', 'Tú', 'Uyên', 'Vân',
    'Việt', 'Vinh', 'Vũ', 'Vy', 'Xuân', 'Yến', 'Bảo', 'Châu', 'Đông', 'Hân',
    'Hiền', 'Hoài', 'Khánh', 'Khôi', 'Lam', 'Liên', 'Lợi', 'Mạnh', 'Nghĩa', 'Nhật',
    'Oanh', 'Phi', 'Quỳnh', 'Sang', 'Tài', 'Thành', 'Thy', 'Toàn', 'Trâm', 'Triều',
    'Trọng', 'Tùng', 'Vương', 'Yên', 'Đăng', 'Hậu', 'Kiệt', 'Lâm', 'Nguyên', 'Thái'
];

/**
 * Tạo tên ngẫu nhiên
 */
function generateName(index) {
    const ho = HO[index % HO.length];
    const tenDem = TEN_DEM[(index * 7) % TEN_DEM.length];
    const tenChinh = TEN_CHINH[(index * 13) % TEN_CHINH.length];
    return `${ho} ${tenDem} ${tenChinh}`;
}

/**
 * Tạo username từ tên, đảm bảo không trùng
 */
function generateUsername(fullName, dob, usedUsernames) {
    // Chuẩn hóa tên
    const normalized = fullName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s+/g, '');
    
    // Thử username đầy đủ trước
    if (!usedUsernames.has(normalized)) {
        usedUsernames.add(normalized);
        return normalized;
    }
    
    // Nếu trùng, thử thêm năm sinh
    const year = dob.split('-')[0];
    const withYear = `${normalized}${year}`;
    if (!usedUsernames.has(withYear)) {
        usedUsernames.add(withYear);
        return withYear;
    }
    
    // Nếu vẫn trùng, thử các biến thể
    const nameParts = fullName.toLowerCase().split(' ');
    
    // Thử: tên + họ (vd: anhnguyen)
    if (nameParts.length >= 2) {
        const firstLast = nameParts[nameParts.length - 1] + nameParts[0]
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/\s+/g, '');
        if (!usedUsernames.has(firstLast)) {
            usedUsernames.add(firstLast);
            return firstLast;
        }
    }
    
    // Thử: chữ cái đầu họ + tên đệm đầy đủ + tên (vd: nvanan)
    if (nameParts.length >= 3) {
        const firstInitial = nameParts[0].charAt(0)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
        const middleLast = (nameParts[1] + nameParts[2])
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
        const shortForm = firstInitial + middleLast;
        if (!usedUsernames.has(shortForm)) {
            usedUsernames.add(shortForm);
            return shortForm;
        }
    }
    
    // Cuối cùng, thêm số ngẫu nhiên nhỏ
    let counter = 1;
    let username = `${normalized}${counter}`;
    while (usedUsernames.has(username)) {
        counter++;
        username = `${normalized}${counter}`;
    }
    usedUsernames.add(username);
    return username;
}

/**
 * Tạo ngày sinh ngẫu nhiên (1985-2005)
 */
function generateDob(index) {
    const year = 1985 + (index % 21);
    const month = String((index % 12) + 1).padStart(2, '0');
    const day = String((index % 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

exports.seed = async function(knex) {
    // 00_images.js đã xử lý truncate
    await knex('users').del();

    const passwordHash = await bcrypt.hash('123456', 10);
    const users = [];
    const usedUsernames = new Set(['admin', 'tranquocvy', 'nkvuong', 'caoty113']);

    // Admin user (id: 1)
    users.push({
        id: 1,
        username: 'admin',
        email: 'admin@boardgame.vn',
        password_hash: passwordHash,
        full_name: 'Quản Trị Viên',
        dob: '1990-01-01',
        role: 'admin',
        status: 'active',
        avatar_id: 14,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
    });

    // 3 thành viên team (giữ lại)
    users.push({
        id: 2,
        username: 'tranquocvy',
        email: 'quocvy23072005@gmail.com',
        password_hash: passwordHash,
        full_name: 'Trần Quốc Vỹ',
        dob: '2005-07-23',
        role: 'admin',
        status: 'active',
        avatar_id: 15,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
    });

    users.push({
        id: 3,
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
    });

    users.push({
        id: 4,
        username: 'caoty113',
        email: 'caoty113@gmail.com',
        password_hash: passwordHash,
        full_name: 'Cao Quốc Tỷ',
        dob: '2000-01-13',
        role: 'user',
        status: 'active',
        avatar_id: 16,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
    });

    // Tạo 96 users còn lại (id 5-100)
    for (let i = 5; i <= 100; i++) {
        const fullName = generateName(i);
        const dob = generateDob(i);
        const username = generateUsername(fullName, dob, usedUsernames);
        
        // Một số user có status khác
        let status = 'active';
        if (i % 50 === 0) status = 'banned';       // 2 users bị banned
        else if (i % 25 === 0) status = 'inactive'; // 4 users inactive

        // Trải created_at trong 4 tháng
        const daysAgo = Math.floor((i / 100) * DATA_SPREAD_DAYS);

        users.push({
            id: i,
            username: username,
            email: `${username}@gmail.com`,
            password_hash: passwordHash,
            full_name: fullName,
            dob: dob,
            role: 'user',
            status: status,
            avatar_id: (i % 52) + 1, // Avatar 1-52
            created_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`),
            updated_at: knex.raw(`NOW() - INTERVAL '${daysAgo} days'`)
        });
    }

    // Insert theo batch để tránh timeout
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await knex('users').insert(batch);
    }

    // Reset sequence
    await knex.raw('SELECT setval(\'users_id_seq\', (SELECT MAX(id) FROM users))');
};
