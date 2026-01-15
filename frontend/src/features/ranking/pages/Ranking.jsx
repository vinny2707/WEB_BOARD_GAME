import React from "react";
import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { useTheme } from "@/contexts/ThemeProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { getInitials } from "@/utils/Username";

const Ranking = () => {
  const [scopeTab, setScopeTab] = useState("global");
  const [gameFilter, setGameFilter] = useState("Caro5");
  const { theme } = useTheme();

  // Mock data
  const globalPlayers = [
    {
      id: 1,
      username: "Alice",
      win_rate: 92,
      total_score: 1500,
      best_score: 300,
    },
    {
      id: 2,
      username: "Bob",
      win_rate: 89,
      total_score: 1400,
      best_score: 280,
    },
    {
      id: 3,
      username: "Charlie",
      win_rate: 85,
      total_score: 1300,
      best_score: 270,
    },
    {
      id: 4,
      username: "David",
      win_rate: 80,
      total_score: 1200,
      best_score: 260,
    },
    {
      id: 5,
      username: "Eve",
      win_rate: 78,
      total_score: 1100,
      best_score: 250,
    },
  ];
  const friendsPlayers = [
    {
      id: 1,
      username: "Frank",
      win_rate: 88,
      total_score: 1250,
      best_score: 275,
    },
    {
      id: 2,
      username: "Grace",
      win_rate: 82,
      total_score: 1150,
      best_score: 265,
    },
    {
      id: 3,
      username: "Heidi",
      win_rate: 79,
      total_score: 1050,
      best_score: 240,
    },
  ];
  const myPersonalStats = {
    win_rate: 75,
    total_score: 1000,
    best_score: 2400,
    global_rank: 250,
  };

  const games = [
    "Caro5",
    "Caro4",
    "TicTacToe",
    "Snake",
    "Match-3",
    "Memory Game",
    "Drawing Canvas",
  ];

  const getTrophyColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-700";
      default:
        return "";
    }
  };

  const getRowHighlight = (rank) => {
    switch (rank) {
      case 1:
        return theme === "dark"
          ? "bg-yellow-500/10 border-l-4 border-yellow-500"
          : "bg-yellow-50 border-l-4 border-yellow-500";
      case 2:
        return theme === "dark"
          ? "bg-gray-500/10 border-l-4 border-gray-400"
          : "bg-gray-50 border-l-4 border-gray-400";
      case 3:
        return theme === "dark"
          ? "bg-amber-700/10 border-l-4 border-amber-700"
          : "bg-amber-50 border-l-4 border-amber-700";
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex-1 p-6 flex justify-center items-start dark:bg-zinc-900/50">
      <div className="w-full flex flex-col gap-2">
        {/* Game Filter */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-500/20">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </div>
            <h1 className="text-xl sm:text-2xl dark:text-white text-gray-900">
              Hall of Fame
            </h1>
          </div>

          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:ring-emerald-500">
              <SelectValue placeholder="Select game" />
            </SelectTrigger>

            <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
              {games.map((game) => (
                <SelectItem
                  key={game}
                  value={game}
                  className="dark:text-zinc-300 dark:focus:bg-zinc-700 dark:focus:text-white cursor-pointer"
                >
                  {game}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scope Tabs */}
        <div className="flex gap-1 sm:gap-2 p-1 rounded-xl bg-gray-100 dark:bg-zinc-800/50">
          <button
            onClick={() => setScopeTab("global")}
            className={`flex-1 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-base rounded-lg transition-all cursor-pointer ${
              scopeTab === "global"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Global System
          </button>
          <button
            onClick={() => setScopeTab("friends")}
            className={`flex-1 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-base rounded-lg transition-all cursor-pointer ${
              scopeTab === "friends"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Friends Only
          </button>
          <button
            onClick={() => setScopeTab("personal")}
            className={`flex-1 py-2 px-2 sm:py-3 sm:px-4 text-xs sm:text-base rounded-lg transition-all cursor-pointer ${
              scopeTab === "personal"
                ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg"
                : theme === "dark"
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            My Personal Stats
          </button>
        </div>

        <hr className="my-4 border-gray-300 dark:border-zinc-700" />

        {/* Ranking Table */}
        {scopeTab === "global" && (
          <>
            {/* Desktop Table View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Best Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalPlayers.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={getRowHighlight(index + 1)}
                  >
                    <TableCell className="font-medium">
                      {index + 1 === 1 || index + 1 === 2 || index + 1 === 3 ? (
                        <div className="flex items-center gap-2">
                          <Trophy
                            className={`w-5 h-5 ${getTrophyColor(index + 1)}`}
                          />
                          #{index + 1}
                        </div>
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-amber-600 to-amber-800"
                              : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                          } flex items-center justify-center text-white shadow-lg`}
                        >
                          {getInitials(player.username)}
                        </div>
                        {player.username}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={player.win_rate}
                          className="w-20 bg-zinc-200 dark:bg-zinc-700 [&>*]:bg-emerald-500"
                        />
                        {`${player.win_rate}%`}
                      </div>
                    </TableCell>

                    <TableCell>{player.total_score}</TableCell>

                    <TableCell>{player.best_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {globalPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 ${
                    index === 0
                      ? "bg-yellow-500/10 border-yellow-500"
                      : index === 1
                      ? "bg-gray-500/10 border-gray-400"
                      : index === 2
                      ? "bg-amber-700/10 border-amber-700"
                      : theme === "dark"
                      ? "bg-zinc-800/50 border-zinc-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500"
                            : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-800"
                            : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                        } flex items-center justify-center text-white shadow-lg text-sm`}
                      >
                        {getInitials(player.username)}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white text-gray-900">
                          {player.username}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                          {index + 1 <= 3 && (
                            <Trophy
                              className={`w-4 h-4 ${getTrophyColor(index + 1)}`}
                            />
                          )}
                          <span>Rank #{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Win Rate
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={player.win_rate}
                          className="w-20 bg-zinc-200 dark:bg-zinc-700 [&>*]:bg-emerald-500"
                        />
                        <span className="text-sm dark:text-white text-gray-900">
                          {player.win_rate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Total Score
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-900">
                        {player.total_score}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Best Score
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-900">
                        {player.best_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {scopeTab === "friends" && (
          <>
            {/* Desktop Table View */}
            <Table className="hidden md:table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Best Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {friendsPlayers.map((player, index) => (
                  <TableRow
                    key={player.id}
                    className={getRowHighlight(index + 1)}
                  >
                    <TableCell className="font-medium">
                      {index + 1 === 1 || index + 1 === 2 || index + 1 === 3 ? (
                        <div className="flex items-center gap-2">
                          <Trophy
                            className={`w-5 h-5 ${getTrophyColor(index + 1)}`}
                          />
                          #{index + 1}
                        </div>
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-500"
                              : index === 2
                              ? "bg-gradient-to-br from-amber-600 to-amber-800"
                              : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                          } flex items-center justify-center text-white shadow-lg`}
                        >
                          {getInitials(player.username)}
                        </div>
                        {player.username}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={player.win_rate}
                          className="w-20 bg-zinc-200 dark:bg-zinc-700 [&>*]:bg-emerald-500"
                        />
                        {`${player.win_rate}%`}
                      </div>
                    </TableCell>

                    <TableCell>{player.total_score}</TableCell>

                    <TableCell>{player.best_score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {friendsPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border-2 ${
                    index === 0
                      ? "bg-yellow-500/10 border-yellow-500"
                      : index === 1
                      ? "bg-gray-500/10 border-gray-400"
                      : index === 2
                      ? "bg-amber-700/10 border-amber-700"
                      : theme === "dark"
                      ? "bg-zinc-800/50 border-zinc-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-br from-gray-300 to-gray-500"
                            : index === 2
                            ? "bg-gradient-to-br from-amber-600 to-amber-800"
                            : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                        } flex items-center justify-center text-white shadow-lg text-sm`}
                      >
                        {getInitials(player.username)}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white text-gray-900">
                          {player.username}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                          {index + 1 <= 3 && (
                            <Trophy
                              className={`w-4 h-4 ${getTrophyColor(index + 1)}`}
                            />
                          )}
                          <span>Rank #{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Win Rate
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={player.win_rate}
                          className="w-20 bg-zinc-200 dark:bg-zinc-700 [&>*]:bg-emerald-500"
                        />
                        <span className="text-sm dark:text-white text-gray-900">
                          {player.win_rate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Total Score
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-900">
                        {player.total_score}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-zinc-400">
                        Best Score
                      </span>
                      <span className="text-sm font-medium dark:text-white text-gray-900">
                        {player.best_score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {scopeTab === "personal" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
              <p className="text-sm mb-2 text-gray-600 dark:text-zinc-400">
                Win Rate
              </p>
              <div className="w-full flex justify-center items-center">
                <AnimatedCircularProgressBar
                  value={myPersonalStats.win_rate}
                  max={100}
                  min={0}
                  gaugePrimaryColor="rgb(16 185 129)"
                  gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                  className="w-20 h-20"
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
              <p className="text-sm mb-2 text-gray-600 dark:text-zinc-400">
                Total Score
              </p>
              <NumberTicker
                value={myPersonalStats.total_score}
                className="text-3xl dark:text-white text-gray-900"
              />
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
              <p className="text-sm mb-2 text-gray-600 dark:text-zinc-400">
                Best Score
              </p>
              <NumberTicker
                value={myPersonalStats.best_score}
                className="text-3xl dark:text-white text-gray-900"
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50">
              <p className="text-sm mb-2 text-gray-600 dark:text-zinc-400">
                Global Rank
              </p>
              <NumberTicker
                value={myPersonalStats.global_rank}
                className="text-3xl dark:text-white text-gray-900"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ranking;
