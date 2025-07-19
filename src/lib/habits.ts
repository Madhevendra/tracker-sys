import { format, subDays, startOfDay } from 'date-fns';

export function calculateStreak(completions: string[]): number {
  let currentStreak = 0;
  let currentDate = startOfDay(new Date());

  const completionSet = new Set(completions.map(c => format(startOfDay(new Date(c)), 'yyyy-MM-dd')));

  if (!completionSet.has(format(currentDate, 'yyyy-MM-dd'))) {
    currentDate = subDays(currentDate, 1);
  }

  while (completionSet.has(format(currentDate, 'yyyy-MM-dd'))) {
    currentStreak++;
    currentDate = subDays(currentDate, 1);
  }

  return currentStreak;
}
