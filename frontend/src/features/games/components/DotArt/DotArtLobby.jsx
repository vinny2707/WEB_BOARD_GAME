import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Palette,
  Grid3X3,
  Settings,
  X,
  Gamepad2,
  RotateCcw,
  Loader2,
  Users,
  Globe,
  Trophy,
} from "lucide-react";
import useClickSound from "../../hooks/useClickSound";
import useGameSession from "../../hooks/useGameSession";
import { getGames } from "../../../../api/gamesApi";
import GameReviews from "../GameReviews";
import GameRankings from "../GameRankings";
import GameSessionHistory from "../GameSessionHistory";
import GamepadController from "../GamepadController";
import { toast } from "sonner";

// Grid size options
const GRID_SIZES = {
  small: { rows: 16, cols: 16, label: "Nhỏ (16x16)", icon: "🔲" },
  medium: { rows: 24, cols: 24, label: "Vừa (24x24)", icon: "📐" },
  large: { rows: 32, cols: 32, label: "Lớn (32x32)", icon: "📏" },
  xlarge: { rows: 48, cols: 48, label: "Rất lớn (48x48)", icon: "🖼️" },
};

const DotArtLobby = () => {
  const navigate = useNavigate();
  const playClick = useClickSound();

  // Dynamic gameId state
  const [gameId, setGameId] = useState(null);

  // Session management (gameId will be fetched dynamically)
  const {
    checkInProgressSession,
    resumeSession: fetchFullSession,
    isAuthenticated,
  } = useGameSession(gameId);

  // Settings
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    gridSize: "medium",
  });

  // UI state
  const [inProgressSession, setInProgressSession] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoadingResume, setIsLoadingResume] = useState(false);

  // Gamepad navigation state
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const [selectedGridIndex, setSelectedGridIndex] = useState(
    Object.keys(GRID_SIZES).indexOf(gameSettings.gridSize)
  );

  // Grid size keys for navigation
  const gridSizeKeys = Object.keys(GRID_SIZES);

  // Menu items for gamepad navigation
  const getMenuItems = useCallback(() => {
    const items = [];
    if (inProgressSession) {
      items.push({ id: 'resume', label: 'Tiếp tục sáng tạo', action: 'resume' });
    }
    items.push(
      { id: 'play', label: 'Bắt đầu sáng tạo', action: 'play' },
      { id: 'play-settings', label: 'Cài đặt', action: 'play-settings' },
      { id: 'friends', label: 'Sáng tạo cùng bạn bè', action: 'friends' },
      { id: 'contest', label: 'Cuộc thi sáng tạo', action: 'contest' },
      { id: 'online', label: 'Triển lãm online', action: 'online' }
    );
    return items;
  }, [inProgressSession]);

  // Fetch gameId for draw_board on mount
  useEffect(() => {
    const fetchGameId = async () => {
      try {
        const response = await getGames({ limit: 100 });
        const drawBoardGame = response.data?.find(game => game.type === 'draw_board');
        if (drawBoardGame) {
          setGameId(drawBoardGame.id);
        } else {
          console.error('draw_board game not found');
        }
      } catch (error) {
        console.error('Failed to fetch gameId:', error);
      }
    };
    fetchGameId();
  }, []);

  // Check for in-progress session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated && gameId) {
        setIsCheckingSession(true);
        const session = await checkInProgressSession();
        setInProgressSession(session);
      }
      setIsCheckingSession(false);
    };
    checkSession();
  }, [checkInProgressSession, isAuthenticated, gameId]);

  // Handle in-progress change from GameSessionHistory
  const handleInProgressChange = (hasInProgress, firstInProgressSession) => {
    if (hasInProgress && firstInProgressSession) {
      setInProgressSession(firstInProgressSession);
    } else {
      setInProgressSession(null);
    }
  };

  const handleStartGame = () => {
    playClick();
    navigate("/games/dotart/play", { state: { settings: gameSettings, gameId: 7 } });
  };

  const handleResumeGame = async () => {
    playClick();
    setIsLoadingResume(true);

    try {
      // Fetch full session data including game_state with grid
      const fullSession = await fetchFullSession(inProgressSession.id);

      if (fullSession) {
        // Get grid size from saved session if available
        const savedGridSize = fullSession.game_state?.gridSize || "medium";
        navigate("/games/dotart/play", {
          state: {
            settings: { gridSize: savedGridSize },
            resumeSession: fullSession,
            gameId: 7,
          },
        });
      } else {
        // Fallback: start new game if can't load session
        navigate("/games/dotart/play", { state: { settings: gameSettings, gameId: 7 } });
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      navigate("/games/dotart/play", { state: { settings: gameSettings, gameId: 7 } });
    } finally {
      setIsLoadingResume(false);
    }
  };

  const openSettings = (e) => {
    e?.stopPropagation();
    playClick();
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    playClick();
    setShowSettingsModal(false);
  };

  const handlePlayWithFriend = () => {
    playClick();
    toast.info('🚧 Tính năng sáng tạo cùng bạn bè đang được phát triển!');
  };

  const handlePlayOnline = () => {
    playClick();
    toast.info('🚧 Tính năng triển lãm online đang được phát triển!');
  };

  const handleCreateTournament = () => {
    playClick();
    toast.info('🚧 Tính năng cuộc thi sáng tạo đang được phát triển!');
  };

  // Execute menu action helper
  const executeMenuAction = useCallback((index) => {
    const menuItems = getMenuItems();
    const selected = menuItems[index];
    if (selected) {
      switch (selected.action) {
        case 'resume':
          handleResumeGame();
          break;
        case 'play':
          handleStartGame();
          break;
        case 'play-settings':
          openSettings();
          break;
        case 'friends':
          handlePlayWithFriend();
          break;
        case 'contest':
          handleCreateTournament();
          break;
        case 'online':
          handlePlayOnline();
          break;
      }
    }
  }, [getMenuItems]);

  // Gamepad navigation handlers
  const handleGamepadLeft = useCallback(() => {
    playClick();
    if (showSettingsModal) {
      // In settings: navigate grid options left
      setSelectedGridIndex(prev => Math.max(0, prev - 1));
      const newKey = gridSizeKeys[Math.max(0, selectedGridIndex - 1)];
      setGameSettings(prev => ({ ...prev, gridSize: newKey }));
    } else {
      // Main menu - navigate up
      const menuItems = getMenuItems();
      const newIndex = selectedMenuIndex > 0 ? selectedMenuIndex - 1 : menuItems.length - 1;
      setSelectedMenuIndex(newIndex);
    }
  }, [showSettingsModal, selectedGridIndex, gridSizeKeys, selectedMenuIndex, getMenuItems, playClick]);

  const handleGamepadRight = useCallback(() => {
    playClick();
    if (showSettingsModal) {
      // In settings: navigate grid options right
      const maxIdx = gridSizeKeys.length - 1;
      setSelectedGridIndex(prev => Math.min(maxIdx, prev + 1));
      const newKey = gridSizeKeys[Math.min(maxIdx, selectedGridIndex + 1)];
      setGameSettings(prev => ({ ...prev, gridSize: newKey }));
    } else {
      // Main menu - navigate down
      const menuItems = getMenuItems();
      const newIndex = selectedMenuIndex < menuItems.length - 1 ? selectedMenuIndex + 1 : 0;
      setSelectedMenuIndex(newIndex);
    }
  }, [showSettingsModal, selectedGridIndex, gridSizeKeys, selectedMenuIndex, getMenuItems, playClick]);

  const handleGamepadEnter = useCallback(() => {
    playClick();
    if (showSettingsModal) {
      handleSaveSettings();
    } else {
      executeMenuAction(selectedMenuIndex);
    }
  }, [showSettingsModal, selectedMenuIndex, executeMenuAction, playClick]);

  const handleGamepadBack = useCallback(() => {
    playClick();
    if (showSettingsModal) {
      setShowSettingsModal(false);
    } else {
      navigate('/games');
    }
  }, [showSettingsModal, navigate, playClick]);

  const handleGamepadHint = useCallback(() => {
    playClick();
    if (showSettingsModal) {
      toast.info('← → để chọn kích thước, Enter để lưu, Back để quay lại');
    } else {
      const menuItems = getMenuItems();
      const selected = menuItems[selectedMenuIndex];
      toast.info(`${selected?.label || 'Menu'} - Dùng ← → để chọn, Enter để vào`);
    }
  }, [showSettingsModal, selectedMenuIndex, getMenuItems, playClick]);

  // Helper to check if menu item is selected
  const isMenuSelected = (action) => {
    const menuItems = getMenuItems();
    const currentItem = menuItems[selectedMenuIndex];
    return currentItem?.action === action;
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-card border-b border-border">
        <button
          className="w-10 h-10 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
          onClick={() => {
            playClick();
            navigate("/games");
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-[60px] h-[60px] bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl p-2 flex items-center justify-center border-2 border-border">
            <Palette size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground m-0">Dot Art</h1>
            <p className="text-sm text-muted-foreground mt-1 m-0">
              Sáng tạo pixel art tuyệt đẹp!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
        {/* Left Side - Leaderboard */}
        <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
          <GameRankings
            gameId={7}
            themeColor="pink"
            limit={8}
            showCountdown={false}
          />
        </div>

        {/* Center - Play Modes */}
        <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
          <div className="flex flex-col gap-3">
            {/* Resume Game Button */}
            {isCheckingSession ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin text-pink-500" size={24} />
              </div>
            ) : (
              inProgressSession && (
                <button
                  className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-blue-600 hover:to-blue-700 animate-pulse disabled:opacity-70 ${isMenuSelected('resume') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                  onClick={handleResumeGame}
                  disabled={isLoadingResume}
                >
                  {isLoadingResume ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <RotateCcw size={20} />
                  )}
                  <div className="flex-1 flex flex-col text-left">
                    <span className="font-semibold">Tiếp tục sáng tạo</span>
                    <span className="text-xs opacity-80">
                      Bạn có tác phẩm đang dở
                    </span>
                  </div>
                </button>
              )
            )}

            {/* Play Now Button with Settings */}
            <div className="flex items-center gap-2">
              <button
                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-pink-600 hover:to-purple-700 ${isMenuSelected('play') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                onClick={handleStartGame}
              >
                <Gamepad2 size={20} />
                <div className="flex-1 flex flex-col text-left">
                  <span className="font-semibold">Bắt đầu sáng tạo</span>
                  <span className="text-xs opacity-80">Tạo pixel art mới</span>
                </div>
              </button>
              <button
                className={`w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all ${isMenuSelected('play-settings') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                onClick={openSettings}
              >
                <Settings size={18} />
              </button>
            </div>

            {/* Current Settings Summary */}
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-xl">
              <Grid3X3 size={16} className="text-pink-500" />
              <span className="text-sm text-muted-foreground">Kích thước:</span>
              <span className="text-sm font-medium">
                {GRID_SIZES[gameSettings.gridSize].label}
              </span>
            </div>

            <button
              className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500 ${isMenuSelected('friends') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
              onClick={handlePlayWithFriend}
            >
              <Users size={20} />
              <span className="flex-1 text-left">Sáng tạo cùng bạn bè</span>
              <Settings size={16} className="text-muted-foreground" />
            </button>

            <button
              className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500 ${isMenuSelected('contest') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
              onClick={handleCreateTournament}
            >
              <Trophy size={20} />
              <span className="flex-1 text-left">Cuộc thi sáng tạo</span>
            </button>

            <button
              className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500 ${isMenuSelected('online') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
              onClick={handlePlayOnline}
            >
              <Globe size={20} />
              <div className="flex-1 flex flex-col text-left">
                <span>Triển lãm online</span>
                <span className="text-xs text-muted-foreground">
                  Xem tác phẩm của mọi người
                </span>
              </div>
            </button>

            {/* Game Session History */}
            {isAuthenticated && (
              <GameSessionHistory
                gameId={7}
                limit={5}
                gamePath="/games/dotart"
                onInProgressChange={handleInProgressChange}
                gameType="creative"
              />
            )}
          </div>

          {/* How to Play */}
          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <h3 className="text-base font-semibold text-foreground mb-3">
              Hướng dẫn sử dụng
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                🖌️ <span className="text-foreground font-medium">Bút vẽ:</span>{" "}
                Click/kéo để vẽ từng điểm
              </li>
              <li>
                ⬜{" "}
                <span className="text-foreground font-medium">
                  Hình chữ nhật:
                </span>{" "}
                Kéo để tạo vùng vuông
              </li>
              <li>
                ⭕{" "}
                <span className="text-foreground font-medium">Hình oval:</span>{" "}
                Kéo để tạo hình elip
              </li>
              <li>
                🎨{" "}
                <span className="text-foreground font-medium">Bảng màu:</span>{" "}
                48 màu có sẵn + tùy chỉnh
              </li>
              <li>
                💾 Nhấn <span className="text-foreground font-medium">Lưu</span>{" "}
                để lưu tiến trình
              </li>
              <li>
                ✅ Nhấn{" "}
                <span className="text-foreground font-medium">Hoàn thành</span>{" "}
                khi xong
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Reviews */}
        <div className="w-96 flex-shrink-0 max-lg:w-full max-lg:order-3">
          <GameReviews gameId={7} />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-pink-500" />
                <h2 className="text-lg font-bold text-foreground m-0">
                  Cài đặt
                </h2>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                onClick={() => setShowSettingsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Game Info */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-600 rounded-lg p-1.5 flex items-center justify-center">
                  <Palette size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground m-0">
                    Dot Art
                  </p>
                  <p className="text-xs text-muted-foreground m-0">
                    Sáng tạo pixel art tuyệt đẹp!
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Grid Size */}
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-3 block">
                  Kích thước lưới (← → để chọn)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(GRID_SIZES).map(([key, value], idx) => (
                    <button
                      key={key}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        gameSettings.gridSize === key
                          ? "bg-pink-500/20 border-pink-500 text-pink-600"
                          : "bg-secondary border-border hover:bg-accent"
                      } ${selectedGridIndex === idx && showSettingsModal ? "ring-2 ring-yellow-400" : ""}`}
                      onClick={() => {
                        playClick();
                        setGameSettings((prev) => ({ ...prev, gridSize: key }));
                        setSelectedGridIndex(idx);
                      }}
                    >
                      <span className="text-lg mr-2">{value.icon}</span>
                      <span className="text-sm font-medium">{value.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border">
              <button
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                onClick={handleSaveSettings}
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gamepad Controller */}
      <GamepadController
        onLeft={handleGamepadLeft}
        onRight={handleGamepadRight}
        onBack={handleGamepadBack}
        onEnter={handleGamepadEnter}
        onHint={handleGamepadHint}
      />
    </div>
  );
};

export default DotArtLobby;
