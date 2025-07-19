
"use client";

import { format, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SleepEntry } from '@/lib/types';

interface SleepCalendarProps {
  sleepLog: SleepEntry[];
}

const formatDuration = (minutes: number) => {
    if (minutes < 0 || isNaN(minutes)) return `0h 0m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
};

const getIntensityClass = (duration: number, goal: number) => {
    if (duration === 0 || goal === 0) return 'bg-secondary';
    const percentage = (duration / goal) * 100;
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 85) return 'bg-red-500';
    if (percentage >= 70) return 'bg-red-400';
    if (percentage >= 50) return 'bg-red-300';
    return 'bg-red-200';
}

export function SleepCalendar({ sleepLog }: SleepCalendarProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 28 }).map((_, i) => subDays(today, 27 - i)); // last 4 weeks
  const sleepGoal = 8 * 60; // 8 hours in minutes

  const sleepDataByDate = sleepLog.reduce((acc, entry) => {
      acc[entry.date] = entry.duration;
      return acc;
  }, {} as { [date: string]: number });

  return (
    <div className="relative z-10 w-full mt-4">
        <p className="text-sm font-bold mb-2 text-foreground/80">Your sleep over the last 4 weeks:</p>
        <TooltipProvider>
        <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const sleepDuration = sleepDataByDate[dayStr] || 0;
            const isCurrentDay = isSameDay(day, today);
            
            return (
                <Tooltip key={dayStr} delayDuration={100}>
                <TooltipTrigger asChild>
                    <div
                        className={`w-full aspect-square rounded-sm border-2 border-foreground/30 ${getIntensityClass(sleepDuration, sleepGoal)} ${isCurrentDay ? 'ring-2 ring-offset-2 ring-offset-background ring-accent' : ''}`}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background border-none">
                    <p>{format(day, 'PPP')}: {formatDuration(sleepDuration)}</p>
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
        </TooltipProvider>
    </div>
  );
}
