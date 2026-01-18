/**
 * Base ELO Calculator
 * Core ELO formula và K-Factor
 */

/**
 * ELO Tiers - Phân hạng người chơi
 */
const ELO_TIERS = {
    BRONZE:   { min: 0,    max: 999,  name: 'Đồng', nameEn: 'Bronze' },
    SILVER:   { min: 1000, max: 1299, name: 'Bạc', nameEn: 'Silver' },
    GOLD:     { min: 1300, max: 1599, name: 'Vàng', nameEn: 'Gold' },
    PLATINUM: { min: 1600, max: 1899, name: 'Bạch Kim', nameEn: 'Platinum' },
    DIAMOND:  { min: 1900, max: 2199, name: 'Kim Cương', nameEn: 'Diamond' },
    MASTER:   { min: 2200, max: 2499, name: 'Cao Thủ', nameEn: 'Master' },
    GRANDMASTER: { min: 2500, max: Infinity, name: 'Đại Cao Thủ', nameEn: 'Grandmaster' }
};

/**
 * Starting ELO cho player mới
 */
const STARTING_ELO = 1000;

/**
 * Minimum ELO (không thể xuống dưới)
 */
const MIN_ELO = 100;

/**
 * Get K-Factor dựa trên ELO và số game đã chơi
 * K cao = thay đổi nhanh (cho newbie)
 * K thấp = thay đổi chậm (cho pro stable)
 * 
 * @param {number} elo - ELO hiện tại
 * @param {number} totalGames - Tổng số game đã chơi
 * @returns {number} K-Factor
 */
function getKFactor(elo, totalGames = 0) {
    // Newbie: điều chỉnh nhanh để tìm đúng skill level
    if (totalGames < 10) return 50;
    if (totalGames < 30) return 40;
    
    // Dựa theo ELO tier
    if (elo < 1000) return 35;   // Bronze: vẫn đang học
    if (elo < 1300) return 32;   // Silver
    if (elo < 1600) return 28;   // Gold
    if (elo < 1900) return 24;   // Platinum
    if (elo < 2200) return 20;   // Diamond
    return 16;                    // Master+: rất stable
}

/**
 * Tính Expected Score (xác suất thắng)
 * @param {number} playerElo 
 * @param {number} opponentElo 
 * @returns {number} 0-1
 */
function getExpectedScore(playerElo, opponentElo) {
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Tính ELO change sau 1 trận
 * 
 * @param {number} playerElo - ELO hiện tại của player
 * @param {number} opponentElo - ELO của đối thủ/bot/benchmark
 * @param {number} actualScore - Kết quả thực: 1 = win, 0.5 = draw, 0 = loss
 * @param {number} totalGames - Số game đã chơi (để tính K-Factor)
 * @returns {Object} { newElo, change, expectedScore }
 */
function calculateEloChange(playerElo, opponentElo, actualScore, totalGames = 0) {
    const K = getKFactor(playerElo, totalGames);
    const expectedScore = getExpectedScore(playerElo, opponentElo);
    
    // Rating change
    let change = Math.round(K * (actualScore - expectedScore));
    
    // Đảm bảo ELO không xuống dưới MIN_ELO
    let newElo = Math.max(MIN_ELO, playerElo + change);
    
    // Recalculate actual change sau khi apply MIN_ELO
    change = newElo - playerElo;
    
    return {
        newElo,
        change,
        expectedScore: Math.round(expectedScore * 100) / 100,
        kFactor: K
    };
}

/**
 * Lấy tier từ ELO
 * @param {number} elo 
 * @returns {Object} tier info
 */
function getTierFromElo(elo) {
    for (const [key, tier] of Object.entries(ELO_TIERS)) {
        if (elo >= tier.min && elo <= tier.max) {
            return { tier: key, ...tier };
        }
    }
    return { tier: 'BRONZE', ...ELO_TIERS.BRONZE };
}

module.exports = {
    ELO_TIERS,
    STARTING_ELO,
    MIN_ELO,
    getKFactor,
    getExpectedScore,
    calculateEloChange,
    getTierFromElo
};
