import React, { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Users,
  User,
  Star,
} from "lucide-react";
import api from "@/api/axios";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { getInitials } from "@/utils/Username";
import { useUser } from "@/contexts/UserProvider";
import { Spinner } from "@/components/ui/spinner";

export default function AchievementRanking() {
  const { isAuthenticated, user } = useUser();
  const [scope, setScope] = useState("global");
  const [rankings, setRankings] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [limit, setLimit] = useState(10);

  // Fetch rankings when scope changes
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRankings(1);
    fetchMyRanking();
  }, [scope, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex-1 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold dark:text-white mb-2">
            Bạn chưa đăng nhập
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Vui lòng đăng nhập để xem bảng xếp hạng thành tựu
          </p>
          <a
            href="/auth"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const fetchRankings = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/rankings/achievements", {
        params: { scope, page, limit },
      });
      setRankings(response.data.data || []);
      setPagination({
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching rankings:", error);
      toast.error("Không thể tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRanking = async () => {
    try {
      const response = await api.get("/api/rankings/achievements/me");
      setMyRanking(response.data.data);
    } catch (error) {
      console.error("Error fetching my ranking:", error);
    }
  };

  const handlePageChange = (page) => {
    fetchRankings(page);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-slate-500">{rank}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/30";
    if (rank === 2) return "bg-gradient-to-r from-slate-400/20 to-gray-400/20 border-slate-400/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30";
    return "bg-white dark:bg-slate-800/50";
  };

  return (
    <div className="w-full min-h-screen flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">
            Bảng Xếp Hạng Thành Tựu
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Xếp hạng dựa trên tổng điểm thành tựu đã mở khóa
        </p>
      </div>

      {/* My Ranking Card */}
      {myRanking && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 dark:border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl font-bold group">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-165"
                />
              ) : (
                getInitials(user?.username)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold dark:text-white">
                  {user?.username}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                  Bạn
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Hạng: <strong className="text-amber-500">{myRanking.rank || "N/A"}</strong>
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  Điểm: <strong className="text-emerald-500">{myRanking.achievement_points || 0}</strong>
                </span>
              </div>
            </div>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      )}

      {/* Scope Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setScope("global")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
            scope === "global"
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Global
        </button>
        <button
          onClick={() => setScope("friends")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer ${
            scope === "friends"
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          Friends
        </button>
      </div>

      {/* Rankings List */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-8 h-8 text-amber-500" />
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {scope === "friends"
                ? "Chưa có bạn bè nào có thành tựu"
                : "Chưa có ai có thành tựu"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {rankings.map((entry) => (
              <div
                key={entry.user.id}
                className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  entry.user.id === user?.id ? "bg-amber-50/50 dark:bg-amber-500/5" : ""
                }`}
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getRankBg(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold group">
                  {entry.user.avatar_url ? (
                    <img
                      src={entry.user.avatar_url}
                      alt={entry.user.username}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-165"
                    />
                  ) : (
                    getInitials(entry.user.username)
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold dark:text-white">
                      {entry.user.username}
                    </span>
                    {entry.user.id === user?.id && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                        Bạn
                      </span>
                    )}
                  </div>
                  {entry.user.full_name && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {entry.user.full_name}
                    </p>
                  )}
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-emerald-500">
                    <Award className="w-5 h-5" />
                    {entry.achievement_points}
                  </div>
                  <p className="text-xs text-slate-500">điểm</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination - outside card */}
      {!loading && rankings.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={handlePageChange}
            limit={limit}
            limitOptions={[10, 20, 50, 100]}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              fetchRankings(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
