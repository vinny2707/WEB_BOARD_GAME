import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeProvider";
import { Spinner } from "@/components/ui/spinner";
import { Pagination } from "@/components/ui/pagination";
import api from "@/api/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trophy, Plus, Edit2, Trash2, Search } from "lucide-react";

const CATEGORIES = [
  { value: "beginner", label: "🌱 Beginner", color: "bg-green-500/20 text-green-400" },
  { value: "expert", label: "⭐ Expert", color: "bg-purple-500/20 text-purple-400" },
  { value: "social", label: "👥 Social", color: "bg-blue-500/20 text-blue-400" },
  { value: "special", label: "🎯 Special", color: "bg-amber-500/20 text-amber-400" },
];

// Criteria types from backend constants
const CRITERIA_TYPES = [
  { value: "total_games", label: "Total Games Played" },
  { value: "total_wins", label: "Total Wins" },
  { value: "game_wins", label: "Game Wins (specific game)" },
  { value: "high_score", label: "High Score" },
  { value: "win_streak", label: "Win Streak" },
  { value: "win_time", label: "Win Time" },
  { value: "time_challenge", label: "Time Challenge" },
  { value: "play_time", label: "Play Time" },
  { value: "friend_count", label: "Friend Count" },
  { value: "messages_sent", label: "Messages Sent" },
  { value: "global_rank", label: "Global Rank" },
  { value: "all_games_won", label: "All Games Won" },
  { value: "combo_streak", label: "Combo Streak" },
  { value: "perfect_game", label: "Perfect Game" },
  { value: "comeback_win", label: "Comeback Win" },
];

// Game types from backend constants
const GAME_TYPES = [
  { value: "caro_5", label: "Caro 5" },
  { value: "caro_4", label: "Caro 4" },
  { value: "tictactoe", label: "Tic Tac Toe" },
  { value: "snake", label: "Snake" },
  { value: "match3", label: "Match 3" },
  { value: "memory_cards", label: "Memory Cards" },
  { value: "drawing_board", label: "Drawing Board" },
];

const AchievementManagement = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // create | edit
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🏆",
    category: "beginner",
    points: 10,
    unlock_criteria: {},
  });

  // Fetch achievements
  const fetchAchievements = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit, sortBy: "category", sortOrder: "asc" };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await api.get("/api/achievements", { params });
      const data = response.data.data;
      setAchievements(data.achievements || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [limit, categoryFilter]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAchievements(1);
  };

  // Open create dialog
  const handleCreate = () => {
    setFormData({ name: "", description: "", icon: "🏆", category: "beginner", points: 10, unlock_criteria: {} });
    setDialogMode("create");
    setShowDialog(true);
  };

  // Open edit dialog - fetch full detail with unlock_criteria
  const handleEdit = async (achievement) => {
    try {
      // Fetch full achievement detail including unlock_criteria
      const response = await api.get(`/api/achievements/${achievement.id}`);
      const fullAchievement = response.data.data;
      
      setSelectedAchievement(fullAchievement);
      setFormData({
        name: fullAchievement.name,
        description: fullAchievement.description,
        icon: fullAchievement.icon,
        category: fullAchievement.category,
        points: fullAchievement.points,
        unlock_criteria: fullAchievement.unlock_criteria || {},
      });
      setDialogMode("edit");
      setShowDialog(true);
    } catch (error) {
      console.error("Error fetching achievement detail:", error);
      toast.error("Failed to load achievement detail");
    }
  };

  // Handle delete
  const handleDelete = (achievement) => {
    setAchievementToDelete(achievement);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await api.delete(`/api/achievements/${achievementToDelete.id}`);
      toast.success("Achievement deleted successfully");
      setShowDeleteDialog(false);
      fetchAchievements(pagination.page);
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogMode === "create") {
        await api.post("/api/achievements", formData);
        toast.success("Achievement created successfully");
      } else {
        await api.put(`/api/achievements/${selectedAchievement.id}`, formData);
        toast.success("Achievement updated successfully");
      }
      setShowDialog(false);
      fetchAchievements(pagination.page);
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error(error.response?.data?.message || "Failed to save achievement");
    }
  };

  const getCategoryBadge = (category) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat : { label: category, color: "bg-gray-500/20 text-gray-400" };
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Achievement Management
          </h1>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Achievement
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </form>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border text-sm bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Trophy className="w-16 h-16 mb-4 opacity-50" />
            <p>No achievements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Icon</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Points</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((achievement) => {
                  const catBadge = getCategoryBadge(achievement.category);
                  return (
                    <tr
                      key={achievement.id}
                      onClick={() => handleEdit(achievement)}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-2xl">{achievement.icon}</td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {achievement.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-xs truncate">
                        {achievement.description}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${catBadge.color}`}>
                          {catBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-500">
                        +{achievement.points}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(achievement)}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-500 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement)}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - inside scroll area */}
        {!loading && achievements.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={limit}
              onPageChange={(page) => fetchAchievements(page)}
              onLimitChange={setLimit}
              limitOptions={[10, 20, 50, 100]}
            />
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create Achievement" : "Edit Achievement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none text-center text-2xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Points
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            {/* Unlock Criteria - Structured Form */}
            <div className="space-y-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Unlock Criteria
              </label>
              
              {/* Type Dropdown */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Type *</label>
                <select
                  value={formData.unlock_criteria?.type || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    unlock_criteria: { ...formData.unlock_criteria, type: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-lg border bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none cursor-pointer"
                >
                  <option value="">Select type...</option>
                  {CRITERIA_TYPES.map(ct => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>

              {/* Game Type Multi-select */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Game Types</label>
                <div className="flex flex-wrap gap-2">
                  {GAME_TYPES.map(gt => (
                    <label key={gt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.unlock_criteria?.game_type || []).includes(gt.value)}
                        onChange={(e) => {
                          const current = formData.unlock_criteria?.game_type || [];
                          const updated = e.target.checked
                            ? [...current, gt.value]
                            : current.filter(g => g !== gt.value);
                          setFormData({
                            ...formData,
                            unlock_criteria: { ...formData.unlock_criteria, game_type: updated }
                          });
                        }}
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{gt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required Count */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Required Count</label>
                <input
                  type="number"
                  value={formData.unlock_criteria?.required_count || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    unlock_criteria: { ...formData.unlock_criteria, required_count: parseInt(e.target.value) || 0 }
                  })}
                  min={0}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 rounded-lg border bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Criteria Description</label>
                <input
                  type="text"
                  value={formData.unlock_criteria?.description || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    unlock_criteria: { ...formData.unlock_criteria, description: e.target.value }
                  })}
                  placeholder="e.g. Win 30 games of Memory Cards"
                  className="w-full px-3 py-2 rounded-lg border bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
              >
                {dialogMode === "create" ? "Create" : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Achievement</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to delete "{achievementToDelete?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementManagement;
