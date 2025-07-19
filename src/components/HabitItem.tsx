"use client";

import { format, startOfDay } from 'date-fns';
import type { Habit } from '@/lib/types';
import { calculateStreak, calculateBestStreak, getCompletionsForCurrentWeek } from '@/lib/habits';
import { Button } from './ui/button';
import { CheckIcon, FlameIcon, TrashIcon } from './icons';
import { StreakCalendar } from './StreakCalendar';
import { Trophy } from 'lucide-react';
import { Progress } from './ui/progress';

interface HabitItemProps {
  habit: Habit;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string, date: string) => void;
}

export function HabitItem({ habit, onDelete, onToggleCompletion }: HabitItemProps) {
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const isCompletedToday = habit.completions.includes(todayStr);
  const currentStreak = calculateStreak(habit.completions);
  const bestStreak = calculateBestStreak(habit.completions);

  const weeklyCompletions = getCompletionsForCurrentWeek(habit.completions);
  const progressPercentage = (weeklyCompletions / habit.target) * 100;

  return (
    <div className="bg-card p-4 rounded-lg border-4 border-foreground flex flex-col gap-4 transition-all duration-300" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold font-headline text-accent pr-2 break-words">{habit.name}</h3>
        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => onDelete(habit.id)}>
          <TrashIcon className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className='flex justify-between items-end'>
          <p className="text-sm font-bold text-muted-foreground">Weekly Goal</p>
          <p className="text-sm font-bold text-primary-foreground">{weeklyCompletions} / {habit.target} days</p>
        </div>
        <div className="w-full bg-secondary/30 rounded-full border-2 border-foreground p-1">
            <Progress value={progressPercentage} className="h-4 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md">
            <FlameIcon className="w-8 h-8 text-primary shrink-0" />
            <div>
                <p className="text-2xl font-bold text-primary-foreground">{currentStreak}</p>
                <p className="text-xs text-muted-foreground -mt-1">Current Streak</p>
            </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 p-2 rounded-md">
            <Trophy className="w-8 h-8 text-accent shrink-0" />
            <div>
                <p className="text-2xl font-bold text-primary-foreground">{bestStreak}</p>
                <p className="text-xs text-muted-foreground -mt-1">Best Streak</p>
            </div>
        </div>
      </div>


      <StreakCalendar completions={habit.completions} />

      <button
        onClick={() => onToggleCompletion(habit.id, todayStr)}
        disabled={isCompletedToday}
        className={`w-full py-4 text-xl font-bold rounded-lg border-2 border-b-4 border-r-4  transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed ${
          isCompletedToday
            ? 'bg-primary text-primary-foreground border-primary-foreground'
            : 'bg-secondary text-secondary-foreground border-foreground active:scale-[0.98] active:border-b-2 active:border-r-2'
        }`}
      >
        <CheckIcon className="w-6 h-6" />
        {isCompletedToday ? "Completed" : "Mark as Complete"}
      </button>
    </div>
  );
}
