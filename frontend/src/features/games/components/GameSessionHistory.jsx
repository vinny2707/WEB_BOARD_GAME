import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trophy, ChevronLeft, ChevronRight, History, Play, X, Eye, Calendar, Zap, Trash2 } from 'lucide-react';
import { getHistory, getSession, deleteSession } from '../../../api/sessionsApi';

/**
 * GameSessionHistory - Compact history component for lobby pages
 * Shows recent game sessions for the current game with pagination
 * 
 * @param {number} gameId - The ID of the game to show history for
 * @param {number} limit - Number of items per page (default: 5)
 * @param {string} gamePath - Path to navigate for resuming in-progress games
 * @param {function} onInProgressChange - Callback when in_progress session availability changes
 */
const GameSessionHistory = ({ gameId, limit = 5, gamePath, onInProgressChange }) => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [resumingId, setResumingId] = useState(null);

    // Session detail modal state
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (!gameId) return;
        fetchHistory();
    }, [gameId, pagination.page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await getHistory({
                page: pagination.page,
                limit,
                game_id: gameId,
            });
            if (response.success) {
                const sessionsData = response.data.sessions || [];
                setSessions(sessionsData);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || 0,
                    totalPages: response.data.pagination?.totalPages || 0,
                }));

                if (onInProgressChange) {
                    const inProgressSession = sessionsData.find(s => s.status === 'in_progress');
                    onInProgressChange(!!inProgressSession, inProgressSession || null);
                }
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResumeSession = async (session, e) => {
        e?.stopPropagation();
        if (!gamePath || !session.id) return;

        setResumingId(session.id);
        try {
            const response = await getSession(session.id);
            const fullSession = response?.data || session;

            // Navigate to the play route (append /play if not already there)
            const playPath = gamePath.endsWith('/play') ? gamePath : `${gamePath}/play`;
            navigate(playPath, {
                state: {
                    settings: fullSession.settings || {},
                    resumeSession: fullSession,
                }
            });
        } catch (error) {
            console.error('Failed to fetch session:', error);
            setResumingId(null);
        }
    };

    const handleViewSession = async (session) => {
        if (session.status === 'in_progress') return; // Don't view in-progress, only resume

        setDetailLoading(true);
        try {
            const response = await getSession(session.id);
            setSelectedSession(response?.data || session);
        } catch (error) {
            console.error('Failed to fetch session details:', error);
            setSelectedSession(session);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedSession(null);
    };

    // Delete session handler
    const handleDeleteSession = async (sessionId) => {
        if (!sessionId) return;

        // Confirm deletion
        const confirmed = window.confirm('Bạn có chắc muốn xóa lượt chơi này không?');
        if (!confirmed) return;

        setDeletingId(sessionId);
        try {
            await deleteSession(sessionId);
            // Remove from local state
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            // Close modal if deleting the selected session
            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
            }
            // Update in-progress status if needed
            if (onInProgressChange) {
                const remainingSessions = sessions.filter(s => s.id !== sessionId);
                const inProgressSession = remainingSessions.find(s => s.status === 'in_progress');
                onInProgressChange(!!inProgressSession, inProgressSession || null);
            }
            // Show success toast
            import('sonner').then(({ toast }) => {
                toast.success('Đã xóa lượt chơi!', { duration: 2000 });
            });
        } catch (error) {
            console.error('Failed to delete session:', error);
            import('sonner').then(({ toast }) => {
                toast.error('Không thể xóa lượt chơi', { duration: 2000 });
            });
        } finally {
            setDeletingId(null);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins} phút trước`;
        }
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        }
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getResultIcon = (result, status) => {
        if (status === 'in_progress') return '⏸️';
        switch (result) {
            case 'win': return '🏆';
            case 'loss': return '💀';
            case 'draw': return '🤝';
            default: return '🎮';
        }
    };

    const getResultText = (result, status) => {
        if (status === 'in_progress') return 'Đang chơi';
        switch (result) {
            case 'win': return 'Thắng';
            case 'loss': return 'Thua';
            case 'draw': return 'Hòa';
            default: return '-';
        }
    };

    const getResultColor = (result, status) => {
        if (status === 'in_progress') return 'text-blue-500';
        switch (result) {
            case 'win': return 'text-green-500';
            case 'loss': return 'text-red-500';
            case 'draw': return 'text-yellow-500';
            default: return 'text-muted-foreground';
        }
    };

    // Render mini board for session detail (TicTacToe, Caro)
    const renderMiniBoard = (gameState) => {
        if (!gameState?.board) return null;

        const board = gameState.board;
        const size = gameState.boardSize || Math.sqrt(board.length);
        const cellSize = size <= 5 ? 'w-8 h-8 text-lg' : size <= 10 ? 'w-6 h-6 text-sm' : 'w-4 h-4 text-xs';

        return (
            <div
                className="grid gap-0.5 bg-border p-1 rounded-lg"
                style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
                {board.map((cell, index) => (
                    <div
                        key={index}
                        className={`${cellSize} flex items-center justify-center bg-card rounded font-bold
                            ${cell === 'X' ? 'text-emerald-500' : cell === 'O' ? 'text-orange-500' : 'text-transparent'}`}
                    >
                        {cell || '·'}
                    </div>
                ))}
            </div>
        );
    };

    // Render snake board for Snake game
    const renderSnakeBoard = (gameState) => {
        if (!gameState?.snake) return null;

        const snake = gameState.snake || [];
        const food = gameState.food;
        const boardSize = 20; // Default snake board size

        // Create a simple mini visualization
        const minX = Math.min(...snake.map(s => s.x), food?.x || 0);
        const maxX = Math.max(...snake.map(s => s.x), food?.x || boardSize);
        const minY = Math.min(...snake.map(s => s.y), food?.y || 0);
        const maxY = Math.max(...snake.map(s => s.y), food?.y || boardSize);

        // Show a small area around the snake
        const viewSize = Math.min(10, Math.max(maxX - minX + 3, maxY - minY + 3));
        const startX = Math.max(0, Math.floor((minX + maxX) / 2) - Math.floor(viewSize / 2));
        const startY = Math.max(0, Math.floor((minY + maxY) / 2) - Math.floor(viewSize / 2));

        return (
            <div className="flex flex-col items-center gap-2">
                <div
                    className="grid gap-0.5 bg-green-900/30 p-1 rounded-lg border border-green-500/30"
                    style={{ gridTemplateColumns: `repeat(${viewSize}, 1fr)` }}
                >
                    {Array.from({ length: viewSize * viewSize }).map((_, index) => {
                        const x = startX + (index % viewSize);
                        const y = startY + Math.floor(index / viewSize);

                        const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
                        const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
                        const isFood = food?.x === x && food?.y === y;

                        let cellClass = 'bg-card/50';
                        let content = '';

                        if (isSnakeHead) {
                            cellClass = 'bg-green-500';
                            content = '🐍';
                        } else if (isSnakeBody) {
                            cellClass = 'bg-green-400';
                        } else if (isFood) {
                            cellClass = 'bg-red-400';
                            content = '🍎';
                        }

                        return (
                            <div
                                key={index}
                                className={`w-5 h-5 flex items-center justify-center rounded-sm text-xs ${cellClass}`}
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>
                <div className="text-xs text-muted-foreground">
                    🐍 Độ dài: {snake.length} ô
                </div>
            </div>
        );
    };

    // Match3 candy icons (same as in Match3Game)
    const CANDY_ICONS = [
        "/Icons8/icons8-strawberry-50.png",
        "/Icons8/icons8-orange-50.png",
        "/Icons8/icons8-banana-50.png",
        "/Icons8/icons8-grapes-50.png",
        "/Icons8/icons8-cherry-50.png",
        "/Icons8/icons8-blueberry-50.png",
        "/Icons8/icons8-watermelon-50.png",
    ];

    // Render Match3 candy board with icons
    const renderMatch3Board = (gameState) => {
        if (!gameState?.board) return null;

        const board = gameState.board;
        // Board is array of candy types (numbers)
        const size = Math.sqrt(board.length);
        if (!Number.isInteger(size)) return null;

        // Smaller cell sizes for mini board
        const cellPx = size <= 6 ? 24 : size <= 8 ? 20 : 16;

        return (
            <div className="flex flex-col items-center gap-2">
                <div
                    className="grid gap-0.5 bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 p-1.5 rounded-lg border border-pink-300/50 shadow-sm"
                    style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
                >
                    {board.map((candyType, index) => {
                        const iconSrc = typeof candyType === 'number' ? CANDY_ICONS[candyType] : null;
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-center rounded-sm bg-white/50 dark:bg-white/10"
                                style={{ width: cellPx, height: cellPx }}
                            >
                                {iconSrc ? (
                                    <img
                                        src={iconSrc}
                                        alt=""
                                        style={{ width: cellPx - 4, height: cellPx - 4 }}
                                        className="object-contain"
                                    />
                                ) : (
                                    <div
                                        className="rounded-full bg-gray-300"
                                        style={{ width: cellPx - 6, height: cellPx - 6 }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-xs text-muted-foreground">
                    🍬 {size}x{size} bàn kẹo
                </div>
            </div>
        );
    };

    // Render Memory card board
    const renderMemoryBoard = (gameState) => {
        if (!gameState?.symbols) return null;

        const symbols = gameState.symbols;
        const matchedIds = gameState.matchedIds || [];
        const size = Math.sqrt(symbols.length);
        if (!Number.isInteger(size)) return null;

        const cellPx = size <= 4 ? 28 : size <= 6 ? 22 : 18;

        return (
            <div className="flex flex-col items-center gap-2">
                <div
                    className="grid gap-0.5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-1.5 rounded-lg border border-indigo-300/50 shadow-sm"
                    style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
                >
                    {symbols.map((symbol, index) => {
                        const isMatched = matchedIds.includes(index);
                        const isImage = symbol && symbol.startsWith('/');

                        return (
                            <div
                                key={index}
                                className={`flex items-center justify-center rounded-sm ${isMatched
                                    ? 'bg-green-100 dark:bg-green-900/30 border border-green-400/50'
                                    : 'bg-indigo-500/80'
                                    }`}
                                style={{ width: cellPx, height: cellPx }}
                            >
                                {isMatched ? (
                                    isImage ? (
                                        <img
                                            src={symbol}
                                            alt=""
                                            style={{ width: cellPx - 6, height: cellPx - 6 }}
                                            className="object-contain"
                                        />
                                    ) : (
                                        <span style={{ fontSize: cellPx - 10 }}>{symbol}</span>
                                    )
                                ) : (
                                    <span className="text-white/50 font-bold" style={{ fontSize: cellPx - 12 }}>?</span>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="text-xs text-muted-foreground">
                    🧠 {size}x{size} thẻ - {matchedIds.length / 2}/{symbols.length / 2} cặp
                </div>
            </div>
        );
    };

    // Render game state based on game type
    const renderGameState = (session) => {
        if (!session?.game_state) return null;

        // Memory game - check for symbols array
        if (session.game_type === 'memory' || session.game_state.symbols) {
            return renderMemoryBoard(session.game_state);
        }

        // Match3 game - check for candy board (array of numbers)
        if (session.game_type === 'match3' ||
            (Array.isArray(session.game_state.board) && typeof session.game_state.board[0] === 'number')) {
            return renderMatch3Board(session.game_state);
        }

        // Snake game
        if (session.game_type === 'snake' || session.game_state.snake) {
            return renderSnakeBoard(session.game_state);
        }

        // Board games (TicTacToe, Caro) - board with X/O strings
        if (session.game_state.board && typeof session.game_state.board[0] === 'string') {
            return renderMiniBoard(session.game_state);
        }

        // Fallback for any board
        if (session.game_state.board) {
            return renderMiniBoard(session.game_state);
        }

        return null;
    };

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    return (
        <>
            <div className="mt-6 p-4 bg-card rounded-xl border border-border">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-muted-foreground" />
                        <span className="font-semibold text-foreground">Lịch sử của bạn</span>
                    </div>
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                className="p-1 rounded hover:bg-accent disabled:opacity-30"
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-muted-foreground px-2">
                                {pagination.page}/{pagination.totalPages}
                            </span>
                            <button
                                className="p-1 rounded hover:bg-accent disabled:opacity-30"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        <p>Chưa có lịch sử chơi game này</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => handleViewSession(session)}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${session.status === 'in_progress'
                                    ? 'bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/15'
                                    : 'bg-secondary/50 hover:bg-secondary'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{getResultIcon(session.result, session.status)}</span>
                                    <div>
                                        <div className={`text-sm font-medium ${getResultColor(session.result, session.status)}`}>
                                            {getResultText(session.result, session.status)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatDate(session.ended_at || session.started_at)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    {session.status === 'in_progress' ? (
                                        <button
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all disabled:opacity-50"
                                            onClick={(e) => handleResumeSession(session, e)}
                                            disabled={resumingId === session.id}
                                        >
                                            {resumingId === session.id ? (
                                                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                <Play size={12} />
                                            )}
                                            <span>Tiếp tục</span>
                                        </button>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Trophy size={14} className="text-yellow-500" />
                                                <span>{session.score || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock size={14} />
                                                <span>{formatTime(session.time_elapsed)}</span>
                                            </div>
                                        </>
                                    )}
                                    {/* Delete button */}
                                    <button
                                        className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSession(session.id);
                                        }}
                                        disabled={deletingId === session.id}
                                        title="Xóa"
                                    >
                                        {deletingId === session.id ? (
                                            <div className="animate-spin w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Session Detail Modal */}
            {(selectedSession || detailLoading) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div
                        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {detailLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                            </div>
                        ) : selectedSession && (
                            <>
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getResultIcon(selectedSession.result, selectedSession.status)}</span>
                                        <div>
                                            <h2 className={`text-lg font-bold ${getResultColor(selectedSession.result, selectedSession.status)}`}>
                                                {getResultText(selectedSession.result, selectedSession.status)}
                                            </h2>
                                            <p className="text-xs text-muted-foreground">{selectedSession.game_name}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
                                        onClick={closeModal}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Content */}
                                <div className="px-6 py-5 space-y-4">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl">
                                            <Trophy size={18} className="text-yellow-500 mb-1" />
                                            <span className="text-lg font-bold text-foreground">{selectedSession.score || 0}</span>
                                            <span className="text-xs text-muted-foreground">Điểm</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl">
                                            <Zap size={18} className="text-blue-500 mb-1" />
                                            <span className="text-lg font-bold text-foreground">{selectedSession.moves_count || 0}</span>
                                            <span className="text-xs text-muted-foreground">Nước đi</span>
                                        </div>
                                        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-xl">
                                            <Clock size={18} className="text-emerald-500 mb-1" />
                                            <span className="text-lg font-bold text-foreground">{formatTime(selectedSession.time_elapsed)}</span>
                                            <span className="text-xs text-muted-foreground">Thời gian</span>
                                        </div>
                                    </div>

                                    {/* Game State Visualization */}
                                    {selectedSession.game_state && (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {selectedSession.game_type === 'snake' ? 'Vị trí rắn' : 'Trạng thái bàn cờ'}
                                            </span>
                                            {renderGameState(selectedSession)}
                                        </div>
                                    )}

                                    {/* Time Info */}
                                    <div className="space-y-2 p-3 bg-secondary/30 rounded-xl">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Calendar size={14} />
                                                Bắt đầu
                                            </span>
                                            <span className="text-foreground">{formatFullDate(selectedSession.started_at)}</span>
                                        </div>
                                        {selectedSession.ended_at && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    Kết thúc
                                                </span>
                                                <span className="text-foreground">{formatFullDate(selectedSession.ended_at)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Settings */}
                                    {selectedSession.settings && Object.keys(selectedSession.settings).length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium text-muted-foreground">Cài đặt</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSession.settings.difficulty && (
                                                    <span className="px-2 py-1 bg-purple-500/15 text-purple-500 rounded-lg text-xs font-medium">
                                                        {selectedSession.settings.difficulty === 'easy' ? 'Dễ' :
                                                            selectedSession.settings.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                                    </span>
                                                )}
                                                {selectedSession.settings.boardSize && (
                                                    <span className="px-2 py-1 bg-blue-500/15 text-blue-500 rounded-lg text-xs font-medium">
                                                        {selectedSession.settings.boardSize}x{selectedSession.settings.boardSize}
                                                    </span>
                                                )}
                                                {selectedSession.settings.timePerTurn > 0 && (
                                                    <span className="px-2 py-1 bg-amber-500/15 text-amber-500 rounded-lg text-xs font-medium">
                                                        {selectedSession.settings.timePerTurn}s/lượt
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 border-t border-border flex gap-3">
                                    <button
                                        className="flex-1 py-3 bg-secondary rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-all"
                                        onClick={closeModal}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="py-3 px-4 bg-red-500/15 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/25 transition-all flex items-center gap-2"
                                        onClick={() => handleDeleteSession(selectedSession.id)}
                                        disabled={deletingId === selectedSession.id}
                                    >
                                        {deletingId === selectedSession.id ? (
                                            <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                        Xóa
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default GameSessionHistory;
