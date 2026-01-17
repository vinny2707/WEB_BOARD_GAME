import React, { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Crown,
  Users,
  User,
} from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { getInitials } from "@/utils/Username";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/contexts/UserProvider";

export default function Ranking() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [scope, setScope] = useState("global");
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const itemsPerPage = 10;
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex-1 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">
            Bạn chưa đăng nhập
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Vui lòng đăng nhập để xem danh sách xếp hạng
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch games list
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get("/api/games");
        const gamesList = response.data.data.games || [];
        setGames(gamesList);
        if (gamesList.length > 0) {
          setSelectedGame(gamesList[0].id);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        toast.error("Failed to load games");
      }
    };
    fetchGames();
  }, []);

  // Fetch rankings when game or scope changes
  useEffect(() => {
    if (selectedGame) {
      fetchRankings(1);
      fetchMyRanking();
    }
  }, [selectedGame, scope]);

  // Fetch rankings
  const fetchRankings = async (page = 1) => {
    if (!selectedGame) return;

    setLoading(true);
    try {
      const response = await api.get(`/api/rankings/game/${selectedGame}`, {
        params: { scope, page, limit: itemsPerPage },
      });
      setRankings(response.data.data || []);
      setPagination({
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Failed to load rankings");
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user's ranking
  const fetchMyRanking = async () => {
    if (!selectedGame) return;

    try {
      const response = await api.get(`/api/rankings/game/${selectedGame}/me`);
      setMyRanking(response.data.data || null);
    } catch (error) {
      console.error("Error fetching my ranking:", error);
      setMyRanking(null);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchRankings(newPage);
  };

  // Get trophy/medal icon based on rank
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
            #{rank}
          </span>
        );
    }
  };

  // Get rank styling
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-600";
      default:
        return "bg-gradient-to-r from-emerald-500 to-cyan-500";
    }
  };

  const scopeOptions = [
    {
      value: "global",
      label: "Global",
      icon: TrendingUp,
      description: "All players",
    },
    {
      value: "friends",
      label: "Friends",
      icon: Users,
      description: "Friends only",
    },
  ];

  const currentScopeOption = scopeOptions.find((opt) => opt.value === scope);

  return (
    <div className="w-full flex-1 p-4 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="w-full bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-2xl p-4 sm:p-6 border shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold dark:text-white">
                Rankings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Compete and climb the leaderboard
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Game Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Select Game
              </label>
              <Select
                value={selectedGame?.toString()}
                onValueChange={(val) => setSelectedGame(parseInt(val))}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue placeholder="Choose a game" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  {games.map((game) => (
                    <SelectItem
                      key={game.id}
                      value={game.id.toString()}
                      className="dark:hover:bg-slate-700 cursor-pointer"
                    >
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scope Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Ranking Scope
              </label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 dark:border-slate-600">
                  <SelectValue placeholder="Choose scope" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  {scopeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="dark:hover:bg-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* My Ranking Card */}
      {myRanking && (
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold opacity-90 mb-1">Your Ranking</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">#{myRanking.rank}</span>
                <div className="text-sm">
                  <p>Top {myRanking.percentile}%</p>
                  <p className="opacity-90">
                    {myRanking.total_players} players
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-2">Win Rate</p>
              <div className="text-3xl font-bold">
                {myRanking.stats?.win_rate?.toFixed(1)}%
              </div>
              <Progress
                value={myRanking.stats?.win_rate || 0}
                className="mt-2 h-2 bg-white/30"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs opacity-75">Games</p>
              <p className="text-xl font-semibold">
                {myRanking.stats?.total_games || 0}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-75">Wins</p>
              <p className="text-xl font-semibold">
                {myRanking.stats?.total_wins || 0}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-75">Total Score</p>
              <p className="text-xl font-semibold">
                {myRanking.stats?.total_score || 0}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-75">Best Score</p>
              <p className="text-xl font-semibold">
                {myRanking.stats?.best_score || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700 rounded-2xl border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentScopeOption && (
                <currentScopeOption.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <h2 className="text-xl font-semibold dark:text-white">
                {currentScopeOption?.label} Leaderboard
              </h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.total} {pagination.total === 1 ? "player" : "players"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Loading rankings...
              </p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No rankings available yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((ranking) => (
                <div
                  key={ranking.rank}
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                      {getRankIcon(ranking.rank)}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full ${getRankStyle(
                          ranking.rank
                        )} flex items-center justify-center text-white font-semibold overflow-hidden`}
                      >
                        {ranking.user?.avatar_url ? (
                          <img
                            src={ranking.user.avatar_url}
                            alt={ranking.user.username}
                            className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-[1.65]"
                          />
                        ) : (
                          <span>{getInitials(ranking.user?.full_name)}</span>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {ranking.user?.full_name || ranking.user?.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{ranking.user?.username}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Win Rate
                        </p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {ranking.stats?.win_rate?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Games
                        </p>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {ranking.stats?.total_games || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Score
                        </p>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {ranking.stats?.total_score || 0}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Best
                        </p>
                        <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                          {ranking.stats?.best_score || 0}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="sm:hidden flex flex-col items-end">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {ranking.stats?.win_rate?.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ranking.stats?.total_games} games
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pagination - Outside card */}
      {rankings.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            limit={itemsPerPage}
            onPageChange={handlePageChange}
            limitOptions={[10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
