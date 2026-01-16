import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Clock, Trophy, GamepadIcon, Filter } from 'lucide-react';
import { getHistory, deleteSession } from '../../../api/sessionsApi';

/**
 * GameHistory - Display user's game history with filtering and pagination
 */
const GameHistory = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ game_id: '', status: '' });

    // Fetch history on mount and filter change
    useEffect(() => {
        fetchHistory();
    }, [pagination.page, filter]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await getHistory({
                page: pagination.page,
                limit: pagination.limit,
                ...(filter.game_id && { game_id: filter.game_id }),
                ...(filter.status && { status: filter.status }),
            });
            if (response.success) {
                setSessions(response.data.sessions || []);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa session này?')) return;
        try {
            await deleteSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert('Không thể xóa session: ' + err.message);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getResultBadge = (result) => {
        const badges = {
            win: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Thắng' },
            loss: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Thua' },
            draw: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Hòa' },
        };
        const badge = badges[result] || badges.loss;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
                <div className="flex items-center gap-4">
                    <button
                        className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Lịch sử chơi</h1>
                        <p className="text-sm text-muted-foreground">Xem tất cả các ván đã chơi</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 px-6 py-4 bg-card/50 border-b border-border">
                <Filter size={18} className="text-muted-foreground" />
                <select
                    className="px-3 py-2 bg-secondary rounded-lg text-sm text-foreground border-0 focus:ring-2 focus:ring-emerald-500"
                    value={filter.status}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="in_progress">Đang chơi</option>
                </select>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <GamepadIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Chưa có lịch sử chơi game</p>
                        <button
                            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                            onClick={() => navigate('/games')}
                        >
                            Chơi ngay
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-emerald-500/50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex items-center justify-center bg-secondary rounded-lg text-2xl">
                                        {session.game_icon || '🎮'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">
                                                {session.game_name || 'Unknown Game'}
                                            </span>
                                            {session.result && getResultBadge(session.result)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1">
                                                <Trophy size={14} />
                                                {session.score || 0} điểm
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {formatTime(session.time_elapsed)}
                                            </span>
                                            <span>{formatDate(session.started_at)}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    onClick={() => handleDelete(session.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            className="px-4 py-2 bg-secondary rounded-lg text-sm disabled:opacity-50"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Trước
                        </button>
                        <span className="text-sm text-muted-foreground">
                            Trang {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                            className="px-4 py-2 bg-secondary rounded-lg text-sm disabled:opacity-50"
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameHistory;
