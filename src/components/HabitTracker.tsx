"use client";

import { useState, useEffect } from 'react';
import type { Habit } from '@/lib/types';
import { AddHabitDialog } from './AddHabitDialog';
import { HabitItem } from './HabitItem';
import { PlusIcon } from './icons';

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedHabits = localStorage.getItem('pixel-habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error("Failed to parse habits from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-habits', JSON.stringify(habits));
    }
  }, [habits, isClient]);

  const addHabit = (name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      completions: [],
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id));
  };

  const toggleCompletion = (id: string, date: string) => {
    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          const newCompletions = habit.completions.includes(date)
            ? habit.completions.filter((c) => c !== date)
            : [...habit.completions, date];
          return { ...habit, completions: newCompletions };
        }
        return habit;
      })
    );
  };
  
  if (!isClient) {
      return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <AddHabitDialog 
            onAddHabit={addHabit}
            existingHabits={habits.map(h => h.name)}
        >
          <button className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
            <PlusIcon className="w-6 h-6" />
            New Habit
          </button>
        </AddHabitDialog>
      </div>
      
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onDelete={deleteHabit}
              onToggleCompletion={toggleCompletion}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
          <p className="text-xl font-medium text-muted-foreground">No habits yet!</p>
          <p className="text-muted-foreground mt-2">Click "New Habit" to start your journey.</p>
        </div>
      )}
    </div>
  );
}
