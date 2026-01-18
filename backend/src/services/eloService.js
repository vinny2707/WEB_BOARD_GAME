/**
 * Elo Rating Service
 * Re-export từ elo/ module mới
 * 
 * Hệ thống ELO Promax:
 * - PvE: Caro 5, Caro 4, Tic-Tac-Toe (đánh với Bot AI)
 * - Score-based: Snake, Candy Crush (so với target score)
 * - Performance-based: Memory Cards (so với optimal flips)
 * - No ELO: Drawing Board
 */

// Re-export tất cả từ module mới
module.exports = require('./elo');

