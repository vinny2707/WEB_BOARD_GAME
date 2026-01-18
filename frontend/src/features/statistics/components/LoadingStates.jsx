import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const LoadingState = ({ className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="mt-4 text-sm text-muted-foreground">
        Loading statistics...
      </p>
    </motion.div>
  );
};

const ErrorState = ({
  message = "Something went wrong",
  onRetry,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
};

const EmptyState = ({
  title = "No data available",
  description = "There is no data to display for the selected period.",
  icon = "📊",
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className,
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {description}
      </p>
    </motion.div>
  );
};

// Skeleton loading components
const SkeletonCard = () => (
  <div className="rounded-xl border border-border/50 p-6 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 w-24 bg-muted rounded" />
      <div className="h-8 w-8 bg-muted rounded-lg" />
    </div>
    <div className="h-8 w-32 bg-muted rounded mb-2" />
    <div className="h-3 w-20 bg-muted rounded" />
  </div>
);

const SkeletonChart = ({ height = 300 }) => (
  <div className="rounded-xl border border-border/50 p-6 animate-pulse">
    <div className="h-5 w-32 bg-muted rounded mb-2" />
    <div className="h-4 w-48 bg-muted rounded mb-6" />
    <div className="bg-muted rounded" style={{ height }} />
  </div>
);

const SkeletonList = ({ items = 5 }) => (
  <div className="rounded-xl border border-border/50 p-6 animate-pulse">
    <div className="h-5 w-32 bg-muted rounded mb-6" />
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
        >
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-3 w-16 bg-muted rounded" />
          </div>
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
);

export {
  LoadingState,
  ErrorState,
  EmptyState,
  SkeletonCard,
  SkeletonChart,
  SkeletonList,
};
