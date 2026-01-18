import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings, X, ChevronLeft, Play } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import { getSession } from '../../../../api/sessionsApi';
import GameReviews from '../GameReviews';
import GameRankings from '../GameRankings';
import GameSessionHistory from '../GameSessionHistory';
import { getGames } from '../../../../api/gamesApi';
import {
    fetchGameSettings,
    hasApiSetting,
    getSettingOptions,
    getSettingLabel,
    extractSettingValues
} from '../../utils/settingsConfig';

// Default game settings
const DEFAULT_SETTINGS = {
    boardSize: 8,
    moves: 30,
    targetScore: 5000,
    difficulty: 'medium', // easy: 5 types, medium: 6 types, hard: 7 types
};

const DIFFICULTY_SETTINGS = {
    easy: { candyTypes: 5, label: 'Dễ' },
    medium: { candyTypes: 6, label: 'Trung Bình' },
    hard: { candyTypes: 7, label: 'Khó' }
};



const Match3Lobby = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const playClick = useClickSound();
    const [highScore] = useState(() => {
        const saved = localStorage.getItem('match3HighScore');
        return saved ? parseInt(saved, 10) : 0;
    });

    // Get game data from navigation state (passed from Games page)
    const locationStateGameId = location.state?.game?.id;
    const [gameId, setGameId] = useState(locationStateGameId);

    // Fetch game ID if missing (e.g. direct navigation or back button)
    useEffect(() => {
        if (!gameId) {
            getGames({ search: 'Ghép Hàng 3', limit: 1 }).then(res => {
                if (res.data?.games?.length > 0) {
                    setGameId(res.data.games[0].id);
                }
            }).catch(err => console.error("Failed to fetch game ID for Lobby", err));
        }
    }, [gameId]);

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // In-progress session state (controlled by GameSessionHistory callback)
    const [inProgressSession, setInProgressSession] = useState(null);

    // Fetch game settings from API using dynamic gameId
    useEffect(() => {
        const loadSettings = async () => {
            if (!gameId) return;
            setIsLoadingSettings(true);
            const { settings } = await fetchGameSettings(gameId);
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
    }, [gameId]);



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
        navigate('/games/match3/play', { state: { settings: gameSettings, gameId } });
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
            navigate('/games/match3/play', {
                state: {
                    settings: fullSession.settings || gameSettings,
                    resumeSession: fullSession,
                    gameId,
                }
            });
        } catch (error) {
            console.error('Failed to fetch session:', error);
            // Fallback: try with existing data
            navigate('/games/match3/play', {
                state: {
                    settings: inProgressSession.settings || gameSettings,
                    resumeSession: inProgressSession,
                    gameId,
                }
            });
        }
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
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-pink-300 to-purple-500 rounded-xl p-2 flex items-center justify-center border-2 border-border text-3xl">
                        🍬
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Ghép Hàng 3</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Ghép 3 viên kẹo giống nhau!</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Leaderboard */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    <GameRankings gameId={gameId} themeColor="orange" />
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        {/* High Score Display */}
                        {highScore > 0 && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-yellow-500/15 to-transparent border border-yellow-500/30 rounded-xl">
                                <Trophy className="text-yellow-500" size={24} />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Điểm cao nhất của bạn</div>
                                    <div className="text-xl font-bold text-yellow-500">{highScore.toLocaleString()}</div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3].map(i => (
                                        <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume Game Button */}
                        {inProgressSession && (
                            <button
                                className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-blue-600 hover:to-blue-700 animate-pulse"
                                onClick={handleResumeGame}
                            >
                                <Play size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Tiếp tục chơi</span>
                                    <span className="text-xs opacity-80">Điểm: {inProgressSession.score || 0} - Còn {inProgressSession.game_state?.moves || '?'} lượt</span>
                                </div>
                            </button>
                        )}

                        {/* Play Now Button with Settings */}
                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-pink-600 hover:to-purple-700"
                                onClick={handlePlayNow}
                            >
                                <Gamepad2 size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Chơi ngay</span>
                                    <span className="text-xs opacity-80">{gameSettings.moves} lượt - Mục tiêu {gameSettings.targetScore.toLocaleString()} điểm</span>
                                </div>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handlePlayWithFriend}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handleCreateTournament}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-pink-500"
                            onClick={handlePlayOnline}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Chơi online</span>
                                <span className="text-xs text-muted-foreground">với người chơi ngẫu nhiên</span>
                            </div>
                        </button>
                    </div>

                    {/* How to Play */}
                    <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-3">Cách chơi</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>🍬 Click vào một viên kẹo để chọn</li>
                            <li>↔️ Click vào viên kẹo bên cạnh để hoán đổi</li>
                            <li>✨ Ghép 3 viên kẹo giống nhau để ghi điểm</li>
                            <li>🔥 Tạo combo để nhân đôi điểm!</li>
                            <li>🎯 Đạt mục tiêu trước khi hết lượt</li>
                        </ul>
                    </div>

                    {/* Game Session History */}
                    <GameSessionHistory gameId={gameId} limit={5} gamePath="/games/match3/play" onInProgressChange={handleInProgressChange} />
                </div>

                {/* Right Side - Reviews */}
                <div className="w-96 flex-shrink-0 max-lg:w-full max-lg:order-3">
                    <GameReviews gameId={gameId} />
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
                                <Gamepad2 size={20} className="text-pink-500" />
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
                                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-500 rounded-lg p-1.5 flex items-center justify-center text-xl">
                                    🍬
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Ghép Hàng 3</p>
                                    <p className="text-xs text-muted-foreground m-0">Ghép 3 viên kẹo giống nhau!</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="px-6 py-5 space-y-4">
                            {!isCustomMode ? (
                                <>
                                    {/* Current Settings Summary */}
                                    <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                                        {hasApiSetting(apiSettings, 'boardSize') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Kích thước bàn:</span>
                                                <span className="font-semibold text-foreground">{gameSettings.boardSize}x{gameSettings.boardSize}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'moves') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Số lượt chơi:</span>
                                                <span className="font-semibold text-foreground">{gameSettings.moves} lượt</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'targetScore') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Mục tiêu điểm:</span>
                                                <span className="font-semibold text-foreground">{gameSettings.targetScore?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'difficulty') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Độ khó:</span>
                                                <span className={`font-semibold ${gameSettings.difficulty === 'easy' ? 'text-green-500' :
                                                    gameSettings.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {DIFFICULTY_SETTINGS[gameSettings.difficulty]?.label}
                                                </span>
                                            </div>
                                        )}
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
                                            className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
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
                                        {apiSettings && Object.keys(apiSettings).map(settingKey => {
                                            const options = getSettingOptions(apiSettings, settingKey);
                                            const label = getSettingLabel(apiSettings, settingKey);

                                            if (options.length === 0) return null;

                                            // Color mapping for Tailwind (static classes)
                                            const colorMap = {
                                                green: { selected: 'bg-green-500 text-white', unselected: 'text-green-500' },
                                                yellow: { selected: 'bg-yellow-500 text-white', unselected: 'text-yellow-500' },
                                                red: { selected: 'bg-red-500 text-white', unselected: 'text-red-500' },
                                                blue: { selected: 'bg-blue-500 text-white', unselected: 'text-blue-500' },
                                                purple: { selected: 'bg-purple-500 text-white', unselected: 'text-purple-500' },
                                                orange: { selected: 'bg-orange-500 text-white', unselected: 'text-orange-500' },
                                            };

                                            return (
                                                <div key={settingKey} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">{label}:</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-wrap justify-end max-w-[220px]">
                                                        {options.map(option => {
                                                            const isSelected = gameSettings[settingKey] === option.value;
                                                            const colorStyles = option.color && colorMap[option.color];

                                                            let buttonClass = 'bg-secondary text-foreground hover:bg-accent';
                                                            if (isSelected) {
                                                                buttonClass = colorStyles?.selected || 'bg-pink-500 text-white';
                                                            }

                                                            return (
                                                                <button
                                                                    key={option.value}
                                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${buttonClass}`}
                                                                    onClick={() => setGameSettings(prev => ({ ...prev, [settingKey]: option.value }))}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Quick Reset */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                        onClick={() => {
                                            // Reset to default values from API
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
                                className="w-full py-3 bg-pink-500 rounded-xl text-white text-sm font-semibold hover:bg-pink-600 transition-all shadow-md"
                                onClick={handleSaveSettings}
                            >
                                {isCustomMode ? 'Áp dụng' : 'Lưu cài đặt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Match3Lobby;
