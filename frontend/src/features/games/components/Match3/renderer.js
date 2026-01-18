// Match3 Canvas Renderer
import { CELL_SIZE, CANDY_COLORS } from './constants';
import { easeInOutCubic, easeOutBack } from './utils';

/**
 * Render the game board to canvas
 */
export const renderBoard = (ctx, {
  canvasSize,
  boardSize,
  board,
  selectedCell,
  dragIdx,
  dragOffset,
  swap,
  swapProgress,
  imagesLoaded,
  images,
  hintCells,
}) => {
  // Clear and draw background
  ctx.fillStyle = "#fef3e4";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Grid - subtle lines
  ctx.strokeStyle = "rgba(139,90,43,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= boardSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvasSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvasSize, i * CELL_SIZE);
    ctx.stroke();
  }

  // Cell backgrounds
  for (let i = 0; i < boardSize * boardSize; i++) {
    const col = i % boardSize;
    const row = Math.floor(i / boardSize);
    const isDragTarget = dragIdx === i;
    const isHint = hintCells && (hintCells.idx1 === i || hintCells.idx2 === i);
    
    ctx.fillStyle = isDragTarget 
      ? "rgba(255,200,100,0.4)" 
      : (row + col) % 2 === 0 
        ? "rgba(255,255,255,0.9)" 
        : "rgba(255,240,210,0.8)";
    ctx.beginPath();
    ctx.roundRect(col * CELL_SIZE + 3, row * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6, 10);
    ctx.fill();

    // Hint highlight effect
    if (isHint) {
      const pulse = Math.sin(performance.now() / 200) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(255, 200, 50, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(col * CELL_SIZE + 4, row * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8, 8);
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = "rgba(255, 200, 50, 0.8)";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = `rgba(255, 220, 100, ${pulse * 0.5})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Draw non-dragged candies first
  board.forEach((candy, idx) => {
    if (candy.type === null || candy.type === undefined) return;
    if (idx === dragIdx) return; // Skip dragged candy

    const col = idx % boardSize;
    let x = col * CELL_SIZE + CELL_SIZE / 2;
    let y = candy.y;

    // Swap animation offset
    if (swap) {
      const eased = easeInOutCubic(swapProgress);
      if (idx === swap.idx1) {
        const col2 = swap.idx2 % boardSize;
        const row2 = Math.floor(swap.idx2 / boardSize);
        x = x + ((col2 * CELL_SIZE + CELL_SIZE / 2) - x) * eased;
        y = candy.targetY + ((row2 * CELL_SIZE + CELL_SIZE / 2) - candy.targetY) * eased;
      } else if (idx === swap.idx2) {
        const col1 = swap.idx1 % boardSize;
        const row1 = Math.floor(swap.idx1 / boardSize);
        x = x + ((col1 * CELL_SIZE + CELL_SIZE / 2) - x) * eased;
        y = candy.targetY + ((row1 * CELL_SIZE + CELL_SIZE / 2) - candy.targetY) * eased;
      }
    }

    const isSelected = selectedCell === idx;
    const baseSize = CELL_SIZE - 12;
    let drawSize = baseSize * candy.scale;

    if (isSelected) {
      const pulse = Math.sin(performance.now() / 150) * 0.08 + 1.1;
      drawSize = baseSize * pulse;
    }

    const squishX = candy.scale < 1 ? 1 + (1 - candy.scale) * 0.5 : 1;
    const squishY = candy.scale;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 4, (drawSize / 2) * squishX * 0.9, (drawSize / 2) * squishY * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    if (isSelected) {
      ctx.shadowColor = CANDY_COLORS[candy.type];
      ctx.shadowBlur = 20;
    }

    ctx.translate(x, y);
    ctx.scale(squishX, squishY);

    if (imagesLoaded && images[candy.type]) {
      ctx.drawImage(images[candy.type], -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      const gradient = ctx.createRadialGradient(-drawSize * 0.2, -drawSize * 0.2, 0, 0, 0, drawSize / 2);
      gradient.addColorStop(0, "#fff");
      gradient.addColorStop(0.4, CANDY_COLORS[candy.type]);
      gradient.addColorStop(1, CANDY_COLORS[candy.type]);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Draw dragged candy on top
  if (dragIdx !== null && board[dragIdx]?.type !== null) {
    renderDraggedCandy(ctx, board[dragIdx], dragIdx, dragOffset, boardSize, imagesLoaded, images);
  }
};

/**
 * Render the candy being dragged with glow effect
 */
const renderDraggedCandy = (ctx, candy, dragIdx, dragOffset, boardSize, imagesLoaded, images) => {
  const col = dragIdx % boardSize;
  const row = Math.floor(dragIdx / boardSize);
  
  let x = col * CELL_SIZE + CELL_SIZE / 2 + (dragOffset.x || 0);
  let y = row * CELL_SIZE + CELL_SIZE / 2 + (dragOffset.y || 0);
  
  const baseSize = CELL_SIZE - 8;
  const drawSize = baseSize * 1.1;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(
    col * CELL_SIZE + CELL_SIZE / 2 + 4, 
    row * CELL_SIZE + CELL_SIZE / 2 + 8, 
    drawSize / 2 * 0.85, 
    drawSize / 2 * 0.5, 
    0, 0, Math.PI * 2
  );
  ctx.fill();

  // Glow effect
  ctx.save();
  ctx.shadowColor = CANDY_COLORS[candy.type] || "#ff9500";
  ctx.shadowBlur = 25;
  ctx.translate(x, y);

  if (imagesLoaded && images[candy.type]) {
    ctx.drawImage(images[candy.type], -drawSize / 2, -drawSize / 2, drawSize, drawSize);
  } else {
    const gradient = ctx.createRadialGradient(-drawSize * 0.2, -drawSize * 0.2, 0, 0, 0, drawSize / 2);
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.4, CANDY_COLORS[candy.type]);
    gradient.addColorStop(1, CANDY_COLORS[candy.type]);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Target cell highlight
  const threshold = CELL_SIZE * 0.28;
  let targetCol = col, targetRow = row;
  
  if (Math.abs(dragOffset.x) > Math.abs(dragOffset.y)) {
    if (dragOffset.x > threshold && col < boardSize - 1) targetCol = col + 1;
    else if (dragOffset.x < -threshold && col > 0) targetCol = col - 1;
  } else {
    if (dragOffset.y > threshold && row < boardSize - 1) targetRow = row + 1;
    else if (dragOffset.y < -threshold && row > 0) targetRow = row - 1;
  }

  if (targetCol !== col || targetRow !== row) {
    ctx.strokeStyle = "rgba(50,205,50,0.8)";
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(
      targetCol * CELL_SIZE + 4, 
      targetRow * CELL_SIZE + 4, 
      CELL_SIZE - 8, 
      CELL_SIZE - 8
    );
    ctx.setLineDash([]);
  }
};

/**
 * Render particles
 */
export const renderParticles = (ctx, particles) => {
  return particles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3;
    p.life -= 0.028;
    if (p.life <= 0) return false;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    return true;
  });
};

/**
 * Render floating texts (combo messages)
 */
export const renderFloatingTexts = (ctx, texts) => {
  return texts.filter(t => {
    t.y -= 1.5;
    t.life -= 0.012;
    if (t.life <= 0) return false;
    const scale = easeOutBack(Math.min(1, (1 - t.life) * 3));
    ctx.globalAlpha = t.life;
    ctx.font = `bold ${32 * scale}px sans-serif`;
    ctx.fillStyle = "#ff6b6b";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 5;
    ctx.textAlign = "center";
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
    ctx.globalAlpha = 1;
    return true;
  });
};
