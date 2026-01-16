import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bot, Trophy, Globe, Settings, ArrowLeft, Crown, Medal, X, Clock, User, Shuffle, Minus, Plus, ChevronLeft } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import GameReviews from '../GameReviews';
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
    showBoardSizeSelector = false, // true for Caro4, false for Gomoku
    gameId = null, // Game ID for reviews
}) => {
    const navigate = useNavigate();
    const playClick = useClickSound();
    const [countdown, setCountdown] = useState({ hours: 2, minutes: 15, seconds: 45 });

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS, boardSize: defaultBoardSize });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

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

    const formatTime = (seconds) => {
        if (seconds === 0) return 'Không giới hạn';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0 && secs === 0) return `${mins} phút`;
        if (mins > 0) return `${mins}p ${secs}s`;
        return `${secs} giây`;
    };

    const openSettings = (e) => {
        e.stopPropagation();
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

    const adjustTimePerTurn = (delta) => {
        playClick();
        setGameSettings(prev => ({
            ...prev,
            timePerTurn: Math.max(0, prev.timePerTurn + delta)
        }));
    };

    const adjustTimePerPlayer = (delta) => {
        playClick();
        setGameSettings(prev => ({
            ...prev,
            timePerPlayer: Math.max(0, prev.timePerPlayer + delta)
        }));
    };

    const handlePlayVsRobot = () => {
        playClick();
        navigate(playPath, { state: { settings: gameSettings } });
    };

    const handlePlayWithFriend = () => {
        playClick();
        alert('Tính năng chơi với bạn bè đang được phát triển!');
    };

    const handlePlayOnline = () => {
        playClick();
        alert('Tính năng chơi online đang được phát triển!');
    };

    const handleCreateTournament = () => {
        playClick();
        alert('Tính năng tạo giải đấu đang được phát triển!');
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
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-4 m-0">Bảng xếp hạng</h3>
                        <div className="flex flex-col gap-2">
                            {leaderboard.map((player) => (
                                <div
                                    key={player.rank}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent
                                        ${player.rank <= 3 ? 'bg-yellow-500/15' : ''}`}
                                >
                                    <div className="w-7 text-center">
                                        {getRankIcon(player.rank)}
                                    </div>
                                    <div className="text-xl">
                                        {player.flag}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-foreground">{player.name}</span>
                                    <span className="text-sm font-semibold text-muted-foreground">{player.score.toLocaleString()}</span>
                                </div>
                            ))}

                            {/* Current User */}
                            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r ${colors.userBg} to-transparent border ${colors.userBorder} mt-2`}>
                                <div className="w-7 text-center">
                                    <span className={`text-sm font-semibold ${colors.text}`}>{currentUser.rank}.</span>
                                </div>
                                <div className="text-xl">🎮</div>
                                <span className="flex-1 text-sm font-medium text-foreground">{currentUser.name}</span>
                                <span className="text-sm font-semibold text-muted-foreground">{currentUser.score.toLocaleString()}</span>
                            </div>
                        </div>

                        <button className={`w-full py-3 mt-2 bg-transparent border-none ${colors.text} text-sm font-medium cursor-pointer ${colors.textHover} transition-colors`}>
                            Xem tất cả
                        </button>

                        <div className="text-center pt-3 border-t border-border mt-2">
                            <span className="block text-xs text-muted-foreground mb-2">Bảng xếp hạng ngày, kết thúc sau</span>
                            <div className="flex items-center justify-center gap-1 font-mono text-xl font-semibold text-foreground">
                                <span>{String(countdown.hours).padStart(2, '0')}</span>
                                <span className="text-muted-foreground">:</span>
                                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                                <span className="text-muted-foreground">:</span>
                                <span>{String(countdown.seconds).padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        {/* Play with Friends */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder}`}
                                onClick={handlePlayWithFriend}
                            >
                                <Users size={20} />
                                <span className="flex-1 text-left">Chơi với bạn bè</span>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Play with AI */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 ${colors.btnBg}/10 border ${colors.border}/30 rounded-xl ${colors.text} text-base font-medium cursor-pointer transition-all hover:${colors.btnBg}/20`}
                                onClick={handlePlayVsRobot}
                            >
                                <Bot size={20} />
                                <span className="flex-1 text-left">Chơi với máy</span>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Create Tournament */}
                        <div className="flex items-center gap-2">
                            <button
                                className={`flex-1 flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent ${colors.hoverBorder}`}
                                onClick={handleCreateTournament}
                            >
                                <Trophy size={20} />
                                <span className="flex-1 text-left">Tạo giải đấu</span>
                            </button>
                        </div>

                        {/* Play Online */}
                        <button
                            className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${colors.primary} ${colors.border} rounded-xl text-white text-base font-medium cursor-pointer transition-all ${colors.primaryHover}`}
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Chơi online</span>
                                <span className="text-xs opacity-80">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>
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
                        <div className="px-6 py-5 space-y-4">
                            {!isCustomMode ? (
                                <>
                                    {/* Current Settings Summary */}
                                    <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                                        {/* Board Size - Only for Caro4 and if API has this setting */}
                                        {showBoardSizeSelector && hasApiSetting(apiSettings, 'boardSize') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Board size:</span>
                                                <span className="font-semibold text-foreground">{gameSettings.boardSize}x{gameSettings.boardSize}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'timePerTurn') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Time per turn:</span>
                                                <span className="font-semibold text-foreground">{formatTime(gameSettings.timePerTurn)}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'timePerPlayer') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Minutes per player:</span>
                                                <span className="font-semibold text-foreground">{formatTime(gameSettings.timePerPlayer)}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'firstPlayer') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{getSettingLabel(apiSettings, 'firstPlayer')}</span>
                                                <span className="font-semibold text-foreground">
                                                    {getOptionLabel(apiSettings, 'firstPlayer', gameSettings.firstPlayer)}
                                                </span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'difficulty') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">{getSettingLabel(apiSettings, 'difficulty')}</span>
                                                <span className={`font-semibold ${getOptionColor(apiSettings, 'difficulty', gameSettings.difficulty) || 'text-foreground'}`}>
                                                    {getOptionLabel(apiSettings, 'difficulty', gameSettings.difficulty)}
                                                </span>
                                            </div>
                                        )}
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
                                                className="flex-1 py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
                                                onClick={handleSetUnlimitedTime}
                                            >
                                                Set unlimited time
                                            </button>
                                        )}
                                        {apiSettings && Object.keys(apiSettings).length > 0 && (
                                            <button
                                                className="flex-1 py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
                                                onClick={() => setIsCustomMode(true)}
                                            >
                                                Custom options
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Custom Settings Editor */}
                                    <div className="space-y-4">
                                        {/* Board Size - Only show for Caro4 and if API has this setting */}
                                        {showBoardSizeSelector && hasApiSetting(apiSettings, 'boardSize') && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">{getSettingLabel(apiSettings, 'boardSize')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getSettingOptions(apiSettings, 'boardSize').map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.boardSize === opt.value
                                                                ? `${colors.btnBg} text-white`
                                                                : 'bg-secondary text-foreground hover:bg-accent'
                                                                }`}
                                                            onClick={() => setGameSettings(prev => ({ ...prev, boardSize: opt.value }))}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Time per Turn */}
                                        {hasApiSetting(apiSettings, 'timePerTurn') && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Time per turn:</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                        onClick={() => adjustTimePerTurn(-10)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-sm font-semibold text-foreground w-24 text-center">
                                                        {formatTime(gameSettings.timePerTurn)}
                                                    </span>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                        onClick={() => adjustTimePerTurn(10)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Minutes per Player */}
                                        {hasApiSetting(apiSettings, 'timePerPlayer') && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Minutes per player:</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                        onClick={() => adjustTimePerPlayer(-60)}
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="text-sm font-semibold text-foreground w-24 text-center">
                                                        {formatTime(gameSettings.timePerPlayer)}
                                                    </span>
                                                    <button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-accent transition-all"
                                                        onClick={() => adjustTimePerPlayer(60)}
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Who Plays First */}
                                        {hasApiSetting(apiSettings, 'firstPlayer') && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Shuffle size={16} className="text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{getSettingLabel(apiSettings, 'firstPlayer')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {getSettingOptions(apiSettings, 'firstPlayer').map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.firstPlayer === opt.value
                                                                ? `${colors.btnBg} text-white`
                                                                : 'bg-secondary text-foreground hover:bg-accent'
                                                                }`}
                                                            onClick={() => setGameSettings(prev => ({ ...prev, firstPlayer: opt.value }))}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Difficulty */}
                                        {hasApiSetting(apiSettings, 'difficulty') && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Trophy size={16} className="text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{getSettingLabel(apiSettings, 'difficulty')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {getSettingOptions(apiSettings, 'difficulty').map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.difficulty === opt.value
                                                                ? `${opt.color ? `bg-${opt.color}-500` : colors.btnBg} text-white`
                                                                : 'bg-secondary text-foreground hover:bg-accent'
                                                                }`}
                                                            onClick={() => setGameSettings(prev => ({ ...prev, difficulty: opt.value }))}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Reset */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                        onClick={() => setGameSettings({ ...DEFAULT_SETTINGS, boardSize: defaultBoardSize })}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
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
