import { format, subDays, startOfDay, differenceInDays } from 'date-fns';

export function calculateStreak(completions: string[]): number {
  if (completions.length === 0) return 0;

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

export function calculateBestStreak(completions: string[]): number {
    if (completions.length === 0) return 0;

    const sortedDates = completions
        .map(c => startOfDay(new Date(c)))
        .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length <= 1) return sortedDates.length;

    let bestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
        const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
        if (diff === 1) {
            currentStreak++;
        } else if (diff > 1) {
            currentStreak = 1;
        }
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
        }
    }
    return bestStreak;
}