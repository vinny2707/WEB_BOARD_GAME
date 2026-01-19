import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings, X, ChevronLeft, Play } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import { getSession } from '../../../../api/sessionsApi';
import GameReviews from '../GameReviews';
import GameRankings from '../GameRankings';
import GameSessionHistory from '../GameSessionHistory';
import GamepadController from '../GamepadController';
import { toast } from 'sonner';
import {
    fetchGameSettings,
    getSettingOptions,
    getSettingLabel,
    getOptionLabel,
    extractSettingValues
} from '../../utils/settingsConfig';

// Default game settings
const DEFAULT_SETTINGS = {
    boardSize: 20,
    difficulty: 'medium',
    wallMode: 'solid', // 'solid' or 'wrap'
};

const DIFFICULTY_SETTINGS = {
    easy: { speed: 200, label: 'Dễ' },
    medium: { speed: 150, label: 'Trung Bình' },
    hard: { speed: 80, label: 'Khó' }
};



const SnakeLobby = () => {
    const navigate = useNavigate();
    const playClick = useClickSound();
    const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // In-progress session state (controlled by GameSessionHistory callback)
    const [inProgressSession, setInProgressSession] = useState(null);

    // Gamepad navigation state
    const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
    const [selectedSettingIndex, setSelectedSettingIndex] = useState(0);
    const [selectedQuickActionIndex, setSelectedQuickActionIndex] = useState(0);

    // Menu items for gamepad navigation
    const getMenuItems = useCallback(() => {
        const items = [];
        if (inProgressSession) {
            items.push({ id: 'resume', label: 'Tiếp tục chơi', action: 'resume' });
        }
        items.push(
            { id: 'play', label: 'Chơi ngay', action: 'play' },
            { id: 'play-settings', label: 'Cài đặt game', action: 'play-settings' },
            { id: 'friends', label: 'Chơi với bạn bè', action: 'friends' },
            { id: 'tournament', label: 'Tạo giải đấu', action: 'tournament' },
            { id: 'online', label: 'Chơi online', action: 'online' }
        );
        return items;
    }, [inProgressSession]);

    // Fetch game settings from API (Snake has gameId = 4)
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoadingSettings(true);
            const { settings } = await fetchGameSettings(4);
            if (settings) {
                setApiSettings(settings);
                const values = extractSettingValues(settings);
                setGameSettings(prev => ({
                    ...prev,
                    ...values,
                }));
            }
            setIsLoadingSettings(false);
        };
        loadSettings();
    }, []);

    // Countdown timer for daily leaderboard
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                let { hours, minutes, seconds } = prev;
                seconds--;
                if (seconds < 0) { seconds = 59; minutes--; }
                if (minutes < 0) { minutes = 59; hours--; }
                if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const openSettings = (e) => {
        e?.stopPropagation();
        playClick();
        setIsCustomMode(false);
        setShowSettingsModal(true);
    };

    const handleSaveSettings = () => {
        playClick();
        setShowSettingsModal(false);
        setIsCustomMode(false);
    };

    const handlePlayNow = () => {
        playClick();
        navigate('/games/snake/play', { state: { settings: gameSettings } });
    };

    // Handler for when history updates in_progress status
    const handleInProgressChange = (hasInProgress, firstInProgressSession) => {
        if (hasInProgress && firstInProgressSession) {
            setInProgressSession(firstInProgressSession);
        } else {
            setInProgressSession(null);
        }
    };

    const handleResumeGame = async () => {
        if (!inProgressSession?.id) return;
        playClick();

        try {
            // Fetch full session data with game_state
            const response = await getSession(inProgressSession.id);
            const fullSession = response?.data || inProgressSession;

            // Navigate to game with full session data for restoration
            navigate('/games/snake/play', {
                state: {
                    settings: fullSession.settings || gameSettings,
                    resumeSession: fullSession,
                }
            });
        } catch (error) {
            console.error('Failed to fetch session:', error);
            // Fallback: try with existing data
            navigate('/games/snake/play', {
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
                    playClick();
                    navigate('/games/snake/play', { state: { settings: gameSettings } });
                    break;
                case 'play-settings':
                    openSettings();
                    break;
                case 'friends':
                    handlePlayWithFriend();
                    break;
                case 'tournament':
                    handleCreateTournament();
                    break;
                case 'online':
                    handlePlayOnline();
                    break;
            }
        }
    }, [getMenuItems, gameSettings, navigate, playClick]);

    // Gamepad navigation handlers
    const handleGamepadLeft = useCallback(() => {
        playClick();
        if (showSettingsModal && isCustomMode) {
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
            setSelectedQuickActionIndex(prev => Math.max(0, prev - 1));
        } else {
            const menuItems = getMenuItems();
            const newIndex = selectedMenuIndex > 0 ? selectedMenuIndex - 1 : menuItems.length - 1;
            setSelectedMenuIndex(newIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, gameSettings, selectedMenuIndex, getMenuItems, playClick]);

    const handleGamepadRight = useCallback(() => {
        playClick();
        if (showSettingsModal && isCustomMode) {
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
            setSelectedQuickActionIndex(prev => Math.min(1, prev + 1));
        } else {
            const menuItems = getMenuItems();
            const newIndex = selectedMenuIndex < menuItems.length - 1 ? selectedMenuIndex + 1 : 0;
            setSelectedMenuIndex(newIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, gameSettings, selectedMenuIndex, getMenuItems, playClick]);

    const handleGamepadEnter = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
                if (selectedSettingIndex < settingKeys.length - 1) {
                    setSelectedSettingIndex(prev => prev + 1);
                } else {
                    handleSaveSettings();
                }
            } else {
                if (selectedQuickActionIndex === 0) {
                    setIsCustomMode(true);
                    setSelectedSettingIndex(0);
                } else {
                    handleSaveSettings();
                }
            }
        } else {
            executeMenuAction(selectedMenuIndex);
        }
    }, [showSettingsModal, isCustomMode, apiSettings, selectedSettingIndex, selectedMenuIndex, selectedQuickActionIndex, executeMenuAction, playClick]);

    const handleGamepadBack = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                setIsCustomMode(false);
            } else {
                setShowSettingsModal(false);
            }
        } else {
            navigate('/games');
        }
    }, [showSettingsModal, isCustomMode, navigate, playClick]);

    const handleGamepadHint = useCallback(() => {
        playClick();
        if (showSettingsModal) {
            if (isCustomMode) {
                const settingKeys = apiSettings ? Object.keys(apiSettings) : [];
                const currentSetting = settingKeys[selectedSettingIndex];
                const label = currentSetting ? getSettingLabel(apiSettings, currentSetting) : 'Cài đặt';
                toast.info(`${label}: ← → để đổi giá trị, Enter xuống dòng tiếp, Back quay lại`);
            } else {
                const actions = ['Tùy chỉnh cài đặt', 'Lưu cài đặt'];
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

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-orange-400" size={16} />;
        if (rank === 2) return <Medal className="text-gray-400" size={16} />;
        if (rank === 3) return <Medal className="text-amber-700" size={16} />;
        return <span className="text-sm text-muted-foreground">{rank}.</span>;
    };

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                    onClick={() => navigate('/games')}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-green-300 to-green-500 rounded-xl p-2 flex items-center justify-center border-2 border-border text-3xl">
                        🐍
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Rắn Săn Mồi</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Ăn táo và trở nên dài hơn!</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Leaderboard */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    <GameRankings gameId={4} themeColor="green" />
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        {/* High Score Display */}
                        {highScore > 0 && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-xl">
                                <Trophy className="text-yellow-500" size={24} />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Điểm cao nhất của bạn</div>
                                    <div className="text-xl font-bold text-yellow-500">{highScore}</div>
                                </div>
                            </div>
                        )}

                        {/* Resume Game Button */}
                        {inProgressSession && (
                            <button
                                className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-blue-600 hover:to-blue-700 animate-pulse ${isMenuSelected('resume') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                                onClick={handleResumeGame}
                            >
                                <Play size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Tiếp tục chơi</span>
                                    <span className="text-xs opacity-80">Bạn có ván chơi dở - Điểm: {inProgressSession.score || 0}</span>
                                </div>
                            </button>
                        )}

                        {/* Play Now Button with Settings */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-500 to-green-600 border border-green-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-green-600 hover:to-green-700 ${isMenuSelected('play') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                                onClick={handlePlayNow}
                            >
                                <Gamepad2 size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Chơi ngay</span>
                                    <span className="text-xs opacity-80">Chế độ một người chơi</span>
                                </div>
                            </button>
                            <button
                                className={`w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all ${isMenuSelected('play-settings') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-green-500 ${isMenuSelected('friends') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                            onClick={handlePlayWithFriend}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-green-500 ${isMenuSelected('tournament') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                            onClick={handleCreateTournament}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-green-500 ${isMenuSelected('online') ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' : ''}`}
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Chơi online</span>
                                <span className="text-xs text-muted-foreground">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>

                        {/* Game Session History */}
                        <GameSessionHistory gameId={4} limit={5} gamePath="/games/snake/play" onInProgressChange={handleInProgressChange} />
                    </div>

                    {/* How to Play */}
                    <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-3">Cách chơi</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>🎮 Dùng phím <span className="text-foreground font-medium">↑ ↓ ← →</span> hoặc <span className="text-foreground font-medium">WASD</span> để di chuyển</li>
                            <li>🍎 Ăn táo đỏ để tăng điểm và dài thêm</li>
                            <li>⚠️ Tránh đâm vào tường và thân rắn</li>
                            <li>⏸️ Nhấn <span className="text-foreground font-medium">Space</span> để tạm dừng</li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Reviews */}
                <div className="w-96 flex-shrink-0 max-lg:w-full max-lg:order-3">
                    <GameReviews gameId={4} />
                </div>
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
                                <Gamepad2 size={20} className="text-green-500" />
                                <h2 className="text-lg font-bold text-foreground m-0">
                                    {isCustomMode ? 'Tùy chỉnh cài đặt' : 'Cài đặt game'}
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
                                <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-green-500 rounded-lg p-1.5 flex items-center justify-center text-xl">
                                    🐍
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Rắn Săn Mồi</p>
                                    <p className="text-xs text-muted-foreground m-0">Ăn táo và trở nên dài hơn!</p>
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
                                    {apiSettings && Object.keys(apiSettings).length > 0 && (
                                        <button
                                            className={`w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all ${selectedQuickActionIndex === 0 ? 'ring-2 ring-yellow-400' : ''}`}
                                            onClick={() => setIsCustomMode(true)}
                                        >
                                            Tùy chỉnh cài đặt
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {/* Custom Settings Editor - Dynamic from API */}
                                    <div className="space-y-4">
                                        {apiSettings && Object.keys(apiSettings).map((settingKey, idx) => {
                                            const options = getSettingOptions(apiSettings, settingKey);
                                            const settingType = apiSettings[settingKey]?.type || 'select';
                                            
                                            if (options.length === 0) return null;
                                            
                                            const isCurrentSetting = selectedSettingIndex === idx;
                                            const colorMap = {
                                                green: { selected: 'bg-green-500 text-white' },
                                                yellow: { selected: 'bg-yellow-500 text-white' },
                                                red: { selected: 'bg-red-500 text-white' },
                                                blue: { selected: 'bg-blue-500 text-white' },
                                            };
                                            
                                            return (
                                                <div key={settingKey} className={`flex items-center justify-between p-2 rounded-lg transition-all ${isCurrentSetting ? 'bg-green-500/10 ring-2 ring-yellow-400' : ''}`}>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className="text-sm text-muted-foreground">
                                                            {getSettingLabel(apiSettings, settingKey)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[220px]">
                                                        {settingType === 'toggle' ? (
                                                            <button
                                                                className={`relative w-12 h-6 rounded-full transition-all ${
                                                                    gameSettings[settingKey] 
                                                                        ? 'bg-green-500' 
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
                                                            options.map(opt => {
                                                                const isSelected = gameSettings[settingKey] === opt.value;
                                                                const optColor = opt.color;
                                                                const colorClasses = optColor && colorMap[optColor];
                                                                
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                            isSelected
                                                                                ? (colorClasses?.selected || 'bg-green-500 text-white')
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
                                            if (apiSettings) {
                                                const defaultValues = extractSettingValues(apiSettings);
                                                setGameSettings(prev => ({ ...prev, ...defaultValues }));
                                            } else {
                                                setGameSettings({ ...DEFAULT_SETTINGS });
                                            }
                                        }}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border">
                            <button
                                className="w-full py-3 bg-green-500 rounded-xl text-white text-sm font-semibold hover:bg-green-600 transition-all shadow-md"
                                onClick={handleSaveSettings}
                            >
                                {isCustomMode ? 'Áp dụng' : 'Lưu cài đặt'}
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

export default SnakeLobby;
