import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Settings, Brain, X, ChevronLeft, Play } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import GameReviews from '../GameReviews';
import GameRankings from '../GameRankings';
import GameSessionHistory from '../GameSessionHistory';
import { getSession } from '../../../../api/sessionsApi';
import {
    fetchGameSettings,
    hasApiSetting,
    getSettingOptions,
    getSettingLabel,
    getOptionLabel,
    getOptionColor,
    extractSettingValues
} from '../../utils/settingsConfig';

// Default game settings
const DEFAULT_SETTINGS = {
    gridSize: 4,
    theme: 'fruits', // 'fruits', 'animals', 'symbols'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
};

const THEME_OPTIONS = {
    fruits: { label: 'Trái cây', icon: '🍎' },
    food: { label: 'Thức ăn', icon: '🍔' },
    flags: { label: 'Cờ các nước', icon: '🇻🇳' },
};

const DIFFICULTY_OPTIONS = {
    easy: { label: 'Dễ', previewTime: 3, desc: 'Xem trước 3s' },
    medium: { label: 'Trung Bình', previewTime: 1, desc: 'Xem trước 1s' },
    hard: { label: 'Khó', previewTime: 0, desc: 'Không xem trước' },
};



const MemoryLobby = () => {
    const navigate = useNavigate();
    const playClick = useClickSound();
    const [bestTime, setBestTime] = useState(null);
    const [bestMoves, setBestMoves] = useState(null);

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [inProgressSession, setInProgressSession] = useState(null);

    const gamePath = '/games/memory';

    // Fetch game settings from API (Memory has gameId = 5)
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoadingSettings(true);
            const { settings } = await fetchGameSettings(5);
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

    useEffect(() => {
        const savedTime = localStorage.getItem('memoryBestTime_4');
        const savedMoves = localStorage.getItem('memoryBestMoves_4');
        if (savedTime) setBestTime(parseInt(savedTime, 10));
        if (savedMoves) setBestMoves(parseInt(savedMoves, 10));
    }, []);



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
        navigate('/games/memory/play', { state: { settings: gameSettings } });
    };

    const handleInProgressChange = (hasInProgress, session) => {
        setInProgressSession(hasInProgress ? session : null);
    };

    const handleResumeGame = async () => {
        if (!inProgressSession?.id) return;
        playClick();

        try {
            const response = await getSession(inProgressSession.id);
            const fullSession = response?.data || inProgressSession;

            navigate('/games/memory/play', {
                state: {
                    settings: fullSession.settings || gameSettings,
                    resumeSession: fullSession,
                }
            });
        } catch (error) {
            console.error('Failed to fetch session:', error);
            navigate('/games/memory/play', {
                state: {
                    settings: inProgressSession.settings || gameSettings,
                    resumeSession: inProgressSession,
                }
            });
        }
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
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl p-2 flex items-center justify-center border-2 border-border">
                        <Brain size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Cờ Trí Nhớ</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Lật và ghép các cặp thẻ giống nhau!</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Leaderboard */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    <GameRankings gameId={5} themeColor="indigo" />
                </div>

                {/* Center - Play Modes */}
                <div className="flex-1 max-w-[400px] max-lg:max-w-full max-lg:order-1">
                    <div className="flex flex-col gap-3">
                        {/* Best Score Display */}
                        {bestTime !== null && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500/15 to-transparent border border-indigo-500/30 rounded-xl">
                                <Trophy className="text-indigo-500" size={24} />
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">Kỷ lục của bạn (4x4)</div>
                                    <div className="text-xl font-bold text-indigo-500">{formatTime(bestTime)} | {bestMoves} lượt</div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3].map(i => (
                                        <Star key={i} size={16} className="text-indigo-500 fill-indigo-500" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Play Now Button with Settings */}
                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-indigo-600 hover:to-purple-700"
                                onClick={handlePlayNow}
                            >
                                <Gamepad2 size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Chơi ngay</span>
                                    <span className="text-xs opacity-80">
                                        {gameSettings.gridSize}x{gameSettings.gridSize} | {THEME_OPTIONS[gameSettings.theme]?.icon} | {DIFFICULTY_OPTIONS[gameSettings.difficulty]?.label}
                                    </span>
                                </div>
                            </button>
                            <button
                                className="w-12 h-12 flex items-center justify-center bg-card border border-border rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                onClick={openSettings}
                            >
                                <Settings size={18} />
                            </button>
                        </div>

                        {/* Resume Button */}
                        {inProgressSession && (
                            <button
                                className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-500 to-emerald-600 border border-green-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-green-600 hover:to-emerald-700"
                                onClick={handleResumeGame}
                            >
                                <Play size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Tiếp tục chơi</span>
                                    <span className="text-xs opacity-80">
                                        {inProgressSession?.game_state?.matchedPairs || 0} cặp | {inProgressSession?.moves_count || 0} lượt
                                    </span>
                                </div>
                            </button>
                        )}

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng chơi với bạn bè đang được phát triển!')}
                        >
                            <Users size={20} />
                            <span className="flex-1 text-left">Chơi với bạn bè</span>
                            <Settings size={16} className="text-muted-foreground" />
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng tạo giải đấu đang được phát triển!')}
                        >
                            <Trophy size={20} />
                            <span className="flex-1 text-left">Tạo giải đấu</span>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-indigo-500"
                            onClick={() => alert('Tính năng chơi online đang được phát triển!')}
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
                            <li>🃏 Click vào một thẻ để lật mở</li>
                            <li>🔍 Ghi nhớ vị trí các hình ảnh</li>
                            <li>🎯 Lật 2 thẻ giống nhau để ghép cặp</li>
                            <li>⏱️ Hoàn thành nhanh nhất có thể</li>
                            <li>🏆 Ít lượt lật = điểm cao hơn!</li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Reviews & History */}
                <div className="w-96 flex-shrink-0 max-lg:w-full max-lg:order-3 flex flex-col gap-4">
                    <GameSessionHistory gameId={5} gamePath={gamePath} onInProgressChange={handleInProgressChange} />
                    <GameReviews gameId={5} />
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
                                <Brain size={20} className="text-indigo-500" />
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
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg p-1.5 flex items-center justify-center">
                                    <Brain size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Cờ Trí Nhớ</p>
                                    <p className="text-xs text-muted-foreground m-0">Lật và ghép các cặp thẻ!</p>
                                </div>
                            </div>
                        </div>

                        {/* Settings Content */}
                        <div className="px-6 py-5 space-y-4">
                            {!isCustomMode ? (
                                <>
                                    {/* Current Settings Summary */}
                                    <div className="p-4 bg-secondary/50 rounded-xl space-y-2">
                                        {hasApiSetting(apiSettings, 'gridSize') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Kích thước:</span>
                                                <span className="font-semibold text-foreground">{gameSettings.gridSize}x{gameSettings.gridSize}</span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'theme') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Chủ đề:</span>
                                                <span className="font-semibold text-foreground">
                                                    {THEME_OPTIONS[gameSettings.theme]?.icon} {THEME_OPTIONS[gameSettings.theme]?.label}
                                                </span>
                                            </div>
                                        )}
                                        {hasApiSetting(apiSettings, 'difficulty') && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Độ khó:</span>
                                                <span className={`font-semibold ${gameSettings.difficulty === 'easy' ? 'text-green-500' :
                                                    gameSettings.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {DIFFICULTY_OPTIONS[gameSettings.difficulty]?.label}
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
                                    {/* Custom Settings Editor */}
                                    <div className="space-y-4">
                                        {/* Grid Size */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Kích thước:</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {[4, 6].map(size => (
                                                    <button
                                                        key={size}
                                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.gridSize === size
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, gridSize: size }))}
                                                    >
                                                        {size}x{size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Theme */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">Chủ đề:</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {Object.entries(THEME_OPTIONS).map(([key, { label, icon }]) => (
                                                    <button
                                                        key={key}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.theme === key
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, theme: key }))}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Difficulty */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Trophy size={16} className="text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">Độ khó:</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[
                                                    { key: 'easy', label: 'Dễ', color: 'text-green-500 bg-green-500' },
                                                    { key: 'medium', label: 'TB', color: 'text-yellow-500 bg-yellow-500' },
                                                    { key: 'hard', label: 'Khó', color: 'text-red-500 bg-red-500' }
                                                ].map(diff => (
                                                    <button
                                                        key={diff.key}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${gameSettings.difficulty === diff.key
                                                            ? `${diff.color} text-white`
                                                            : 'bg-secondary text-foreground hover:bg-accent'
                                                            }`}
                                                        onClick={() => setGameSettings(prev => ({ ...prev, difficulty: diff.key }))}
                                                    >
                                                        {diff.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Difficulty Description */}
                                        <div className="text-xs text-muted-foreground text-center p-2 bg-secondary/50 rounded-lg">
                                            💡 {DIFFICULTY_OPTIONS[gameSettings.difficulty]?.desc}
                                        </div>
                                    </div>

                                    {/* Quick Reset */}
                                    <button
                                        className="w-full py-2.5 bg-secondary rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                                        onClick={() => setGameSettings({ ...DEFAULT_SETTINGS })}
                                    >
                                        Đặt lại mặc định
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border">
                            <button
                                className="w-full py-3 bg-indigo-500 rounded-xl text-white text-sm font-semibold hover:bg-indigo-600 transition-all shadow-md"
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

export default MemoryLobby;
