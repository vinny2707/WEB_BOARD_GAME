import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeProvider";
import { Search, Plus, Edit } from "lucide-react";
import api from "../../../api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Import components
import {
  GameCard,
  GameForm,
  GameDetailDialog,
  GameDeleteDialog,
} from "../components";
import { Pagination } from "@/components/ui/pagination";

const GameConfig = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // State
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [enabledFilter, setEnabledFilter] = useState("");
  const [limit, setLimit] = useState(6); // Default limit 6

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    rows: 3,
    cols: 3,
    enabled: true,
    icon: "",
    rules: "",
    settings: {},
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch games - use current limit state
  const fetchGames = async (page = 1, search = "", enabled = "", itemsPerPage = limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...(enabled !== "" && { enabled }),
      });

      const response = await api.get(`/api/games?${params}`);
      const data = response.data?.data;

      setGames(data.games || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalGames(data.pagination?.total || 0);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error("Error fetching games:", err);
      setError("Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchGames(1, searchTerm, enabledFilter);
  }, []);

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchGames(1, value, enabledFilter);
  };

  // Handle filter
  const handleFilter = (enabled) => {
    setEnabledFilter(enabled);
    setCurrentPage(1);
    fetchGames(1, searchTerm, enabled);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchGames(page, searchTerm, enabledFilter);
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
    fetchGames(1, searchTerm, enabledFilter, newLimit);
  };

  // Handle create game
  const handleCreate = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      rows: 3,
      cols: 3,
      enabled: true,
      icon: "",
      rules: "",
      settings: {},
    });
    setShowCreateDialog(true);
  };

  // Handle edit game
  const handleEdit = async (game) => {
    try {
      const response = await api.get(`/api/games/${game.id}`);
      const gameData = response.data?.data;
      setFormData({
        name: gameData.name || "",
        type: gameData.type || "",
        description: gameData.description || "",
        rows: gameData.rows || 3,
        cols: gameData.cols || 3,
        enabled: gameData.enabled ?? true,
        icon: gameData.icon || "",
        rules: gameData.rules || "",
        settings: gameData.settings || {},
      });
      setSelectedGame(gameData);
      setShowEditDialog(true);
    } catch (err) {
      console.error("Error fetching game details:", err);
      toast.error(err.response?.data?.message || "Failed to load game details");
    }
  };

  // Handle view details
  const handleViewDetails = async (game) => {
    try {
      const response = await api.get(`/api/games/${game.id}`);
      setSelectedGame(response.data?.data);
      setShowDetailDialog(true);
    } catch (err) {
      console.error("Error fetching game details:", err);
      toast.error(err.response?.data?.message || "Failed to load game details");
    }
  };

  // Handle delete
  const handleDelete = (game) => {
    setSelectedGame(game);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedGame) return;

    try {
      await api.delete(`/api/games/${selectedGame.id}`);
      setShowDeleteDialog(false);
      setSelectedGame(null);
      toast.success("Game deleted successfully");
      fetchGames(currentPage, searchTerm, enabledFilter);
    } catch (err) {
      console.error("Error deleting game:", err);
      toast.error(err.response?.data?.message || "Failed to delete game");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (game) => {
    try {
      await api.patch(`/api/games/${game.id}/status`, {
        enabled: !game.enabled,
      });
      toast.success(
        `Game ${game.enabled ? "disabled" : "enabled"} successfully`
      );
      fetchGames(currentPage, searchTerm, enabledFilter);
    } catch (err) {
      console.error("Error toggling game status:", err);
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  // Handle form submit (create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Validate settings is valid JSON
      const submitData = {
        ...formData,
        settings:
          typeof formData.settings === "string"
            ? JSON.parse(formData.settings)
            : formData.settings,
      };

      await api.post("/api/games", submitData);
      toast.success("Game created successfully");
      setShowCreateDialog(false);
      fetchGames(1, searchTerm, enabledFilter);
    } catch (err) {
      console.error("Error creating game:", err);
      toast.error(err.response?.data?.message || "Failed to create game");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle form submit (edit)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGame) return;
    setFormLoading(true);

    try {
      const submitData = {
        ...formData,
        settings:
          typeof formData.settings === "string"
            ? JSON.parse(formData.settings)
            : formData.settings,
      };

      await api.put(`/api/games/${selectedGame.id}`, submitData);
      toast.success("Game updated successfully");
      setShowEditDialog(false);
      setSelectedGame(null);
      fetchGames(currentPage, searchTerm, enabledFilter);
    } catch (err) {
      console.error("Error updating game:", err);
      toast.error(err.response?.data?.message || "Failed to update game");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex-none px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Game Management
            </h1>
            <p
              className={`text-sm mt-1 ${
                isDarkMode ? "text-slate-400" : "text-gray-500"
              }`}
            >
              {totalGames} games total
            </p>
          </div>
          <button
            onClick={handleCreate}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              isDarkMode
                ? "bg-emerald-600 hover:bg-blue-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Game
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-full sm:min-w-64 relative">
            <Search className="absolute left-3 top-2.5 sm:top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base rounded-lg border transition-colors ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                  : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
              } focus:outline-none`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {[
              { value: "", label: "All" },
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilter(filter.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer text-sm whitespace-nowrap ${
                  enabledFilter === filter.value
                    ? isDarkMode
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    : isDarkMode
                    ? "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">{error}</div>
          </div>
        ) : games.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-full gap-4 ${
              isDarkMode ? "text-slate-400" : "text-gray-500"
            }`}
          >
            <div className="text-6xl">🎮</div>
            <p className="text-lg">No games found</p>
            <button
              onClick={handleCreate}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-emerald-600 hover:bg-blue-500 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              Create Game
            </button>
          </div>
        ) : (
          <>
            {/* Card Grid - 3 columns max for larger cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onView={handleViewDetails}
                  onEdit={handleEdit}
                  onToggle={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination - Inside scrollable content */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalGames}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                limitOptions={[6, 12, 18, 24]}
              />
            </div>
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent
          className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-3 text-xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                }`}
              >
                <Plus className="w-5 h-5" />
              </div>
              Create New Game
            </DialogTitle>
          </DialogHeader>
          <GameForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateDialog(false)}
            isEdit={false}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? "bg-slate-800 border-slate-700" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-3 text-xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                }`}
              >
                <Edit className="w-5 h-5" />
              </div>
              Edit Game
            </DialogTitle>
          </DialogHeader>
          <GameForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditDialog(false)}
            isEdit={true}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <GameDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        game={selectedGame}
      />

      {/* Delete Dialog */}
      <GameDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        game={selectedGame}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default GameConfig;
