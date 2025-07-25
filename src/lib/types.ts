
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

export interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string; // ISO string format
  time?: string | null; // e.g., "10:30 PM"
  notes?: string;
  tasks?: Task[];
}
