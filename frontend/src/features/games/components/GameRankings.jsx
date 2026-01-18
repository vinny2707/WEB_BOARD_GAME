import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Medal, Loader2, User } from "lucide-react";
import { getGameRankings, getMyGameRanking } from "../../../api/rankingsApi";
import { useUser } from "../../../contexts/UserProvider";

/**
 * GameRankings Component - Displays leaderboard for a specific game
 * @param {Object} props
 * @param {number} props.gameId - Game ID to fetch rankings for
 * @param {string} [props.themeColor='emerald'] - Theme color: 'emerald', 'green', 'indigo', 'orange', 'amber'
 * @param {number} [props.limit=8] - Number of players to display
 * @param {boolean} [props.showCountdown=true] - Whether to show countdown timer
 */
const GameRankings = ({
  gameId,
  themeColor = "emerald",
  limit = 8,
  showCountdown = true,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useUser(); // Get current user from context
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null); // Current user's rank from /me endpoint
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  /* const [countdown, setCountdown] = useState({
    hours: 2,
    minutes: 15,
    seconds: 45,
  }); */

  // Theme color mapping
  const themeColors = {
    emerald: {
      text: "text-emerald-500",
      bg: "from-emerald-500/15",
      border: "border-emerald-500/30",
      hover: "hover:text-emerald-600",
      highlight: "bg-emerald-500/20 border-emerald-500/50",
    },
    green: {
      text: "text-green-500",
      bg: "from-green-500/15",
      border: "border-green-500/30",
      hover: "hover:text-green-600",
      highlight: "bg-green-500/20 border-green-500/50",
    },
    indigo: {
      text: "text-indigo-500",
      bg: "from-indigo-500/15",
      border: "border-indigo-500/30",
      hover: "hover:text-indigo-600",
      highlight: "bg-indigo-500/20 border-indigo-500/50",
    },
    orange: {
      text: "text-orange-500",
      bg: "from-orange-500/15",
      border: "border-orange-500/30",
      hover: "hover:text-orange-600",
      highlight: "bg-orange-500/20 border-orange-500/50",
    },
    amber: {
      text: "text-amber-500",
      bg: "from-amber-500/15",
      border: "border-amber-500/30",
      hover: "hover:text-amber-600",
      highlight: "bg-amber-500/20 border-amber-500/50",
    },
  };

  const colors = themeColors[themeColor] || themeColors.emerald;

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem("token");
  };

  // Fetch rankings and my ranking
  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!gameId) return;

    try {
      // Fetch global rankings
      const response = await getGameRankings(gameId, {
        limit,
        scope: "global",
      });
      if (response.success && response.data) {
        setRankings(response.data);
      }

      // Fetch my ranking if authenticated
      if (isAuthenticated()) {
        try {
          const myRankResponse = await getMyGameRanking(gameId);
          if (myRankResponse.success && myRankResponse.data) {
            setMyRanking(myRankResponse.data);
          }
        } catch (err) {
          // User might not have any ranking for this game yet
          console.log("No ranking data for current user:", err.message);
          setMyRanking(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch rankings:", err);
      setError("Không thể tải bảng xếp hạng");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, limit]);

  useEffect(() => {
    if (gameId) {
      fetchRankings();
    } else {
      setIsLoading(true); // Keep loading state if gameId is pending
    }
  }, [fetchRankings, gameId]);

  // Countdown timer
  /* useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown]); */

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="text-orange-400" size={16} />;
    if (rank === 2) return <Medal className="text-gray-400" size={16} />;
    if (rank === 3) return <Medal className="text-amber-700" size={16} />;
    return <span className="text-sm text-muted-foreground">{rank}.</span>;
  };

  // Check if a player is the current user
  const isCurrentUser = (player) => {
    if (!myRanking) return false;
    return player.rank === myRanking.rank;
  };

  // Check if my ranking is in the displayed list
  const isMyRankInList = () => {
    if (!myRanking) return false;
    return rankings.some((r) => r.rank === myRanking.rank);
  };

  // Get current user info from context (profile API)
  const getCurrentUserName = () => {
    if (currentUser) {
      return currentUser.username || currentUser.full_name || "You";
    }
    return "You";
  };

  // Get current user avatar from context (profile API)
  const getCurrentUserAvatar = () => {
    if (currentUser) {
      return currentUser.avatar_url || null;
    }
    return null;
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <h3 className="text-base font-semibold text-foreground mb-4 m-0">
        Bảng xếp hạng
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className={`animate-spin ${colors.text}`} size={24} />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            className={`mt-2 text-sm ${colors.text} ${colors.hover}`}
            onClick={fetchRankings}
          >
            Thử lại
          </button>
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu xếp hạng
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {rankings.map((player) => {
              const isMe = isCurrentUser(player);
              return (
                <div
                  key={player.rank}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                                        ${isMe
                      ? `${colors.highlight} border`
                      : player.rank <= 3
                        ? "bg-yellow-500/15 hover:bg-accent"
                        : "hover:bg-accent"
                    }`}
                >
                  <div className="w-7 text-center">
                    {getRankIcon(player.rank)}
                  </div>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer group">
                    {(
                      isMe
                        ? getCurrentUserAvatar() || player.user?.avatar_url
                        : player.user?.avatar_url
                    ) ? (
                      <img
                        src={
                          isMe
                            ? getCurrentUserAvatar() || player.user.avatar_url
                            : player.user.avatar_url
                        }
                        alt={player.user.username || "User"}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-165"
                      />
                    ) : (
                      <User className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:scale-165" />
                    )}
                  </div>
                  <span
                    className={`flex-1 text-sm font-medium truncate ${isMe ? colors.text : "text-foreground"}`}
                  >
                    {isMe
                      ? getCurrentUserName()
                      : player.user?.username ||
                      player.user?.full_name ||
                      "Unknown"}
                    {isMe && (
                      <span className="ml-1 text-xs opacity-75">(Bạn)</span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-semibold ${isMe ? colors.text : "text-muted-foreground"}`}
                  >
                    {(player.stats?.total_score || 0).toLocaleString()}
                  </span>
                </div>
              );
            })}

            {/* Current User - shown below if not in top rankings */}
            {myRanking && !isMyRankInList() && (
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r ${colors.bg} to-transparent border ${colors.border} mt-2`}
              >
                <div className="w-7 text-center">
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {myRanking.rank}.
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 cursor-pointer group">
                  {getCurrentUserAvatar() || myRanking.user?.avatar_url ? (
                    <img
                      src={getCurrentUserAvatar() || myRanking.user.avatar_url}
                      alt={myRanking.user?.username || "You"}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-125"
                    />
                  ) : (
                    <User
                      className={`w-4 h-4 ${colors.text} transition-transform duration-200 group-hover:scale-125`}
                    />
                  )}
                </div>
                <span className={`flex-1 text-sm font-medium ${colors.text}`}>
                  {getCurrentUserName()}
                  <span className="ml-1 text-xs opacity-75">(Bạn)</span>
                </span>
                <span className={`text-sm font-semibold ${colors.text}`}>
                  {(myRanking.stats?.total_score || 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <button
            className={`w-full py-3 mt-2 bg-transparent border-none ${colors.text} text-sm font-medium cursor-pointer ${colors.hover} transition-colors`}
            onClick={() => navigate("/ranking")}
          >
            Xem tất cả
          </button>
        </>
      )}
    </div>
  );
};

export default GameRankings;
