import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";
import { getInitials } from "@/utils/Username";

const getRankIcon = (rank) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange-500" />;
  return <Star className="w-4 h-4 text-muted-foreground" />;
};

const getRankBg = (rank) => {
  if (rank === 1)
    return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
  if (rank === 2)
    return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/20";
  if (rank === 3)
    return "bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20";
  return "bg-card border-border";
};

const TopPlayersTable = ({
  title = "Top Players",
  description,
  players = [],
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {players.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No players data available
              </p>
            ) : (
              players.map((player, index) => (
                <motion.div
                  key={player.user_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all hover:shadow-md",
                    getRankBg(index + 1),
                  )}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.username}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {getInitials(player.username) || "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {player.username || "Unknown Player"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.win_rate?.toFixed(1) || 0}% win rate
                    </p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-foreground">
                      {player.total_wins}/{player.total_games}{" "}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Wins/Games
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopPlayersTable;
