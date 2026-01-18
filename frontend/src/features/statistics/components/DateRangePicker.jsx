import React from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const DateRangePicker = ({ dateRange, onDateRangeChange, className = "" }) => {
  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 14 days", days: 14 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
  ];

  const handlePresetClick = (days) => {
    const to = new Date();
    const from = subDays(to, days);
    onDateRangeChange({
      from_date: format(from, "yyyy-MM-dd"),
      to_date: format(to, "yyyy-MM-dd"),
    });
  };

  const formatDisplayDate = () => {
    if (dateRange.from_date && dateRange.to_date) {
      return `${format(new Date(dateRange.from_date), "MMM d, yyyy")} - ${format(new Date(dateRange.to_date), "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handlePresetClick(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom date picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 justify-start text-left font-normal",
              !dateRange.from_date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDisplayDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={
              dateRange.from_date ? new Date(dateRange.from_date) : new Date()
            }
            selected={{
              from: dateRange.from_date
                ? new Date(dateRange.from_date)
                : undefined,
              to: dateRange.to_date ? new Date(dateRange.to_date) : undefined,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({
                  from_date: format(range.from, "yyyy-MM-dd"),
                  to_date: format(range.to, "yyyy-MM-dd"),
                });
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

export default DateRangePicker;
