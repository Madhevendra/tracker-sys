
"use client";

import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WaterIntakeCalendarProps {
  waterLog: { [date: string]: number };
  waterGoal: number;
}

const getIntensityClass = (count: number, goal: number) => {
    if (count === 0 || goal === 0) return 'bg-secondary';
    const percentage = (count / goal) * 100;
    if (percentage >= 100) return 'bg-blue-600';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-blue-400';
    if (percentage >= 25) return 'bg-blue-300';
    return 'bg-blue-200';
}

export function WaterIntakeCalendar({ waterLog, waterGoal }: WaterIntakeCalendarProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 28 }).map((_, i) => subDays(today, 27 - i)); // last 4 weeks

  return (
    <div className="relative z-10 w-full mt-4">
        <p className="text-sm font-bold mb-2 text-foreground/80">Your progress over the last 4 weeks:</p>
        <TooltipProvider>
        <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const waterCount = waterLog[dayStr] || 0;
            const isCurrentDay = isSameDay(day, today);
            
            return (
                <Tooltip key={dayStr} delayDuration={100}>
                <TooltipTrigger asChild>
                    <div
                        className={`w-full aspect-square rounded-sm border-2 border-foreground/30 ${getIntensityClass(waterCount, waterGoal)} ${isCurrentDay ? 'ring-2 ring-offset-2 ring-offset-background ring-accent' : ''}`}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background border-none">
                    <p>{format(day, 'PPP')}: {waterCount} / {waterGoal} glasses</p>
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
        </TooltipProvider>
    </div>
  );
}
