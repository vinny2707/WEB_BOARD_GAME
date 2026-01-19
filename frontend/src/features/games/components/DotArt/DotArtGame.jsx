import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Pen,
  Square,
  Circle,
  Triangle,
  Eraser,
  Trash2,
  Download,
  Undo2,
  Redo2,
  Grid3X3,
  Palette,
  Save,
  ZoomIn,
  ZoomOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import useClickSound from "../../hooks/useClickSound";
import useGameSession from "../../hooks/useGameSession";
import { toast } from "sonner";

// Color palette
const COLOR_PALETTE = [
  // Row 1 - Basic colors
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  // Row 2 - Warm colors
  "#FF6B6B",
  "#FF8E53",
  "#FFD93D",
  "#FFA07A",
  "#FF69B4",
  "#FF1493",
  "#DC143C",
  "#B22222",
  // Row 3 - Cool colors
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#87CEEB",
  "#6A5ACD",
  "#7B68EE",
  "#4169E1",
  "#1E90FF",
  // Row 4 - Earth tones
  "#8B4513",
  "#A0522D",
  "#D2691E",
  "#CD853F",
  "#DEB887",
  "#F5DEB3",
  "#556B2F",
  "#6B8E23",
  // Row 5 - Pastels
  "#FFB6C1",
  "#FFDAB9",
  "#E6E6FA",
  "#B0E0E6",
  "#98FB98",
  "#F0E68C",
  "#DDA0DD",
  "#AFEEEE",
  // Row 6 - Grays
  "#2C2C2C",
  "#4A4A4A",
  "#6B6B6B",
  "#8C8C8C",
  "#ADADAD",
  "#CECECE",
  "#E8E8E8",
  "#F5F5F5",
];

// Tools
const TOOLS = {
  PEN: "pen",
  RECTANGLE: "rectangle",
  TRIANGLE: "triangle",
  OVAL: "oval",
  ERASER: "eraser",
};

// Grid sizes
const GRID_SIZES = {
  small: { rows: 16, cols: 16, label: "Nhỏ (16x16)" },
  medium: { rows: 24, cols: 24, label: "Vừa (24x24)" },
  large: { rows: 32, cols: 32, label: "Lớn (32x32)" },
  xlarge: { rows: 48, cols: 48, label: "Rất lớn (48x48)" },
};

const DotArtGame = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const playClick = useClickSound();
  const gridRef = useRef(null);
  const sessionStartedRef = useRef(false); // Guard to prevent double session creation

  // Settings from lobby and resume session
  const settings = location.state?.settings || { gridSize: "medium" };
  const resumeSession = location.state?.resumeSession;

  // Use gridSize from resume session if available, otherwise from settings
  const effectiveGridSize =
    resumeSession?.game_state?.gridSize || settings.gridSize || "medium";
  const gridConfig = GRID_SIZES[effectiveGridSize] || GRID_SIZES.medium;

  // Session tracking (gameId=7 for DotArt/DrawBoard)
  const {
    startSession,
    saveProgress,
    completeGame,
    updateGameState,
    setResumeSessionId,
    isAuthenticated,
    sessionId,
  } = useGameSession(7, { autoSave: true, saveInterval: 30 });

  // State
  const [grid, setGrid] = useState(() => {
    // If resuming, use saved grid; otherwise create new blank grid
    if (resumeSession?.game_state?.grid) {
      console.log("Resuming with saved grid:", resumeSession.game_state.grid);
      return resumeSession.game_state.grid;
    }
    return Array(gridConfig.rows)
      .fill(null)
      .map(() => Array(gridConfig.cols).fill("#FFFFFF"));
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    if (resumeSession?.game_state?.selectedColor) {
      return resumeSession.game_state.selectedColor;
    }
    return "#000000";
  });
  const [selectedTool, setSelectedTool] = useState(TOOLS.PEN);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [previewCells, setPreviewCells] = useState([]);
  const [showGrid, setShowGrid] = useState(() => {
    if (resumeSession?.game_state?.showGrid !== undefined) {
      return resumeSession.game_state.showGrid;
    }
    return true;
  });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [dotSize, setDotSize] = useState(16);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Start or resume session
  useEffect(() => {
    // Guard: prevent double session creation (React Strict Mode / re-renders)
    if (sessionStartedRef.current) return;
    
    if (resumeSession) {
      // Resume existing session - set session ID for tracking
      console.log("Resume session data:", resumeSession);
      sessionStartedRef.current = true;
      setResumeSessionId(
        resumeSession.id,
        resumeSession.started_at,
        resumeSession.moves_count || 0
      );
      // Note: grid, selectedColor, showGrid are already initialized from resumeSession in useState
    } else if (isAuthenticated) {
      // Start new session only if NOT resuming
      console.log("Starting NEW session");
      sessionStartedRef.current = true;
      startSession(settings, {
        grid,
        selectedColor: "#000000",
        showGrid: true,
        gridSize: effectiveGridSize,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update game state for auto-save
  useEffect(() => {
    updateGameState({
      grid,
      selectedColor,
      showGrid,
      gridSize: effectiveGridSize,
    });
  }, [grid, selectedColor, showGrid, effectiveGridSize, updateGameState]);

  // Save to history
  const saveToHistory = useCallback(
    (newGrid) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.stringify(newGrid));
      // Keep only last 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Initialize history on mount
  useEffect(() => {
    setHistory([JSON.stringify(grid)]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      playClick();
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGrid(JSON.parse(history[newIndex]));
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      playClick();
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGrid(JSON.parse(history[newIndex]));
    }
  };

  // Get cell coordinates from mouse event
  const getCellFromEvent = (e) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / dotSize);
    const row = Math.floor(y / dotSize);
    if (
      row >= 0 &&
      row < gridConfig.rows &&
      col >= 0 &&
      col < gridConfig.cols
    ) {
      return { row, col };
    }
    return null;
  };

  // Get cells in rectangle
  const getRectangleCells = (start, end) => {
    const cells = [];
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push({ row, col });
      }
    }
    return cells;
  };

  // Get cells in triangle
  const getTriangleCells = (start, end) => {
    const cells = [];
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const height = maxRow - minRow;
    const width = maxCol - minCol;

    if (height === 0 || width === 0) return cells;

    // Triangle with apex at top center, base at bottom
    const apexCol = (minCol + maxCol) / 2;

    for (let row = minRow; row <= maxRow; row++) {
      // Calculate the width at this row level
      const progress = (row - minRow) / height; // 0 at top, 1 at bottom
      const halfWidthAtRow = (width / 2) * progress;
      const leftCol = Math.floor(apexCol - halfWidthAtRow);
      const rightCol = Math.ceil(apexCol + halfWidthAtRow);

      for (let col = leftCol; col <= rightCol; col++) {
        if (col >= minCol && col <= maxCol) {
          cells.push({ row, col });
        }
      }
    }
    return cells;
  };

  // Get cells in oval using ellipse equation
  const getOvalCells = (start, end) => {
    const cells = [];
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    // Center and radii of the ellipse
    const centerX = (minCol + maxCol) / 2;
    const centerY = (minRow + maxRow) / 2;
    const radiusX = (maxCol - minCol) / 2 + 0.5;
    const radiusY = (maxRow - minRow) / 2 + 0.5;

    if (radiusX === 0 || radiusY === 0) return cells;

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        // Check if point (col, row) is inside ellipse
        // Ellipse equation: ((x-h)/a)^2 + ((y-k)/b)^2 <= 1
        const normalizedX = (col + 0.5 - centerX) / radiusX;
        const normalizedY = (row + 0.5 - centerY) / radiusY;
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          cells.push({ row, col });
        }
      }
    }
    return cells;
  };

  // Handle mouse down
  const handleMouseDown = (e) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    setIsDrawing(true);
    setStartPoint(cell);

    if (selectedTool === TOOLS.PEN || selectedTool === TOOLS.ERASER) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[cell.row][cell.col] =
        selectedTool === TOOLS.ERASER ? "#FFFFFF" : selectedColor;
      setGrid(newGrid);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;

    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (selectedTool === TOOLS.PEN || selectedTool === TOOLS.ERASER) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[cell.row][cell.col] =
        selectedTool === TOOLS.ERASER ? "#FFFFFF" : selectedColor;
      setGrid(newGrid);
    } else if (selectedTool === TOOLS.RECTANGLE) {
      const cells = getRectangleCells(startPoint, cell);
      setPreviewCells(cells);
    } else if (selectedTool === TOOLS.TRIANGLE) {
      const cells = getTriangleCells(startPoint, cell);
      setPreviewCells(cells);
    } else if (selectedTool === TOOLS.OVAL) {
      const cells = getOvalCells(startPoint, cell);
      setPreviewCells(cells);
    }
  };

  // Handle mouse up
  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    const cell = getCellFromEvent(e);

    if (
      (selectedTool === TOOLS.RECTANGLE ||
        selectedTool === TOOLS.TRIANGLE ||
        selectedTool === TOOLS.OVAL) &&
      startPoint &&
      cell
    ) {
      const newGrid = grid.map((row) => [...row]);
      let cells;
      if (selectedTool === TOOLS.RECTANGLE) {
        cells = getRectangleCells(startPoint, cell);
      } else if (selectedTool === TOOLS.TRIANGLE) {
        cells = getTriangleCells(startPoint, cell);
      } else {
        cells = getOvalCells(startPoint, cell);
      }

      cells.forEach(({ row, col }) => {
        newGrid[row][col] = selectedColor;
      });
      setGrid(newGrid);
      saveToHistory(newGrid);
    } else if (selectedTool === TOOLS.PEN || selectedTool === TOOLS.ERASER) {
      saveToHistory(grid);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setPreviewCells([]);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (
      isDrawing &&
      (selectedTool === TOOLS.PEN || selectedTool === TOOLS.ERASER)
    ) {
      saveToHistory(grid);
    }
    setIsDrawing(false);
    setStartPoint(null);
    setPreviewCells([]);
  };

  // Clear board
  const handleClear = () => {
    playClick();
    const newGrid = Array(gridConfig.rows)
      .fill(null)
      .map(() => Array(gridConfig.cols).fill("#FFFFFF"));
    setGrid(newGrid);
    saveToHistory(newGrid);
  };

  // Download as PNG
  const handleDownload = () => {
    playClick();
    const canvas = document.createElement("canvas");
    const scale = 20; // Each dot is 20x20 pixels in exported image
    canvas.width = gridConfig.cols * scale;
    canvas.height = gridConfig.rows * scale;
    const ctx = canvas.getContext("2d");

    grid.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(
          colIndex * scale + scale / 2,
          rowIndex * scale + scale / 2,
          scale / 2 - 1,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
    });

    const link = document.createElement("a");
    link.download = `dot-art-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Complete artwork - mark as finished
  const handleComplete = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để hoàn thành tác phẩm");
      return;
    }

    playClick();
    setIsCompleting(true);
    try {
      // Calculate score based on colored dots
      const coloredDots = grid.flat().filter((c) => c !== "#FFFFFF").length;
      await completeGame({
        result: "win",
        score: coloredDots,
        gameState: {
          grid,
          selectedColor,
          showGrid,
          gridSize: effectiveGridSize,
        },
      });
      toast.success("Đã hoàn thành tác phẩm! 🎨");
      // Navigate back to lobby after a short delay
      setTimeout(() => {
        navigate("/games/dotart");
      }, 1500);
    } catch {
      toast.error("Không thể hoàn thành tác phẩm");
    } finally {
      setIsCompleting(false);
    }
  };

  // Manual save progress
  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu tiến trình");
      return;
    }

    playClick();
    setIsSaving(true);
    try {
      await saveProgress({
        grid,
        selectedColor,
        showGrid,
        gridSize: effectiveGridSize,
      });
      toast.success("Đã lưu tiến trình!");
    } catch {
      toast.error("Không thể lưu tiến trình");
    } finally {
      setIsSaving(false);
    }
  };

  // Check if cell is in preview
  const isPreviewCell = (row, col) => {
    return previewCells.some((cell) => cell.row === row && cell.col === col);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (dotSize < 24) {
      playClick();
      setDotSize((prev) => prev + 2);
    }
  };

  const handleZoomOut = () => {
    if (dotSize > 8) {
      playClick();
      setDotSize((prev) => prev - 2);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background text-foreground overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
            onClick={() => {
              playClick();
              navigate("/games/dotart");
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Palette size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground m-0">Dot Art</h1>
              <p className="text-xs text-muted-foreground m-0">
                {gridConfig.label}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Hoàn tác (Undo)"
          >
            <Undo2 size={18} />
          </button>
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Làm lại (Redo)"
          >
            <Redo2 size={18} />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            onClick={handleZoomOut}
            title="Thu nhỏ"
          >
            <ZoomOut size={18} />
          </button>
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            onClick={handleZoomIn}
            title="Phóng to"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            className={`p-2 rounded-lg transition-colors ${showGrid ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-accent"}`}
            onClick={() => {
              playClick();
              setShowGrid(!showGrid);
            }}
            title="Hiện/ẩn lưới"
          >
            <Grid3X3 size={18} />
          </button>
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={isSaving || !isAuthenticated}
            title="Lưu tiến trình"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </button>
          <button
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            onClick={handleDownload}
            title="Tải xuống"
          >
            <Download size={18} />
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-all disabled:opacity-50"
            onClick={handleComplete}
            disabled={isCompleting || !isAuthenticated}
            title="Hoàn thành tác phẩm"
          >
            {isCompleting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span className="text-sm font-medium">Hoàn thành</span>
          </button>
          <button
            className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
            onClick={handleClear}
            title="Xóa tất cả"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar - Left Side */}
        <div className="w-64 bg-card border-r border-border p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Công cụ
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { tool: TOOLS.PEN, icon: Pen, label: "Bút vẽ" },
                { tool: TOOLS.RECTANGLE, icon: Square, label: "Hình chữ nhật" },
                { tool: TOOLS.TRIANGLE, icon: Triangle, label: "Tam giác" },
                { tool: TOOLS.OVAL, icon: Circle, label: "Hình oval" },
                { tool: TOOLS.ERASER, icon: Eraser, label: "Tẩy" },
              ].map(({ tool, icon: ToolIcon, label }) => (
                <button
                  key={tool}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    selectedTool === tool
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-secondary hover:bg-accent"
                  }`}
                  onClick={() => {
                    playClick();
                    setSelectedTool(tool);
                  }}
                >
                  <ToolIcon size={18} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Color */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Màu hiện tại
            </h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl border-2 border-border shadow-inner cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            {/* Custom color picker */}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-8 mt-2 rounded cursor-pointer"
            />
          </div>

          {/* Color Palette */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Bảng màu
            </h3>
            <div className="grid grid-cols-8 gap-1">
              {COLOR_PALETTE.map((color, index) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                    selectedColor === color
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                      : "border border-border/50"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    playClick();
                    setSelectedColor(color);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-auto">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Hướng dẫn
            </h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                • <strong>Bút vẽ:</strong> Click/kéo để vẽ
              </p>
              <p>
                • <strong>Hình chữ nhật:</strong> Kéo để tạo hình
              </p>
              <p>
                • <strong>Hình oval:</strong> Kéo để tạo hình elip
              </p>
              <p>
                • <strong>Tẩy:</strong> Click/kéo để xóa
              </p>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/30 overflow-auto">
          <div
            ref={gridRef}
            className="relative bg-white rounded-2xl shadow-2xl cursor-crosshair select-none"
            style={{
              width: gridConfig.cols * dotSize,
              height: gridConfig.rows * dotSize,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid dots */}
            <div
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridConfig.cols}, ${dotSize}px)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, ${dotSize}px)`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((color, colIndex) => {
                  const isPreview = isPreviewCell(rowIndex, colIndex);
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`flex items-center justify-center ${showGrid ? "border border-gray-100" : ""}`}
                    >
                      <div
                        className="rounded-full transition-colors duration-75"
                        style={{
                          width: dotSize - 2,
                          height: dotSize - 2,
                          backgroundColor: isPreview ? selectedColor : color,
                          opacity: isPreview ? 0.6 : 1,
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotArtGame;
