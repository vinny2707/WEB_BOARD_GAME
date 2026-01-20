import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Filter, Clock, User, Send, Loader2, Pencil, X, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useGameReviews from '../hooks/useGameReviews';
import { createReview, updateReview, deleteReview } from '../../../api/reviewsApi';

// Get current user ID from token
const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch {
        return null;
    }
};

// Star Rating Display Component
const StarRating = ({ rating, size = 16 }) => {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={size}
                    className={star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }
                />
            ))}
        </div>
    );
};

// Interactive Star Rating Input Component
const StarRatingInput = ({ value, onChange, size = 24 }) => {
    const [hoverValue, setHoverValue] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHoverValue(star)}
                    onMouseLeave={() => setHoverValue(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                >
                    <Star
                        size={size}
                        className={star <= (hoverValue || value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30 hover:text-amber-300'
                        }
                    />
                </button>
            ))}
        </div>
    );
};

// Review Form Component
const ReviewForm = ({ gameId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!comment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setSubmitting(true);

        try {
            await createReview({
                gameId,
                rating,
                comment: comment.trim()
            });

            toast.success('Đánh giá của bạn đã được gửi thành công!');
            setRating(0);
            setComment('');

            // Trigger refresh of reviews list
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="p-4 bg-secondary/50 rounded-xl border border-border text-center">
                <p className="text-sm text-muted-foreground">
                    Vui lòng <span className="text-primary font-medium">đăng nhập</span> để viết đánh giá
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-card rounded-xl border border-border space-y-4">
            <h3 className="font-semibold text-foreground">Viết đánh giá của bạn</h3>

            {/* Rating Input */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Đánh giá:</span>
                <StarRatingInput value={rating} onChange={setRating} />
                {rating > 0 && (
                    <span className="text-sm text-amber-500 font-medium">{rating}/5</span>
                )}
            </div>

            {/* Comment Input */}
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về game này..."
                rows={3}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {submitting ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Đang gửi...
                    </>
                ) : (
                    <>
                        <Send size={18} />
                        Gửi đánh giá
                    </>
                )}
            </button>
        </form>
    );
};

// Single Review Item with Edit and Delete functionality
const ReviewItem = ({ review, onEditSuccess, onDeleteSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editRating, setEditRating] = useState(review.rating);
    const [editComment, setEditComment] = useState(review.comment || '');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const currentUserId = getCurrentUserId();
    const isOwner = currentUserId && review.user_id === currentUserId;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleEdit = () => {
        setEditRating(review.rating);
        setEditComment(review.comment || '');
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
    };

    const handleSaveEdit = async () => {
        if (editRating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!editComment.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setSubmitting(true);

        try {
            await updateReview(review.id, {
                rating: editRating,
                comment: editComment.trim()
            });

            toast.success('Đánh giá đã được cập nhật!');
            setIsEditing(false);

            if (onEditSuccess) {
                onEditSuccess();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đánh giá');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        setShowDeleteConfirm(false);

        try {
            await deleteReview(review.id);
            toast.success('Đánh giá đã được xóa!');

            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá');
        } finally {
            setDeleting(false);
        }
    };

    // Edit Mode
    if (isEditing) {
        return (
            <div className="p-4 bg-secondary rounded-xl border-2 border-primary/50 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground text-sm">Chỉnh sửa đánh giá</h4>
                    <button
                        onClick={handleCancelEdit}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Rating Input */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Đánh giá:</span>
                    <StarRatingInput value={editRating} onChange={setEditRating} size={20} />
                    <span className="text-sm text-amber-500 font-medium">{editRating}/5</span>
                </div>

                {/* Comment Input */}
                <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleCancelEdit}
                        disabled={submitting}
                        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        disabled={submitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                        {submitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Check size={14} />
                        )}
                        Lưu
                    </button>
                </div>
            </div>
        );
    }

    // Normal Display Mode
    return (
        <div className="p-4 bg-secondary rounded-xl border border-border hover:border-primary/30 transition-all">
            {/* Header - User info & Rating */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center cursor-pointer group">
                        {review.avatar_url ? (
                            <img
                                src={review.avatar_url}
                                alt={review.username}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-165"
                            />
                        ) : (
                            <User size={18} className="text-primary transition-transform duration-200 group-hover:scale-165" />
                        )}
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {review.full_name || review.username}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(review.created_at)}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {isOwner && (
                        <>
                            <button
                                onClick={handleEdit}
                                disabled={deleting}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all disabled:opacity-50"
                                title="Sửa đánh giá"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting || submitting}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50"
                                title="Xóa đánh giá"
                            >
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Comment */}
            {review.comment && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                </p>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                                <Trash2 size={20} className="text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Xác nhận xóa</h3>
                                <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa đánh giá này?</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-all"
                            >
                                {deleting && <Loader2 size={14} className="animate-spin" />}
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Reviews Stats Summary
const ReviewsStats = ({ stats }) => {
    const avgRating = parseFloat(stats.average_rating) || 0;

    return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
            <div className="text-center">
                <div className="text-3xl font-bold text-amber-500">{avgRating.toFixed(1)}</div>
                <StarRating rating={Math.round(avgRating)} size={14} />
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.total_reviews}</span> đánh giá
            </div>
        </div>
    );
};

// Sort Dropdown
const SortDropdown = ({ value, onChange }) => {
    const options = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'oldest', label: 'Cũ nhất' },
        { value: 'highest', label: 'Đánh giá cao' },
        { value: 'lowest', label: 'Đánh giá thấp' },
    ];

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
};

// Rating Filter
const RatingFilter = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <div className="flex gap-1">
                <button
                    onClick={() => onChange(null)}
                    className={`px-2 py-1 text-xs rounded-md transition-all ${!value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-accent'
                        }`}
                >
                    Tất cả
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => onChange(value === rating ? null : rating)}
                        className={`px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 ${value === rating
                            ? 'bg-amber-500 text-white'
                            : 'bg-secondary text-muted-foreground hover:bg-accent'
                            }`}
                    >
                        {rating} <Star size={10} className="fill-current" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// Pagination Component
const Pagination = ({ pagination, onPageChange }) => {
    const { page, totalPages } = pagination;

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 bg-secondary rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                                <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <button
                                onClick={() => onPageChange(p)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-muted-foreground hover:bg-accent'
                                    }`}
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    ))}
            </div>

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 bg-secondary rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

// Loading Skeleton
const ReviewSkeleton = () => (
    <div className="p-4 bg-secondary rounded-xl border border-border animate-pulse">
        <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div>
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded mt-1" />
                </div>
            </div>
            <div className="h-4 w-20 bg-muted rounded" />
        </div>
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded mt-2" />
    </div>
);

/**
 * GameReviews Component - Display and manage game reviews
 * @param {Object} props
 * @param {number} props.gameId - The ID of the game
 * @param {string} props.className - Additional CSS classes
 */
const GameReviews = ({ gameId, className = '' }) => {
    const {
        reviews,
        pagination,
        stats,
        loading,
        error,
        params,
        goToPage,
        setSortOrder,
        filterByRating,
        refetch,
    } = useGameReviews(gameId);

    const [ratingFilter, setRatingFilter] = useState(null);

    const handleRatingFilter = (rating) => {
        setRatingFilter(rating);
        filterByRating(rating);
    };

    const handleReviewSuccess = () => {
        // Refresh reviews list after successful submission
        if (refetch) {
            refetch();
        }
    };

    if (!gameId) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Đánh giá</h2>
            </div>

            {/* Review Form */}
            <ReviewForm gameId={gameId} onSuccess={handleReviewSuccess} />

            {/* Stats */}
            {!loading && stats.total_reviews > 0 && (
                <ReviewsStats stats={stats} />
            )}

            {/* Filters & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <RatingFilter value={ratingFilter} onChange={handleRatingFilter} />
                <SortDropdown value={params.sort} onChange={setSortOrder} />
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                    {error}
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
                {loading ? (
                    // Loading skeletons
                    <>
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                    </>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onEditSuccess={handleReviewSuccess}
                            onDeleteSuccess={handleReviewSuccess}
                        />
                    ))
                ) : (
                    // Empty state
                    <div className="p-8 text-center bg-secondary rounded-xl">
                        <Star size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground">
                            {ratingFilter
                                ? `Không có đánh giá ${ratingFilter} sao nào.`
                                : 'Chưa có đánh giá nào cho game này.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && <Pagination pagination={pagination} onPageChange={goToPage} />}
        </div>
    );
};

export default GameReviews;

