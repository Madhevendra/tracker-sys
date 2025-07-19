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
