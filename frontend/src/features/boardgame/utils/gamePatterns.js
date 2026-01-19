import { MATRIX_ROWS, MATRIX_COLS, createEmptyMatrix } from "./constants";

// Helper functions
const centerH = (width) => Math.floor((MATRIX_COLS - width) / 2);
const centerV = (height) => Math.floor((MATRIX_ROWS - height) / 2);

/**
 * Game preview patterns for selection screen - 7 games
 */
export const GAME_PATTERNS = {
  // 1. TicTacToe 3x3
  tictactoe: {
    name: "TIC TAC TOE",
    type: "tictactoe",
    backendType: "tictactoe", // Matches backend game.type
    apiId: 3, // Fallback if API fetch fails
    pattern: (() => {
      const p = createEmptyMatrix();
      const size = 18;
      const oC = centerH(size);
      const oR = centerV(size);

      // Grid lines
      for (let i = 0; i < size; i++) {
        p[oR + i][oC + 6] = "cyan";
        p[oR + i][oC + 12] = "cyan";
        p[oR + 6][oC + i] = "cyan";
        p[oR + 12][oC + i] = "cyan";
      }

      // X in top-left
      for (let d = 1; d < 5; d++) {
        p[oR + d][oC + d] = "green";
        p[oR + d][oC + 5 - d] = "green";
      }

      // O in center
      for (let a = 0; a < 8; a++) {
        const angle = (a / 8) * Math.PI * 2;
        const r = Math.round(oR + 9 + Math.sin(angle) * 2);
        const c = Math.round(oC + 9 + Math.cos(angle) * 2);
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) p[r][c] = "blue";
      }

      return p;
    })(),
  },

  // 2. Snake
  snake: {
    name: "SNAKE",
    type: "snake",
    backendType: "snake",
    apiId: 4,
    pattern: (() => {
      const p = createEmptyMatrix();
      const oR = centerV(12);
      const oC = centerH(24);

      // Snake body (curved)
      const snakeBody = [[6,0],[6,1],[6,2],[6,3],[5,3],[4,3],[4,4],[4,5],[4,6],[3,6],[2,6],[2,7],[2,8]];
      snakeBody.forEach(([r,c], i) => {
        p[oR + r][oC + c] = i === snakeBody.length - 1 ? "yellow" : "green";
      });
      // Eye
      p[oR + 2][oC + 9] = "white";

      // Apple
      p[oR + 5][oC + 16] = "red";
      p[oR + 5][oC + 17] = "red";
      p[oR + 6][oC + 16] = "red";
      p[oR + 6][oC + 17] = "red";
      p[oR + 4][oC + 17] = "green"; // stem

      return p;
    })(),
  },

  // 3. Memory Cards - 4x3 grid = 12 cards = 6 proper pairs
  memory: {
    name: "MEMORY",
    type: "memory",
    backendType: "memory",
    apiId: 6,
    pattern: (() => {
      const p = createEmptyMatrix();
      // 6 pairs of colors for 12 cards
      const pairColors = ["blue", "cyan", "purple", "orange", "green", "red"];
      // Arrange 3 rows x 4 cols with matching pairs
      const cardLayout = [
        [0, 1, 2, 3],  // blue, cyan, purple, orange
        [4, 5, 0, 1],  // green, red, blue, cyan
        [2, 3, 4, 5],  // purple, orange, green, red
      ];
      
      const cardSize = 5;
      const gap = 1;
      const totalW = 4 * cardSize + 3 * gap;
      const totalH = 3 * cardSize + 2 * gap;
      const oR = centerV(totalH);
      const oC = centerH(totalW);

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          const colorIdx = cardLayout[row][col];
          const color = pairColors[colorIdx];
          const r = oR + row * (cardSize + gap);
          const c = oC + col * (cardSize + gap);
          
          // Card filled rectangle
          for (let dr = 0; dr < cardSize; dr++) {
            for (let dc = 0; dc < cardSize; dc++) {
              if (r + dr >= 0 && r + dr < MATRIX_ROWS && c + dc >= 0 && c + dc < MATRIX_COLS) {
                // Border
                if (dr === 0 || dr === cardSize - 1 || dc === 0 || dc === cardSize - 1) {
                  p[r + dr][c + dc] = color;
                }
              }
            }
          }
          // Show some revealed (same color pairs)
          if ((row === 0 && col === 0) || (row === 1 && col === 2)) {
            // Show matching blue pair revealed
            const centerR = r + Math.floor(cardSize / 2);
            const centerC = c + Math.floor(cardSize / 2);
            if (centerR < MATRIX_ROWS && centerC < MATRIX_COLS) {
              p[centerR][centerC] = "yellow";
            }
          }
        }
      }
      return p;
    })(),
  },

  // 4. Caro 4 - Simple board with 4-in-a-row highlight
  caro4: {
    name: "CARO 4",
    type: "caro4",
    backendType: "caro_4",
    apiId: 2,
    pattern: (() => {
      const p = createEmptyMatrix();
      const gridSize = 5; // 5x5 intersections
      const spacing = 4; // space between dots
      const totalSize = (gridSize - 1) * spacing;
      const oR = centerV(totalSize);
      const oC = centerH(totalSize);

      // Draw intersection dots (small cyan dots)
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const r = oR + row * spacing;
          const c = oC + col * spacing;
          if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
            p[r][c] = "cyan";
          }
        }
      }

      // Draw 4 X pieces in diagonal (winning - yellow/bright)
      [[0, 0], [1, 1], [2, 2], [3, 3]].forEach(([row, col]) => {
        const r = oR + row * spacing;
        const c = oC + col * spacing;
        // X shape - 3x3
        for (let d = -1; d <= 1; d++) {
          if (r + d >= 0 && r + d < MATRIX_ROWS && c + d >= 0 && c + d < MATRIX_COLS) {
            p[r + d][c + d] = "yellow";
          }
          if (r + d >= 0 && r + d < MATRIX_ROWS && c - d >= 0 && c - d < MATRIX_COLS) {
            p[r + d][c - d] = "yellow";
          }
        }
      });

      // Some O pieces (blue circles)
      [[0, 3], [1, 4], [3, 1]].forEach(([row, col]) => {
        const r = oR + row * spacing;
        const c = oC + col * spacing;
        // O shape - small circle
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          p[r][c] = "blue";
          if (r - 1 >= 0) p[r - 1][c] = "blue";
          if (r + 1 < MATRIX_ROWS) p[r + 1][c] = "blue";
          if (c - 1 >= 0) p[r][c - 1] = "blue";
          if (c + 1 < MATRIX_COLS) p[r][c + 1] = "blue";
        }
      });

      return p;
    })(),
  },

  // 5. Caro 5 (Gomoku) - Simple board with 5-in-a-row highlight
  caro5: {
    name: "CARO 5",
    type: "caro5",
    backendType: "caro_5",
    apiId: 1,
    pattern: (() => {
      const p = createEmptyMatrix();
      const gridSize = 6; // 6x6 intersections
      const spacing = 4;
      const totalSize = (gridSize - 1) * spacing;
      const oR = centerV(totalSize);
      const oC = centerH(totalSize);

      // Draw intersection dots (small cyan dots)
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const r = oR + row * spacing;
          const c = oC + col * spacing;
          if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
            p[r][c] = "cyan";
          }
        }
      }

      // Draw 5 X pieces in horizontal (winning - yellow/bright)
      const winRow = 2;
      for (let col = 0; col < 5; col++) {
        const r = oR + winRow * spacing;
        const c = oC + col * spacing;
        // X shape - 3x3
        for (let d = -1; d <= 1; d++) {
          if (r + d >= 0 && r + d < MATRIX_ROWS && c + d >= 0 && c + d < MATRIX_COLS) {
            p[r + d][c + d] = "yellow";
          }
          if (r + d >= 0 && r + d < MATRIX_ROWS && c - d >= 0 && c - d < MATRIX_COLS) {
            p[r + d][c - d] = "yellow";
          }
        }
      }

      // Some O pieces (blue circles) scattered
      [[0, 0], [1, 5], [4, 3], [5, 5]].forEach(([row, col]) => {
        const r = oR + row * spacing;
        const c = oC + col * spacing;
        // O shape - small circle
        if (r >= 0 && r < MATRIX_ROWS && c >= 0 && c < MATRIX_COLS) {
          p[r][c] = "blue";
          if (r - 1 >= 0) p[r - 1][c] = "blue";
          if (r + 1 < MATRIX_ROWS) p[r + 1][c] = "blue";
          if (c - 1 >= 0) p[r][c - 1] = "blue";
          if (c + 1 < MATRIX_COLS) p[r][c + 1] = "blue";
        }
      });

      return p;
    })(),
  },

  // 6. Match3 (Candy Crush style) - Show 3-in-a-row glowing
  match3: {
    name: "MATCH 3",
    type: "match3",
    backendType: "match3",
    apiId: 5,
    pattern: (() => {
      const p = createEmptyMatrix();
      const colors = ["red", "orange", "yellow", "green", "blue", "purple"];
      const rows = 5;
      const cols = 6;
      const candySize = 3;
      const gap = 1;
      const totalW = cols * candySize + (cols - 1) * gap;
      const totalH = rows * candySize + (rows - 1) * gap;
      const oR = centerV(totalH);
      const oC = centerH(totalW);

      // Create board with intentional 3-match in middle row
      const board = [
        [0, 1, 2, 3, 4, 5],
        [1, 2, 3, 4, 5, 0],
        [2, 2, 2, 3, 4, 5], // Row 2 has 3 yellows (index 2) in a row!
        [3, 4, 5, 0, 1, 2],
        [4, 5, 0, 1, 2, 3],
      ];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const colorIdx = board[row][col];
          const color = colors[colorIdx];
          const r = oR + row * (candySize + gap);
          const c = oC + col * (candySize + gap);
          
          // Check if this is part of the 3-match (row 2, cols 0-2)
          const isMatch = row === 2 && col < 3;
          const displayColor = isMatch ? "white" : color; // Glowing white for match
          
          // Candy 2x2 filled
          for (let dr = 0; dr < candySize; dr++) {
            for (let dc = 0; dc < candySize; dc++) {
              if (r + dr >= 0 && r + dr < MATRIX_ROWS && c + dc >= 0 && c + dc < MATRIX_COLS) {
                // Draw filled circle (approximate with corners empty)
                if (!((dr === 0 || dr === candySize - 1) && (dc === 0 || dc === candySize - 1))) {
                  p[r + dr][c + dc] = displayColor;
                }
              }
            }
          }
        }
      }

      return p;
    })(),
  },

  // 7. DotArt (Drawing)
  dotart: {
    name: "DOT ART",
    type: "dotart",
    backendType: "draw_board",
    apiId: 7,
    pattern: (() => {
      const p = createEmptyMatrix();
      const oR = centerV(16);
      const oC = centerH(20);

      // Draw a simple heart
      const heart = [
        [0,0,1,1,0,0,0,1,1,0],
        [0,1,1,1,1,0,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,0,0,0,0],
      ];

      heart.forEach((row, ri) => {
        row.forEach((val, ci) => {
          if (val === 1 && oR + ri < MATRIX_ROWS && oC + ci + 5 < MATRIX_COLS && oR + ri >= 0 && oC + ci + 5 >= 0) {
            p[oR + ri][oC + ci + 5] = "red";
          }
        });
      });

      // Pencil icon
      p[oR + 10][oC + 2] = "yellow";
      p[oR + 11][oC + 3] = "yellow";
      p[oR + 12][oC + 4] = "orange";
      p[oR + 13][oC + 5] = "white";

      return p;
    })(),
  },
};

export const GAME_KEYS = Object.keys(GAME_PATTERNS);
