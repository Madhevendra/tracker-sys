export interface Habit {
  id: string;
  name: string;
  completions: string[]; // Dates in "YYYY-MM-DD" format
  target: number; // e.g., 3 for "3 times a week"
}
