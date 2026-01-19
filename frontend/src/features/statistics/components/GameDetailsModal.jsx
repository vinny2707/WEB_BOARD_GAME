import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "motion/react";
import {
  X,
  Users,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Gamepad2,
} from "lucide-react";
import {
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  StatCard,
  TopPlayersTable,
  LoadingState,
  ErrorState,
} from "./index";
import { format, parseISO } from "date-fns";

const GameDetailsModal = ({ isOpen, onClose, gameData, loading, error }) => {
  if (!isOpen) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto">
          <LoadingState />
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[85vw] max-h-[90vh] overflow-y-auto">
          <ErrorState message={error} onRetry={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  if (!gameData) return null;

  const { game, overview, difficulty_stats, daily_trend, top_players } =
    gameData;

  // Prepare daily trend data
  const dailyTrendData =
    daily_trend?.map((item) => ({
      date: format(parseISO(item.date), "MMM d"),
      sessions: item.sessions || 0,
      players: item.unique_players || 0,
    })) || [];

  // Prepare difficulty data
  const difficultyData = difficulty_stats
    ? Object.entries(difficulty_stats).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        sessions: value.sessions || 0,
        avg_score: value.avg_score || 0,
        completion_rate: value.completion_rate || 0,
      }))
    : [];

  const overviewCards = [
    {
      title: "Total Sessions",
      value: overview?.total_sessions || 0,
      icon: "games",
      description: "Total games played",
    },
    {
      title: "Unique Players",
      value: overview?.unique_players || 0,
      icon: "users",
      description: "Different players",
    },
    {
      title: "Completion Rate",
      value: `${overview?.completion_rate?.toFixed(1) || 0}%`,
      icon: "target",
      description: `${overview?.completed_sessions || 0} completed`,
    },
    {
      title: "Average Score",
      value: overview?.avg_score || 0,
      icon: "trophy",
      description: "Avg player score",
    },
    {
      title: "Avg Time",
      value: overview?.avg_time_elapsed
        ? `${Math.round(overview.avg_time_elapsed / 60)}m`
        : "N/A",
      icon: "clock",
      description: "Average duration",
    },
    {
      title: "Avg Moves",
      value: overview?.avg_moves || 0,
      icon: "activity",
      description: "Average moves",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] min-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {game?.icon && (
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl overflow-hidden">
                {typeof game.icon === 'string' && (game.icon.startsWith('http') || game.icon.startsWith('/')) ? (
                  <>
                    <img
                      src={game.icon}
                      alt={game?.name || 'Game Icon'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="absolute inset-x-1 bottom-1 text-[10px] leading-3 text-muted-foreground bg-background/60 rounded px-0.5 truncate">
                      {game.icon}
                    </span>
                  </>
                ) : (
                  <span className="truncate max-w-[60px] break-all">{game.icon}</span>
                )}
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                {game?.name || "Game Statistics"}
              </DialogTitle>
              <DialogDescription className="text-base capitalize">
                Detailed Analytics
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 mt-4"
        >
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {overviewCards.map((card, index) => (
              <StatCard
                key={card.title}
                {...card}
                delay={index * 0.05}
                className="w-full h-full"
              />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Trend */}
            {dailyTrendData.length > 0 && (
              <AreaChartComponent
                title="Daily Activity"
                description="Sessions and players over time"
                data={dailyTrendData}
                dataKey="sessions"
                secondaryDataKey="players"
                color="var(--chart-1)"
                secondaryColor="var(--chart-2)"
                height={280}
              />
            )}

            {/* Difficulty Stats */}
            {difficultyData.length > 0 && (
              <BarChartComponent
                title="Difficulty Breakdown"
                description="Sessions by difficulty level"
                data={difficultyData}
                dataKey="sessions"
                useMultipleColors
                height={280}
              />
            )}
          </div>

          {/* Additional Charts */}
          {difficultyData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <BarChartComponent
                title="Average Score by Difficulty"
                description="Performance across difficulty levels"
                data={difficultyData}
                dataKey="avg_score"
                useMultipleColors
                height={280}
              />
              <BarChartComponent
                title="Completion Rate by Difficulty"
                description="Success rate across levels"
                data={difficultyData}
                dataKey="completion_rate"
                useMultipleColors
                height={280}
              />
            </div>
          )}

          {/* Top Players */}
          {top_players && top_players.length > 0 && (
            <TopPlayersTable
              title={`Top Players - ${game?.name}`}
              description="Best performing players in this game"
              players={top_players}
            />
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailsModal;
