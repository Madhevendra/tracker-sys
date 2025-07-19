"use client";

import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakCalendarProps {
  completions: string[];
}

export function StreakCalendar({ completions }: StreakCalendarProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 91 }).map((_, i) => subDays(today, 90 - i)); // ~13 weeks
  
  const completionSet = new Set(completions);

  return (
    <div>
        <p className="text-sm font-bold mb-2 text-muted-foreground">Progress:</p>
        <TooltipProvider>
        <div className="grid grid-cols-13 grid-flow-col-dense gap-1.5" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
            {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isCompleted = completionSet.has(dayStr);
            const isCurrentDay = isSameDay(day, today);
            
            return (
                <Tooltip key={dayStr} delayDuration={100}>
                <TooltipTrigger asChild>
                    <div
                    className={`w-full aspect-square rounded-sm border-2 ${
                        isCompleted ? 'bg-primary border-primary-foreground' : 'bg-secondary'
                    } ${isCurrentDay ? 'ring-2 ring-offset-2 ring-offset-background ring-accent' : ''}`}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-foreground text-background border-none">
                    <p>{format(day, 'PPP')}</p>
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
        </TooltipProvider>
    </div>
  );
}
