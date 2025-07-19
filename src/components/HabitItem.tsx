"use client";

import { format, startOfDay } from 'date-fns';
import type { Habit } from '@/lib/types';
import { calculateStreak } from '@/lib/habits';
import { Button } from './ui/button';
import { CheckIcon, FlameIcon, TrashIcon, Undo2 } from './icons';
import { StreakCalendar } from './StreakCalendar';

interface HabitItemProps {
  habit: Habit;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string, date: string) => void;
}

export function HabitItem({ habit, onDelete, onToggleCompletion }: HabitItemProps) {
  const todayStr = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const isCompletedToday = habit.completions.includes(todayStr);
  const streak = calculateStreak(habit.completions);

  return (
    <div className="bg-card p-4 rounded-lg border-4 border-foreground flex flex-col gap-4 transition-all duration-300" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-bold font-headline text-accent pr-2 break-words">{habit.name}</h3>
        <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => onDelete(habit.id)}>
          <TrashIcon className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-md">
        <FlameIcon className="w-8 h-8 text-primary" />
        <p className="text-3xl font-bold text-primary-foreground">{streak}</p>
        <p className="text-muted-foreground -ml-2">day streak</p>
      </div>

      <StreakCalendar completions={habit.completions} />

      <button
        onClick={() => onToggleCompletion(habit.id, todayStr)}
        className={`w-full py-4 text-xl font-bold rounded-lg border-2 border-b-4 border-r-4  transition-all active:scale-[0.98] active:border-b-2 active:border-r-2 flex items-center justify-center gap-2 ${
          isCompletedToday
            ? 'bg-primary text-primary-foreground border-primary-foreground'
            : 'bg-secondary text-secondary-foreground border-foreground'
        }`}
      >
        {isCompletedToday ? <Undo2 className="w-6 h-6" /> : <CheckIcon className="w-6 h-6" />}
        {isCompletedToday ? "Undo" : "Mark as Complete"}
      </button>
    </div>
  );
}
