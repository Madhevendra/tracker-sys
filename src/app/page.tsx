import HabitTracker from '@/components/HabitTracker';

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 font-body bg-background min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary" style={{ textShadow: '4px 4px 0 hsl(var(--accent))' }}>
          PixelHabit
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">Track your habits, build your streaks, level up your life.</p>
      </header>
      <HabitTracker />
    </main>
  );
}
