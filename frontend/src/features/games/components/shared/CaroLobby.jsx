import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Trophy, Globe, Settings, ArrowLeft, Crown, Medal, X, ChevronLeft, Play } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import { getSession } from '../../../../api/sessionsApi';
import GameReviews from '../GameReviews';
import GameRankings from '../GameRankings';
import GameSessionHistory from '../GameSessionHistory';
import GamepadController from '../GamepadController';
import { toast } from 'sonner';
import {
    fetchGameSettings,
    hasApiSetting,
    getSettingValue,
    getSettingOptions,
    getSettingLabel,
    getOptionLabel,
    getOptionColor,
    extractSettingValues
} from '../../utils/settingsConfig';

// Default game settings
const DEFAULT_SETTINGS = {
    boardSize: 15, // Fixed 15x15 for Caro games
    timePerTurn: 40,
    timePerPlayer: 300, // 5 minutes
    firstPlayer: 'random',
    difficulty: 'medium',
};

/**
 * Shared Lobby component for Caro games with Settings Modal
 */
const CaroLobby = ({
    gameName,
    gameDescription,
    playPath,
    gamesPath = '/games',
    leaderboard = [],
    currentUser = { rank: 999, name: 'You', score: 1000 },
    theme = 'emerald',
    icon,
    defaultBoardSize = 15,
    gameId = null, // Game ID for reviews
}) => {
    const navigate = useNavigate();
    const playClick = useClickSound();

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS, boardSize: defaultBoardSize });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // In-progress session state (controlled by GameSessionHistory callback)
    const [inProgressSession, setInProgressSession] = useState(null);

    // Gamepad navigation state
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
    const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [selectedQuickActionIndex, setSelectedQuickActionIndex] = useState(0); // 0 = "Không giới hạn", 1 = "Tùy chỉnh"

    // Menu items for gamepad navigation (including settings buttons)
    const getMenuItems = useCallback(() => {
        const items = [];
        if (inProgressSession) {
            items.push({ id: 'resume', label: 'Tiếp tục chơi', action: 'resume' });
        }
        items.push(
            { id: 'friends', label: 'Chơi với bạn bè', action: 'friends' },
            { id: 'friends-settings', label: 'Cài đặt bạn bè', action: 'friends-settings' },
            { id: 'robot', label: 'Chơi với máy', action: 'robot' },
            { id: 'robot-settings', label: 'Cài đặt máy', action: 'robot-settings' },
            { id: 'tournament', label: 'Tạo giải đấu', action: 'tournament' },
            { id: 'online', label: 'Chơi online', action: 'online' }
        );
        return items;
    }, [inProgressSession]);

    // Fetch game settings from API
    useEffect(() => {
        if (!gameId) return;

        const loadSettings = async () => {
            setIsLoadingSettings(true);
            const { settings } = await fetchGameSettings(gameId);
            if (settings) {
                setApiSettings(settings);
                // Extract flat values from nested settings
                const values = extractSettingValues(settings);
                setGameSettings(prev => ({
                    ...prev,
                    ...values,
                }));
            }
            setIsLoadingSettings(false);
        };

        loadSettings();
    }, [gameId]);

    // Handler for when history updates in_progress status
    const handleInProgressChange = (hasInProgress, firstInProgressSession) => {
        if (hasInProgress && firstInProgressSession) {
            setInProgressSession(firstInProgressSession);
        } else {
            setInProgressSession(null);
        }
    };

    const themeColors = {
        emerald: {
            iconBg: 'from-emerald-200 to-emerald-400',
            primary: 'from-emerald-500 to-emerald-600',
            primaryHover: 'hover:from-emerald-600 hover:to-emerald-700',
            border: 'border-emerald-500',
            hoverBorder: 'hover:border-emerald-500',
            text: 'text-emerald-500',
            textHover: 'hover:text-emerald-600',
            userBg: 'from-emerald-500/15',
            userBorder: 'border-emerald-500/30',
            btnBg: 'bg-emerald-500',
            btnHover: 'hover:bg-emerald-600',
        },
        amber: {
            iconBg: 'from-amber-300 to-amber-500',
            primary: 'from-amber-500 to-amber-600',
            primaryHover: 'hover:from-amber-600 hover:to-amber-700',
            border: 'border-amber-500',
            hoverBorder: 'hover:border-amber-500',
            text: 'text-amber-500',
            textHover: 'hover:text-amber-600',
            userBg: 'from-amber-500/15',
            userBorder: 'border-amber-500/30',
            btnBg: 'bg-amber-500',
            btnHover: 'hover:bg-amber-600',
        }
    };

    const colors = themeColors[theme] || themeColors.emerald;

    const openSettings = (e) => {
        if (e?.stopPropagation) e.stopPropagation();
        playClick();
        setIsCustomMode(false);
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        playClick();
        setShowSettingsModal(false);
        setIsCustomMode(false);
        // Settings are saved in state, game starts when clicking "Chơi với máy"
    };

    const handleSetUnlimitedTime = () => {
        playClick();
        setGameSettings(prev => ({
            ...prev,
            timePerTurn: 0,
            timePerPlayer: 0
        }));
    };

    const handlePlayVsRobot = () => {
        playClick();
        navigate(playPath, { state: { settings: gameSettings } });
    };

    const handleResumeGame = async () => {
        if (!inProgressSession?.id) return;
        playClick();

        try {
            // Fetch full session data with game_state
            const response = await getSession(inProgressSession.id);
            const fullSession = response?.data || inProgressSession;

            // Navigate to game with full session data for restoration
            navigate(playPath, {
                state: {
                    settings: fullSession.settings || gameSettings,
                    resumeSession: fullSession,
                }
            });
        } catch (error) {
            console.error('Failed to fetch session:', error);
            // Fallback: try with existing data
            navigate(playPath, {
                state: {
                    settings: inProgressSession.settings || gameSettings,
                    resumeSession: inProgressSession,
                }
            });
        }
    };

    const handlePlayWithFriend = () => {
        playClick();
        toast.info('🚧 Tính năng chơi với bạn bè đang được phát triển!');
    };

    const handlePlayOnline = () => {
        playClick();
        toast.info('🚧 Tính năng chơi online đang được phát triển!');
    };

    const handleCreateTournament = () => {
        playClick();
        toast.info('🚧 Tính năng tạo giải đấu đang được phát triển!');
    };

    // Gamepad navigation handlers
    const executeMenuAction = useCallback((index) => {
        const menuItems = getMenuItems();
        const selected = menuItems[index];
        if (selected) {
            switch (selected.action) {
                case 'resume':
                    handleResumeGame();
                    break;
                case 'friends':
                    handlePlayWithFriend();
                    break;
                case 'friends-settings':
                    openSettings();
                    break;
                case 'robot':
                    handlePlayVsRobot();
                    break;
                case 'robot-settings':
                    openSettings();
                    break;
                case 'tournament':
                    handleCreateTournament();
                    break;
                case 'online':
                    handlePlayOnline();
                    break;
            }
        }
    }, [getMenuItems, handleResumeGame, handlePlayWithFriend, openSettings, handlePlayVsRobot, handleCreateTournament, handlePlayOnline]);

    const handleGamepadLeft = useCallback(() => {
        playClick();
        if (showSettingsModal && isCustomMode) {
            // In custom mode: change option value to the left
            const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
            if (settingKeys.length > 0) {
                const currentSettingKey = settingKeys[selectedSettingIndex];
                const options = getSettingOptions(apiSettings, currentSettingKey);
                const currentValue = gameSettings[currentSettingKey];
                const currentIdx = options.findIndex(opt => opt.value === currentValue);
                if (currentIdx > 0) {
                    setGameSettings(prev => ({
                        ...prev,
                        [currentSettingKey]: options[currentIdx - 1].value
                    }));
                }
            }
        } else if (showSettingsModal) {
            // In summary mode: switch between quick action buttons
            setSelectedQuickActionIndex(prev => Math.max(0, prev - 1));
        } else {
            // Main menu - navigate up and auto-execute
            const menuItems = getMenuItems();
            const newIndex = selectedMenuIndex > 0 ? selectedMenuIndex - 1 : menuItems.length - 1;
            setSelectedMenuIndex(newIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, gameSettings, selectedMenuIndex, getMenuItems, playClick]);

    const handleGamepadRight = useCallback(() => {
        playClick();
        if (showSettingsModal && isCustomMode) {
            // In custom mode: change option value to the right
            const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
            if (settingKeys.length > 0) {
                const currentSettingKey = settingKeys[selectedSettingIndex];
                const options = getSettingOptions(apiSettings, currentSettingKey);
                const currentValue = gameSettings[currentSettingKey];
                const currentIdx = options.findIndex(opt => opt.value === currentValue);
                if (currentIdx < options.length - 1) {
                    setGameSettings(prev => ({
                        ...prev,
                        [currentSettingKey]: options[currentIdx + 1].value
                    }));
                }
            }
        } else if (showSettingsModal) {
            // In summary mode: switch between quick action buttons
            setSelectedQuickActionIndex(prev => Math.min(1, prev + 1));
        } else {
            // Main menu - navigate down
            const menuItems = getMenuItems();
            const newIndex = selectedMenuIndex < menuItems.length - 1 ? selectedMenuIndex + 1 : 0;
            setSelectedMenuIndex(newIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, gameSettings, selectedMenuIndex, getMenuItems, playClick]);

    const handleGamepadEnter = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                // In custom mode: move to next setting or save
                const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
                if (selectedSettingIndex < settingKeys.length - 1) {
                    setSelectedSettingIndex(prev => prev + 1);
                } else {
                    handleSaveSettings();
                }
            } else {
                // In summary mode: execute selected quick action
                if (selectedQuickActionIndex === 0) {
                    handleSetUnlimitedTime();
                } else {
                    setIsCustomMode(true);
                    setSelectedSettingIndex(0);
                }
            }
        } else {
            // Execute selected menu action
            executeMenuAction(selectedMenuIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, selectedMenuIndex, executeMenuAction, playClick]);

    const handleGamepadBack = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                setIsCustomMode(false);
            } else {
                setShowSettingsModal(false);
            }
        } else {
            navigate(gamesPath);
        }
    }, [showSettingsModal, isCustomMode, navigate, gamesPath, playClick]);

    const handleGamepadHint = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
                const currentSetting = settingKeys[selectedSettingIndex];
                const label = currentSetting ? getSettingLabel(apiSettings, currentSetting) : 'Cài đặt';
                toast.info(`${label}: ← → để đổi giá trị, Enter xuống dòng tiếp, Back quay lại`);
            } else {
                const actions = ['Không giới hạn thời gian', 'Tùy chỉnh'];
                toast.info(`${actions[selectedQuickActionIndex]}: ← → để chọn, Enter để thực hiện`);
            }
        } else {
            const menuItems = getMenuItems();
            const selected = menuItems[selectedMenuIndex];
            toast.info(`${selected?.label || 'Menu'} - Dùng ← → để chọn, Enter để vào`);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, selectedQuickActionIndex, selectedMenuIndex, getMenuItems, playClick]);

    // Helper to check if menu item is selected by action type
    const isMenuSelected = (action) => {
        const menuItems = getMenuItems();
        const currentItem = menuItems[selectedMenuIndex];
        return currentItem?.action === action;
    };
    
    // Helper to check if settings button is selected
    const isSettingsSelected = (mode) => {
        const menuItems = getMenuItems();
        const currentItem = menuItems[selectedMenuIndex];
        return currentItem?.action === `${mode}-settings`;
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate(gamesPath)}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <div className={`w-[60px] h-[60px] bg-gradient-to-br ${colors.iconBg} rounded-xl p-2 flex items-center justify-center border-2 border-border`}>
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">{gameName}</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">{gameDescription}</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Leaderboard */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    {gameId ? (
                        <GameRankings gameId={gameId} themeColor={theme} />
                    ) : (
                        <div className="bg-card rounded-2xl p-4 border border-border">
                            <h3 className="text-base font-semibold text-foreground mb-4 m-0">Bảng xếp hạng</h3>
                            <p className="text-sm text-muted-foreground text-center py-4">Cần gameId để tải dữ liệu</p>
                        </div>
                    )}
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        {/* Resume Game Button - shown when in-progress session exists */}
                        {inProgressSession && (
                            <button
                                className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border-2 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-blue-600 hover:to-blue-700 ${
                                    isMenuSelected('resume') ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-[1.02]' : 'border-blue-500'
                                }`}
                                onClick={handleResumeGame}
                            >
                                <Play size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Tiếp tục chơi</span>
                                    <span className="text-xs opacity-80">
                                        Bạn có ván chơi dở - {inProgressSession.moves_count || 0} nước
                                    </span>
                                </div>
                            </button>
                        )}
                        {/* Play with Friends */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-card border-2 rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder} ${
                                    isMenuSelected('friends') ? `ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background scale-[1.02] border-${theme === 'amber' ? 'amber' : 'emerald'}-500` : 'border-border'
                                }`}
                                onClick={handlePlayWithFriend}
                            >
                                <Users size={20} />
                                <span className="flex-1 text-left">Chơi với bạn bè</span>
                            </button>
                            <button
                                className={`w-12 h-12 flex items-center justify-center bg-card border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all ${
                                    isSettingsSelected('friends') ? `ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background border-${theme === 'amber' ? 'amber' : 'emerald'}-500 text-${theme === 'amber' ? 'amber' : 'emerald'}-500` : 'border-border'
                                }`}
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Play with AI */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 ${colors.btnBg}/10 border-2 rounded-xl ${colors.text} text-base font-medium cursor-pointer transition-all hover:${colors.btnBg}/20 ${
                                    isMenuSelected('robot') ? `ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background scale-[1.02] ${colors.border}` : `${colors.border}/30`
                                }`}
                                onClick={handlePlayVsRobot}
                            >
                                <Bot size={20} />
                                <span className="flex-1 text-left">Chơi với máy</span>
                            </button>
                            <button
                                className={`w-12 h-12 flex items-center justify-center bg-card border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all ${
                                    isSettingsSelected('robot') ? `ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background border-${theme === 'amber' ? 'amber' : 'emerald'}-500 text-${theme === 'amber' ? 'amber' : 'emerald'}-500` : 'border-border'
                                }`}
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Create Tournament */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-card border-2 rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder} ${
                                    isMenuSelected('tournament') ? `ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background scale-[1.02] border-${theme === 'amber' ? 'amber' : 'emerald'}-500` : 'border-border'
                                }`}
                                onClick={handleCreateTournament}
                            >
                                <Trophy size={20} />
                                <span className="flex-1 text-left">Tạo giải đấu</span>
                            </button>
                        </div>

                        {/* Play Online */}
                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${colors.primary} border-2 rounded-xl text-white text-base font-medium cursor-pointer transition-all ${colors.primaryHover} ${
                                isMenuSelected('online') ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-[1.02]' : colors.border
                            }`}
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Chơi online</span>
                                <span className="text-xs opacity-80">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>

                        {/* Gamepad Controller */}
                        <div className="mt-4">
                            <GamepadController
                                onLeft={handleGamepadLeft}
                                onRight={handleGamepadRight}
                                onBack={handleGamepadBack}
                                onEnter={handleGamepadEnter}
                                onHint={handleGamepadHint}
                                showHint={true}
                            />
                        </div>

                        {/* Game Session History */}
                        {gameId && <GameSessionHistory gameId={gameId} limit={5} gamePath={playPath} onInProgressChange={handleInProgressChange} />}
                    </div>
                </div>

                {/* Right Side - Reviews */}
                {gameId && (
                    <div className="w-96 flex-shrink-0 max-lg:w-full max-lg:order-3">
                        <GameReviews gameId={gameId} />
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                {isCustomMode && (
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all mr-1"
                                        onClick={() => setIsCustomMode(false)}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <Bot size={20} className={colors.text} />
                                <h2 className="text-lg font-bold text-foreground m-0">
                                    {isCustomMode ? 'Tùy chỉnh cài đặt' : 'Chơi với máy'}
                                </h2>
                            </div>
                            <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={() => { setShowSettingsModal(false); setIsCustomMode(false); }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Game Info */}
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                                <div className={`w-10 h-10 bg-gradient-to-br ${colors.iconBg} rounded-lg p-1.5 flex items-center justify-center`}>
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">{gameName}</p>
                                    <p className="text-xs text-muted-foreground m-0">{gameDescription}</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="px-6 py-5 space-y-4 max-h-[50vh] overflow-y-auto">
                            {!isCustomMode ? (
                                <>
                                    {/* Current Settings Summary - Dynamic from API */}
                                    <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                                        {apiSettings && Object.keys(apiSettings).map(settingKey => {
                                            const currentValue = gameSettings[settingKey];
                                            const options = getSettingOptions(apiSettings, settingKey);
                                            const option = options.find(opt => opt.value === currentValue);
                                            
                                            // Color map for Tailwind
                                            const colorTextMap = {
                                                green: 'text-green-500',
                                                yellow: 'text-yellow-500',
                                                red: 'text-red-500',
                                                blue: 'text-blue-500',
                                            };
                                            const colorClass = option?.color ? colorTextMap[option.color] : 'text-foreground';
                                            
                                            return (
                                                <div key={settingKey} className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {getSettingLabel(apiSettings, settingKey)}
                                                    </span>
                                                    <span className={`font-semibold ${colorClass}`}>
                                                        {option?.icon ? `${option.icon} ` : ''}
                                                        {getOptionLabel(apiSettings, settingKey, currentValue)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {/* Show message if no settings available */}
                                        {!apiSettings && !isLoadingSettings && (
                                            <div className="text-sm text-muted-foreground text-center py-2">
                                                Không có cài đặt khả dụng
                                            </div>
                                        )}
                                        {isLoadingSettings && (
                                            <div className="text-sm text-muted-foreground text-center py-2">
                                                Đang tải cài đặt...
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        {(hasApiSetting(apiSettings, 'timePerTurn') || hasApiSetting(apiSettings, 'timePerPlayer')) && (
                                            <button
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                    selectedQuickActionIndex === 0 
                                                        ? `bg-${theme === 'amber' ? 'amber' : 'emerald'}-500 text-white ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background` 
                                                        : 'bg-secondary text-foreground hover:bg-accent'
                                                }`}
                                                onClick={handleSetUnlimitedTime}
                                            >
                                                Không giới hạn thời gian
                                            </button>
                                        )}
                                        {apiSettings && Object.keys(apiSettings).length > 0 && (
                                            <button
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                    selectedQuickActionIndex === 1 
                                                        ? `bg-${theme === 'amber' ? 'amber' : 'emerald'}-500 text-white ring-2 ring-${theme === 'amber' ? 'amber' : 'emerald'}-500 ring-offset-2 ring-offset-background` 
                                                        : 'bg-secondary text-foreground hover:bg-accent'
                                                }`}
                                                onClick={() => setIsCustomMode(true)}
                                            >
                                                Tùy chỉnh
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Custom Settings Editor - Dynamic from API */}
                                    <div className="space-y-4">
                                        {apiSettings && Object.keys(apiSettings).map((settingKey, index) => {
                                            const options = getSettingOptions(apiSettings, settingKey);
                                            const settingType = apiSettings[settingKey]?.type || 'select';
                                            const isSelectedRow = selectedSettingIndex === index;
                                            
                                            // Skip if no options available
                                            if (options.length === 0) return null;
                                            
                                            // Color map for Tailwind (can't use dynamic classes)
                                            const colorMap = {
                                                green: { selected: 'bg-green-500 text-white', unselected: 'text-green-600' },
                                                yellow: { selected: 'bg-yellow-500 text-white', unselected: 'text-yellow-600' },
                                                red: { selected: 'bg-red-500 text-white', unselected: 'text-red-600' },
                                                blue: { selected: 'bg-blue-500 text-white', unselected: 'text-blue-600' },
                                            };
                                            
                                            return (
                                                <div 
                                                    key={settingKey} 
                                                    className={`flex items-center justify-between p-2 -mx-2 rounded-lg transition-all ${
                                                        isSelectedRow ? `${colors.btnBg}/10 ring-1 ${colors.ring}/50` : ''
                                                    }`}
                                                >
                                                    {/* Setting Label */}
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={`text-sm ${isSelectedRow ? `${colors.text} font-medium` : 'text-muted-foreground'}`}>
                                                            {getSettingLabel(apiSettings, settingKey)}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Options - Render based on type */}
                                                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[220px]">
                                                        {settingType === 'toggle' ? (
                                                            // Toggle switch
                                                            <button
                                                                className={`relative w-12 h-6 rounded-full transition-all ${
                                                                    gameSettings[settingKey] 
                                                                        ? `${colors.btnBg}` 
                                                                        : 'bg-secondary'
                                                                }`}
                                                                onClick={() => setGameSettings(prev => ({ 
                                                                    ...prev, 
                                                                    [settingKey]: !prev[settingKey] 
                                                                }))}
                                                            >
                                                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${
                                                                    gameSettings[settingKey] ? 'right-0.5' : 'left-0.5'
                                                                }`} />
                                                            </button>
                                                        ) : (
                                                            // Select buttons
                                                            options.map(opt => {
                                                                const isSelected = gameSettings[settingKey] === opt.value;
                                                                const optColor = opt.color;
                                                                const colorClasses = optColor && colorMap[optColor];
                                                                
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                            isSelected
                                                                                ? (colorClasses?.selected || `${colors.btnBg} text-white`)
                                                                                : 'bg-secondary text-foreground hover:bg-accent'
                                                                        }`}
                                                                        onClick={() => setGameSettings(prev => ({ 
                                                                            ...prev, 
                                                                            [settingKey]: opt.value 
                                                                        }))}
                                                                    >
                                                                        {opt.icon ? `${opt.icon} ` : ''}{opt.label}
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Quick Reset */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                        onClick={() => {
                                            // Reset to API default values
                                            if (apiSettings) {
                                                const defaultValues = extractSettingValues(apiSettings);
                                                setGameSettings(prev => ({ ...prev, ...defaultValues }));
                                            } else {
                                                setGameSettings({ ...DEFAULT_SETTINGS, boardSize: defaultBoardSize });
                                            }
                                        }}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Gamepad Controller in Modal */}
                        <div className="px-6 py-3 border-t border-border bg-secondary/30">
                            <GamepadController
                                onLeft={handleGamepadLeft}
                                onRight={handleGamepadRight}
                                onBack={handleGamepadBack}
                                onEnter={handleGamepadEnter}
                                onHint={handleGamepadHint}
                                showHint={true}
                                className="!bg-transparent !border-0 !p-0"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border">
                            <button
                                className={`w-full py-3 ${colors.btnBg} rounded-xl text-white text-sm font-semibold ${colors.btnHover} transition-all shadow-md`}
                                onClick={handleSaveSettings}
                            >
                                {isCustomMode ? 'Áp dụng & Bắt đầu' : 'Lưu cài đặt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaroLobby;
