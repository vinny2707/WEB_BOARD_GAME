import React, { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3,
  Users,
  Gamepad2,
  Activity,
  TrendingUp,
  RefreshCw,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useOverviewStats,
  useHotGames,
  useUserStatistics,
} from "@/hooks/useStatistics";
import {
  StatCard,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  HotGameCard,
  TopPlayersTable,
  DateRangePicker,
  SkeletonCard,
  SkeletonChart,
  SkeletonList,
  ErrorState,
  EmptyState,
} from "../components";

const Statistics = () => {
  // Date range state - default to last 7 days
  const [dateRange, setDateRange] = useState(() => ({
    from_date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    to_date: format(new Date(), "yyyy-MM-dd"),
  }));

  // Fetch data using custom hooks
  const {
    data: overviewData,
    loading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useOverviewStats(dateRange);

  const {
    data: hotGames,
    loading: hotGamesLoading,
    error: hotGamesError,
    period: hotGamesPeriod,
    refetch: refetchHotGames,
  } = useHotGames({ ...dateRange, limit: 10 });

  const {
    data: userStats,
    loading: userStatsLoading,
    error: userStatsError,
    refetch: refetchUserStats,
  } = useUserStatistics(dateRange);

  // Refresh all data
  const handleRefresh = () => {
    refetchOverview();
    refetchHotGames();
    refetchUserStats();
  };

  // Prepare chart data
  const registrationTrendData = useMemo(() => {
    if (!userStats?.registration_trend) return [];
    return userStats.registration_trend.map((item) => ({
      date: format(new Date(item.date), "MMM d"),
      users: item.count || item.users || 0,
    }));
  }, [userStats]);

  const sessionsTrendData = useMemo(() => {
    if (!overviewData?.sessions_trend) return [];
    return overviewData.sessions_trend.map((item) => ({
      date: format(new Date(item.date), "MMM d"),
      sessions: item.sessions || item.count || 0,
      completed: item.completed || 0,
    }));
  }, [overviewData]);

  const gameDistributionData = useMemo(() => {
    if (!hotGames || hotGames.length === 0) return [];
    return hotGames.slice(0, 5).map((game) => ({
      name: game.game_name,
      value: game.stats?.total_sessions || 0,
    }));
  }, [hotGames]);

  // Calculate stats for overview cards
  const overviewCards = useMemo(() => {
    const users = overviewData?.users || {};
    const sessions = overviewData?.sessions || {};
    const games = overviewData?.games || {};

    return [
      {
        title: "Total Users",
        value: users.total || 0,
        trend: users.growth?.startsWith("+")
          ? "up"
          : users.growth?.startsWith("-")
            ? "down"
            : null,
        trendValue: users.growth,
        description: `${users.new || 0} new this period`,
        icon: "users",
      },
      {
        title: "Active Users",
        value: users.active || 0,
        description: "Users with activity",
        icon: "activity",
      },
      {
        title: "Total Sessions",
        value: sessions.total || 0,
        trend: sessions.growth?.startsWith("+")
          ? "up"
          : sessions.growth?.startsWith("-")
            ? "down"
            : null,
        trendValue: sessions.growth,
        description: `${sessions.completed || 0} completed`,
        icon: "games",
      },
      {
        title: "Completion Rate",
        value: `${sessions.completion_rate?.toFixed(1) || 0}%`,
        description: "Sessions completed",
        icon: "target",
      },
      {
        title: "Total Games",
        value: games.total || 0,
        description: `${games.enabled || 0} enabled`,
        icon: "games",
      },
      {
        title: "Most Popular",
        value: games.most_popular?.name || "N/A",
        description: `${games.most_popular?.sessions || 0} sessions`,
        icon: "trophy",
      },
    ];
  }, [overviewData]);

  const userOverviewCards = useMemo(() => {
    const overview = userStats?.overview || {};
    return [
      {
        title: "Total Users",
        value: overview.total_users || 0,
        icon: "users",
      },
      {
        title: "New Users",
        value: overview.new_users || 0,
        description: "This period",
        icon: "users",
      },
      {
        title: "Active Users",
        value: overview.active_users || 0,
        icon: "activity",
      },
      {
        title: "Retention Rate",
        value: `${overview.retention_rate?.toFixed(1) || 0}%`,
        icon: "target",
      },
    ];
  }, [userStats]);

  const isLoading = overviewLoading || hotGamesLoading || userStatsLoading;
  const hasError = overviewError || hotGamesError || userStatsError;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Statistics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Analytics overview for your gaming platform
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {hasError ? (
            <ErrorState
              message="Failed to load statistics. Please try again."
              onRetry={handleRefresh}
            />
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="flex items-center gap-2 cursor-pointer">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Games</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 cursor-pointer">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overviewLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))
                    : overviewCards.map((card, index) => (
                        <StatCard key={card.title} {...card} delay={index} className="w-full h-full" />
                      ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {overviewLoading ? (
                    <>
                      <SkeletonChart height={300} />
                      <SkeletonChart height={300} />
                    </>
                  ) : (
                    <>
                      <AreaChartComponent
                        title="Sessions Trend"
                        description="Daily sessions over the selected period"
                        data={sessionsTrendData}
                        dataKey="sessions"
                        secondaryDataKey="completed"
                        color="var(--chart-1)"
                        secondaryColor="var(--chart-2)"
                        height={300}
                      />
                      <PieChartComponent
                        title="Game Distribution"
                        description="Sessions by game (Top 5)"
                        data={gameDistributionData}
                        height={300}
                        innerRadius={70}
                        outerRadius={110}
                      />
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Games Tab */}
              <TabsContent value="games" className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Hot Games
                  </h2>
                  {hotGamesPeriod && (
                    <span className="text-sm text-muted-foreground">
                      ({hotGamesPeriod})
                    </span>
                  )}
                </div>

                {hotGamesLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : hotGames.length === 0 ? (
                  <EmptyState
                    title="No games data"
                    description="There are no games with activity in the selected period."
                    icon="🎮"
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {hotGames.map((game, index) => (
                      <HotGameCard
                        key={game.game_id}
                        rank={index + 1}
                        game={game}
                        delay={index}
                      />
                    ))}
                  </div>
                )}

                {/* Game Sessions Chart */}
                {!hotGamesLoading && hotGames.length > 0 && (
                  <BarChartComponent
                    title="Sessions by Game"
                    description="Total sessions per game"
                    data={hotGames.slice(0, 10).map((g) => ({
                      name:
                        g.game_name?.length > 15
                          ? g.game_name.substring(0, 15) + "..."
                          : g.game_name,
                      sessions: g.stats?.total_sessions || 0,
                    }))}
                    dataKey="sessions"
                    useMultipleColors
                    height={350}
                  />
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                {/* User Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userStatsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={i} />
                      ))
                    : userOverviewCards.map((card, index) => (
                        <StatCard key={card.title} {...card} delay={index} className="w-full h-full"/>
                      ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Registration Trend */}
                  {userStatsLoading ? (
                    <SkeletonChart height={300} />
                  ) : (
                    <AreaChartComponent
                      title="Registration Trend"
                      description="New user registrations over time"
                      data={registrationTrendData}
                      dataKey="users"
                      color="var(--chart-3)"
                      height={300}
                    />
                  )}

                  {/* Top Players */}
                  {userStatsLoading ? (
                    <SkeletonList items={5} />
                  ) : (
                    <TopPlayersTable
                      title="Top Players"
                      description="Players with highest scores"
                      players={userStats?.top_players || []}
                    />
                  )}
                </div>

                {/* Activity by Day */}
                {!userStatsLoading && userStats?.activity_by_day && (
                  <BarChartComponent
                    title="Activity by Day of Week"
                    description="User activity distribution across days"
                    data={userStats.activity_by_day}
                    dataKey="sessions"
                    xAxisKey="day"
                    useMultipleColors
                    height={280}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Statistics;
