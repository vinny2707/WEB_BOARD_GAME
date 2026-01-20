/**
 * Compact Game Info Components for BoardGame
 * Simplified versions optimized for side panel layout
 */

import React, { useState, useEffect } from "react";
import { Crown, Medal, Clock, Star, User, Trophy, History } from "lucide-react";
import { getGameRankings, getMyGameRanking } from "@/api/rankingsApi";
import { getHistory } from "@/api/sessionsApi";
import { getGameReviews } from "@/api/reviewsApi";
import { useUser } from "@/contexts/UserProvider";

// ============== COMPACT RANKINGS ==============

export const CompactRankings = ({ gameId }) => {
  const [rankings, setRankings] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useUser();

  useEffect(() => {
    if (!gameId) return;
    
    const fetchData = async () => {
      try {
        const [rankRes, myRes] = await Promise.all([
          getGameRankings(gameId, { limit: 5 }),
          getMyGameRanking(gameId).catch(() => null),
        ]);
        
        if (rankRes.success) setRankings(rankRes.data || []);
        if (myRes?.success) setMyRank(myRes.data);
      } catch (err) {
        console.error("Failed to load rankings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [gameId]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 text-xs text-slate-400 flex items-center justify-center">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-slate-700 rounded w-20"></div>
        <div className="h-6 bg-slate-700 rounded"></div>
        <div className="h-6 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-medium text-slate-300">Bảng xếp hạng</span>
      </div>
      
      <div className="space-y-1">
        {rankings.slice(0, 5).map((player, idx) => (
          <div
            key={player.user_id || idx}
            className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
              player.user_id === profile?.id ? "bg-cyan-500/20 border border-cyan-500/30" : "bg-slate-800/50"
            }`}
          >
            {getRankIcon(player.rank || idx + 1)}
            <span className="flex-1 truncate text-slate-200">
              {player.display_name || player.username || "Unknown"}
            </span>
            <span className="text-cyan-400 font-medium">{player.elo_rating || 0}</span>
          </div>
        ))}
        
        {rankings.length === 0 && (
          <p className="text-xs text-slate-500">Chưa có dữ liệu</p>
        )}
        
        {myRank && !rankings.some(p => p.user_id === profile?.id) && (
          <div className="flex items-center gap-2 px-2 py-1 rounded text-xs bg-cyan-500/20 border border-cyan-500/30 mt-2">
            <span className="w-4 h-4 text-xs text-slate-400 flex items-center justify-center">
              {myRank.rank}
            </span>
            <span className="flex-1 truncate text-slate-200">Bạn</span>
            <span className="text-cyan-400 font-medium">{myRank.elo_rating || 0}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ============== COMPACT HISTORY ==============

export const CompactHistory = ({ gameId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    
    const fetchData = async () => {
      try {
        const res = await getHistory({ game_id: gameId, limit: 5 });
        if (res.success) setSessions(res.data?.sessions || res.data || []);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [gameId]);

  const getResultStyle = (result) => {
    switch (result) {
      case 'win': return 'text-green-400 bg-green-500/20';
      case 'loss': return 'text-red-400 bg-red-500/20';
      case 'draw': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getResultText = (result) => {
    switch (result) {
      case 'win': return 'Thắng';
      case 'loss': return 'Thua';
      case 'draw': return 'Hòa';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-slate-700 rounded w-20"></div>
        <div className="h-6 bg-slate-700 rounded"></div>
        <div className="h-6 bg-slate-700 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <History className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-slate-300">Lịch sử gần đây</span>
      </div>
      
      <div className="space-y-1">
        {sessions.slice(0, 5).map((session, idx) => (
          <div
            key={session.id || idx}
            className="flex items-center gap-2 px-2 py-1 rounded text-xs bg-slate-800/50"
          >
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getResultStyle(session.result)}`}>
              {getResultText(session.result)}
            </span>
            <span className="flex-1 text-slate-400">
              {session.score || 0} điểm
            </span>
            <span className="text-slate-500 text-[10px]">
              {session.time_elapsed ? `${Math.floor(session.time_elapsed / 60)}p` : ''}
            </span>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <p className="text-xs text-slate-500">Chưa có lịch sử</p>
        )}
      </div>
    </div>
  );
};

// ============== COMPACT REVIEWS (HORIZONTAL) ==============

export const CompactReviews = ({ gameId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    
    const fetchData = async () => {
      try {
        const res = await getGameReviews(gameId, { limit: 3 });
        if (res.success) {
          const data = res.data?.items || res.data?.reviews || res.data;
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [gameId]);

  if (loading) {
    return (
      <div className="animate-pulse flex gap-2">
        <div className="h-16 bg-slate-700 rounded flex-1"></div>
        <div className="h-16 bg-slate-700 rounded flex-1"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-slate-300">Đánh giá</span>
      </div>
      
      {!Array.isArray(reviews) || reviews.length === 0 ? (
        <p className="text-xs text-slate-500">Chưa có đánh giá</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {reviews.slice(0, 3).map((review, idx) => (
            <div
              key={review.id || idx}
              className="flex-shrink-0 w-40 p-2 rounded bg-slate-800/50 border border-slate-700/50"
            >
              <div className="flex items-center gap-1 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-2.5 h-2.5 ${
                        star <= (review.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 ml-auto">
                  {review.user?.display_name || review.user?.username || "Ẩn danh"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">
                {review.comment || "Không có nhận xét"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default { CompactRankings, CompactHistory, CompactReviews };
