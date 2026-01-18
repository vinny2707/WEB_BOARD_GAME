import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Gamepad2,
  Trophy,
  Clock,
  Activity,
  Target,
  Star,
} from "lucide-react";

const iconMap = {
  users: Users,
  games: Gamepad2,
  trophy: Trophy,
  clock: Clock,
  activity: Activity,
  target: Target,
  star: Star,
};

const StatCard = ({
  title,
  value,
  description,
  trend,
  trendValue,
  icon = "activity",
  className = "",
  delay = 0,
}) => {
  const Icon = iconMap[icon] || Activity;

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend === "up") return "text-green-500 dark:text-green-400";
    if (trend === "down") return "text-red-500 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn("relative overflow-hidden gap-2", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: delay * 0.1 + 0.2 }}
              className="text-2xl font-bold text-foreground"
            >
              {typeof value === "number" ? value.toLocaleString() : value}
            </motion.span>
            {trendValue && (
              <span
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  getTrendColor(),
                )}
              >
                {getTrendIcon()}
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
