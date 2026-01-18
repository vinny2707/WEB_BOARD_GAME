import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Palette, Image, Settings, X, ChevronLeft } from 'lucide-react';
import useClickSound from '../../hooks/useClickSound';
import GameReviews from '../GameReviews';
import {
    fetchGameSettings,
    getSettingOptions,
    getSettingLabel,
    getOptionLabel,
    extractSettingValues
} from '../../utils/settingsConfig';

// Default game settings
const DEFAULT_SETTINGS = {
    canvasSize: 'medium', // 'small', 'medium', 'large'
    background: 'white', // 'white', 'black', 'grid', 'ruled'
    showGrid: false,
};

const CANVAS_SIZES = {
    small: { label: 'Nhỏ', width: 600, height: 400 },
    medium: { label: 'Vừa', width: 800, height: 600 },
    large: { label: 'Lớn', width: 1000, height: 700 },
};

const BACKGROUNDS = {
    white: { label: 'Trắng', color: '#ffffff', icon: '⬜' },
    black: { label: 'Đen', color: '#1a1a1a', icon: '⬛' },
    grid: { label: 'Ô ly', color: '#ffffff', icon: '📐' },
    ruled: { label: 'Kẻ ngang', color: '#ffffff', icon: '📝' },
};

const galleryItems = [
    { id: 1, author: 'Artist1', likes: 245, preview: '🎨' },
    { id: 2, author: 'Painter2', likes: 189, preview: '🖼️' },
    { id: 3, author: 'Creator3', likes: 156, preview: '🎭' },
    { id: 4, author: 'Designer4', likes: 134, preview: '✨' },
    { id: 5, author: 'DrawMaster', likes: 98, preview: '🌈' },
    { id: 6, author: 'ArtLover', likes: 87, preview: '🌺' },
];

const DrawingLobby = () => {
    const navigate = useNavigate();
    const playClick = useClickSound();
    const [countdown, setCountdown] = useState({ hours: 5, minutes: 23, seconds: 41 });

    // Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState({ ...DEFAULT_SETTINGS });
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [apiSettings, setApiSettings] = useState(null);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // Fetch game settings from API (Drawing has gameId = 7)
    useEffect(() => {
        const loadSettings = async () => {
            setIsLoadingSettings(true);
            const { settings } = await fetchGameSettings(7);
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

    const handleStartDrawing = () => {
        playClick();
        navigate('/games/drawing/play', { state: { settings: gameSettings } });
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-orange-400" size={16} />;
        if (rank === 2) return <Medal className="text-gray-400" size={16} />;
        if (rank === 3) return <Medal className="text-amber-700" size={16} />;
        return null;
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
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl p-2 flex items-center justify-center border-2 border-border">
                        <Palette size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground m-0">Bảng Vẽ Tự Do</h1>
                        <p className="text-sm text-muted-foreground mt-1 m-0">Thỏa sức sáng tạo nghệ thuật!</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Three Column Layout */}
            <div className="flex-1 flex gap-6 p-6 overflow-y-auto max-lg:flex-col">
                {/* Left Side - Gallery */}
                <div className="w-72 flex-shrink-0 max-lg:w-full max-lg:order-2">
                    <div className="bg-card rounded-2xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-foreground m-0">Bộ sưu tập</h3>
                            <Image size={18} className="text-muted-foreground" />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {galleryItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="aspect-square bg-gradient-to-br from-secondary to-accent rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all"
                                >
                                    <span className="text-2xl">{item.preview}</span>
                                    <span className="text-[10px] text-muted-foreground mt-1">❤️ {item.likes}</span>
                                </div>
                            ))}
                        </div>

                        {/* Top Artists */}
                        <h4 className="text-sm font-semibold text-foreground mb-2">Họa sĩ nổi bật</h4>
                        <div className="flex flex-col gap-2">
                            {galleryItems.slice(0, 3).map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent
                                        ${idx === 0 ? 'bg-teal-500/10' : ''}`}
                                >
                                    <div className="w-6 text-center">{getRankIcon(idx + 1)}</div>
                                    <span className="text-xl">{item.preview}</span>
                                    <span className="flex-1 text-sm font-medium text-foreground">{item.author}</span>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm text-muted-foreground">{item.likes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-3 mt-2 bg-transparent border-none text-teal-500 text-sm font-medium cursor-pointer hover:text-teal-600 transition-colors">
                            Xem tất cả
                        </button>

                        <div className="text-center pt-3 border-t border-border mt-2">
                            <span className="block text-xs text-muted-foreground mb-2">Cuộc thi vẽ tuần này, kết thúc sau</span>
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
                        {/* Start Drawing Button with Settings */}
                        <div className="flex items-center gap-2">
                            <button
                                className="flex-1 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 border border-teal-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-teal-600 hover:to-cyan-700"
                                onClick={handleStartDrawing}
                            >
                                <Gamepad2 size={20} />
                                <div className="flex-1 flex flex-col text-left">
                                    <span className="font-semibold">Bắt đầu vẽ</span>
                                    <span className="text-xs opacity-80">
                                        {CANVAS_SIZES[gameSettings.canvasSize]?.label} | {BACKGROUNDS[gameSettings.background]?.icon}
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

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-teal-500"
                            onClick={() => alert('Tính năng vẽ cùng bạn bè đang được phát triển!')}
                        >
                            <Users size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Vẽ cùng bạn bè</span>
                                <span className="text-xs text-muted-foreground">Chia sẻ bảng vẽ realtime</span>
                            </div>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-teal-500"
                            onClick={() => alert('Tính năng đoán hình đang được phát triển!')}
                        >
                            <Trophy size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Đoán hình (Pictionary)</span>
                                <span className="text-xs text-muted-foreground">Vẽ và đoán với bạn bè</span>
                            </div>
                        </button>

                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-card border border-border rounded-xl text-foreground text-base font-medium cursor-pointer transition-all hover:bg-accent hover:border-teal-500"
                            onClick={() => alert('Tính năng thi vẽ đang được phát triển!')}
                        >
                            <Globe size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span>Thi vẽ online</span>
                                <span className="text-xs text-muted-foreground">Cạnh tranh với người chơi khác</span>
                            </div>
                        </button>
                    </div>

                    {/* How to Use */}
                    <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-base font-semibold text-foreground mb-3">Hướng dẫn</h3>
                        <ul className="text-sm text-muted-foreground space-y-2">
                            <li>🖌️ Chọn công cụ vẽ (bút, tẩy, hình...)</li>
                            <li>🎨 Chọn màu sắc yêu thích</li>
                            <li>📏 Điều chỉnh kích thước nét vẽ</li>
                            <li>↩️ Dùng Undo/Redo để sửa lỗi</li>
                            <li>💾 Tải bản vẽ về máy khi hoàn thành</li>
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
                                {isCustomMode && (
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all mr-1"
                                        onClick={() => setIsCustomMode(false)}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <Palette size={20} className="text-teal-500" />
                                <h2 className="text-lg font-bold text-foreground m-0">
                                    {isCustomMode ? 'Tùy chỉnh cài đặt' : 'Cài đặt bảng vẽ'}
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
                                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-lg p-1.5 flex items-center justify-center">
                                    <Palette size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground m-0">Bảng Vẽ Tự Do</p>
                                    <p className="text-xs text-muted-foreground m-0">Thỏa sức sáng tạo!</p>
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
                                            
                                            // Handle boolean values for display
                                            let displayValue = getOptionLabel(apiSettings, settingKey, currentValue);
                                            if (typeof currentValue === 'boolean') {
                                                displayValue = currentValue ? 'Bật' : 'Tắt';
                                            }
                                            
                                            return (
                                                <div key={settingKey} className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {getSettingLabel(apiSettings, settingKey)}
                                                    </span>
                                                    <span className={`font-semibold ${colorClass}`}>
                                                        {option?.icon ? `${option.icon} ` : ''}
                                                        {displayValue}
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
                                            const settingType = apiSettings[settingKey]?.type || 'select';
                                            
                                            const colorMap = {
                                                green: { selected: 'bg-green-500 text-white' },
                                                yellow: { selected: 'bg-yellow-500 text-white' },
                                                red: { selected: 'bg-red-500 text-white' },
                                                blue: { selected: 'bg-blue-500 text-white' },
                                            };
                                            
                                            return (
                                                <div key={settingKey} className="flex items-center justify-between">
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
                                                                        ? 'bg-teal-500' 
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
                                                        ) : options.length > 0 ? (
                                                            options.map(opt => {
                                                                const isSelected = gameSettings[settingKey] === opt.value;
                                                                const optColor = opt.color;
                                                                const colorClasses = optColor && colorMap[optColor];
                                                                
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                            isSelected
                                                                                ? (colorClasses?.selected || 'bg-teal-500 text-white')
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
                                                        ) : null}
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
                                className="w-full py-3 bg-teal-500 rounded-xl text-white text-sm font-semibold hover:bg-teal-600 transition-all shadow-md"
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

export default DrawingLobby;
