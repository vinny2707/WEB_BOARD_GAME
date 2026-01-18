import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Flame, TrendingUp, Users, Clock, Target } from "lucide-react";

const HotGameCard = ({ rank, game, delay = 0, className = "" }) => {
  const { game_name, game_type, game_icon, stats } = game;

  const getRankColor = () => {
    if (rank === 1) return "from-yellow-500 to-amber-500";
    if (rank === 2) return "from-gray-400 to-gray-500";
    if (rank === 3) return "from-orange-500 to-orange-600";
    return "from-primary/50 to-primary";
  };

  const getRankBadge = () => {
    if (rank <= 3) {
      return (
        <div
          className={cn(
            "absolute -top-1 -left-1 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-gradient-to-br text-white font-bold text-sm shadow-lg",
            getRankColor(),
          )}
        >
          {rank}
        </div>
      );
    }
    return (
      <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground font-bold text-sm">
        {rank}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative"
    >
      <Card className={cn("relative overflow-hidden", className)}>
        {getRankBadge()}

        <CardContent className="pt-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Game Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden text-xl">
              {game_icon ? <span >{game_icon}</span> : (
                <Flame className="w-7 h-7 text-primary" />
              )}
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {game_name}
              </h3>
              <p className="text-sm text-muted-foreground capitalize">
                {game_type}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-muted-foreground">
                    {stats?.unique_players?.toLocaleString() || 0} players
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Target className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-muted-foreground">
                    {stats?.total_sessions?.toLocaleString() || 0} sessions
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-muted-foreground">
                    {stats?.avg_time_elapsed
                      ? `${Math.round(stats.avg_time_elapsed / 60)}m avg`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                  <span
                    className={cn(
                      stats?.trend?.startsWith("+")
                        ? "text-green-500"
                        : stats?.trend?.startsWith("-")
                          ? "text-red-500"
                          : "text-muted-foreground",
                    )}
                  >
                    {stats?.trend || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl font-bold text-primary">
                {stats?.completion_rate?.toFixed(0) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HotGameCard;
