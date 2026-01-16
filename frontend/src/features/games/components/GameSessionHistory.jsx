import React, { useState, useEffect } from 'react';
import { Clock, Trophy, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { getHistory } from '../../../api/sessionsApi';

/**
 * GameSessionHistory - Compact history component for lobby pages
 * Shows recent game sessions for the current game with pagination
 * 
 * @param {number} gameId - The ID of the game to show history for
 * @param {number} limit - Number of items per page (default: 5)
 */
const GameSessionHistory = ({ gameId, limit = 5 }) => {
    const [sessions, setSessions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);

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
                status: 'completed',
            });
            if (response.success) {
                setSessions(response.data.sessions || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || 0,
                    totalPages: response.data.pagination?.totalPages || 0,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setSessions([]);
        } finally {
            setLoading(false);
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

        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins} phút trước`;
        }
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        }
        // Show date
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getResultIcon = (result) => {
        switch (result) {
            case 'win': return '🏆';
            case 'loss': return '💀';
            case 'draw': return '🤝';
            default: return '🎮';
        }
    };

    const getResultColor = (result) => {
        switch (result) {
            case 'win': return 'text-green-500';
            case 'loss': return 'text-red-500';
            case 'draw': return 'text-yellow-500';
            default: return 'text-muted-foreground';
        }
    };

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        return null; // Don't show for non-logged in users
    }

    return (
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
                            className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{getResultIcon(session.result)}</span>
                                <div>
                                    <div className={`text-sm font-medium ${getResultColor(session.result)}`}>
                                        {session.result === 'win' ? 'Thắng' : session.result === 'loss' ? 'Thua' : 'Hòa'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatDate(session.ended_at || session.started_at)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Trophy size={14} className="text-yellow-500" />
                                    <span>{session.score || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock size={14} />
                                    <span>{formatTime(session.time_elapsed)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameSessionHistory;
