import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Globe, ArrowLeft, Crown, Medal, Gamepad2, Star, Palette, Image } from 'lucide-react';

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
    const [countdown, setCountdown] = useState({ hours: 5, minutes: 23, seconds: 41 });

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

            {/* Main Content */}
            <div className="flex-1 flex gap-8 p-6 overflow-y-auto max-md:flex-col">
                {/* Left Side - Play Modes */}
                <div className="flex-1 max-w-[400px] max-md:max-w-full">
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 border border-teal-500 rounded-xl text-white text-base font-medium cursor-pointer transition-all hover:from-teal-600 hover:to-cyan-700"
                            onClick={() => navigate('/games/drawing/play')}
                        >
                            <Gamepad2 size={20} />
                            <div className="flex-1 flex flex-col text-left">
                                <span className="font-semibold">Bắt đầu vẽ</span>
                                <span className="text-xs opacity-80">Mở bảng vẽ trống</span>
                            </div>
                        </button>

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

                {/* Right Side - Gallery */}
                <div className="w-80 flex-shrink-0 max-md:w-full">
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
            </div>
        </div>
    );
};

export default DrawingLobby;
