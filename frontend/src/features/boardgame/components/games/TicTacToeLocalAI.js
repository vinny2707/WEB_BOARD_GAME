/**
 * Simple Robust Tic-Tac-Toe AI
 * Logic: Win > Block > Random
 */

// Helper: Check if a board has a winner
export const checkWinner = (board, boardSize = null) => {
    // Determine size
    let size = 3;
    if (boardSize) {
        size = parseInt(boardSize);
    } else {
        size = Math.sqrt(board.length);
    }
    
    // Win length: 5x5 needs 4, 3x3 needs 3
    const winLen = size >= 5 ? 4 : 3;

    // Helper to get value at row,col
    const getVal = (r, c) => {
        if (r < 0 || r >= size || c < 0 || c >= size) return null;
        return board[r * size + c];
    };

    // Check all cells
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = getVal(r, c);
            if (!val) continue;

            // Check Horizontal
            if (c + winLen <= size) {
                let win = true;
                for (let k = 1; k < winLen; k++) if (getVal(r, c + k) !== val) win = false;
                if (win) return val;
            }

            // Check Vertical
            if (r + winLen <= size) {
                let win = true;
                for (let k = 1; k < winLen; k++) if (getVal(r + k, c) !== val) win = false;
                if (win) return val;
            }

            // Check Diagonal \
            if (r + winLen <= size && c + winLen <= size) {
                let win = true;
                for (let k = 1; k < winLen; k++) if (getVal(r + k, c + k) !== val) win = false;
                if (win) return val;
            }

            // Check Diagonal /
            if (r + winLen <= size && c - winLen + 1 >= 0) {
                let win = true;
                for (let k = 1; k < winLen; k++) if (getVal(r + k, c - k) !== val) win = false;
                if (win) return val;
            }
        }
    }
    return null;
};

// Simple draw check
export const isDraw = (board, boardSize = null) => {
    if (checkWinner(board, boardSize)) return false;
    return board.every(cell => cell !== null);
};

// Get winning line indices (for highlighting)
export const getWinningLine = (board, boardSize = null) => {
    let size = 3;
    if (boardSize) size = parseInt(boardSize);
    else size = Math.sqrt(board.length);
    
    const winLen = size >= 5 ? 4 : 3;
    const getIdx = (r, c) => r * size + c;
    const getVal = (r, c) => board[getIdx(r, c)];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = getVal(r, c);
            if (!val) continue;

            // Horizontal
            if (c + winLen <= size) {
                let match = true;
                let line = [];
                for (let k = 0; k < winLen; k++) {
                    if (getVal(r, c + k) !== val) match = false;
                    line.push(getIdx(r, c + k));
                }
                if (match) return line;
            }

            // Vertical
            if (r + winLen <= size) {
                let match = true;
                let line = [];
                for (let k = 0; k < winLen; k++) {
                    if (getVal(r + k, c) !== val) match = false;
                    line.push(getIdx(r + k, c));
                }
                if (match) return line;
            }

            // Diagonal \
            if (r + winLen <= size && c + winLen <= size) {
                let match = true;
                let line = [];
                for (let k = 0; k < winLen; k++) {
                    if (getVal(r + k, c + k) !== val) match = false;
                    line.push(getIdx(r + k, c + k));
                }
                if (match) return line;
            }

            // Diagonal /
            if (r + winLen <= size && c - winLen + 1 >= 0) {
                let match = true;
                let line = [];
                for (let k = 0; k < winLen; k++) {
                    if (getVal(r + k, c - k) !== val) match = false;
                    line.push(getIdx(r + k, c - k));
                }
                if (match) return line;
            }
        }
    }
    return [];
};


// EXTREMELY SIMPLE AI
// Returns a guaranteed valid empty cell index
export const findBestMove = (board, difficulty = 'medium', boardSize = null) => {
    let size = 3;
    if (boardSize) size = parseInt(boardSize);
    else size = Math.sqrt(board.length);

    // 1. Get all empty cells
    const emptyCells = [];
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) emptyCells.push(i);
    }

    if (emptyCells.length === 0) return -1;

    // Helper to simulate move
    const canWin = (player) => {
        for (let move of emptyCells) {
            const tempBoard = [...board];
            tempBoard[move] = player;
            if (checkWinner(tempBoard, size) === player) {
                return move;
            }
        }
        return -1;
    };

    // 2. Win if possible (AI is 'O')
    const winMove = canWin('O');
    if (winMove !== -1) return winMove;

    // 3. Block if necessary (Player is 'X')
    const blockMove = canWin('X');
    if (blockMove !== -1) return blockMove;

    // 4. Center preference (Middle of board)
    const center = Math.floor(size * size / 2);
    if (!board[center]) return center;

    // 5. Random
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
};

export const getHint = (board, boardSize = null) => {
    // Hint simply suggests blocking or winning or random
    return findBestMove(board, 'hard', boardSize);
};
