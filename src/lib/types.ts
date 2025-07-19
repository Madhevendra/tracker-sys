export interface Habit {
  id: string;
  name: string;
  completions: string[]; // Dates in "YYYY-MM-DD" format
  target: number; // e.g., 3 for "3 times a week"
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string; // ISO string format
}

export interface SleepEntry {
  id: string;
  date: string; // ISO string format
  bedTime: string; // "HH:mm"
  wakeTime: string; // "HH:mm"
  duration: number; // in minutes
}
