import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Wallet, Droplets, BedDouble, CalendarDays, PlusSquare } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';

const trackers = [
  {
    href: '/habits',
    icon: <Target className="w-12 h-12 text-primary" />,
    title: 'Habit Tracker',
    description: 'Build good habits and track your progress.',
    'data-ai-hint': 'habits productivity',
  },
  {
    href: '/expenses',
    icon: <Wallet className="w-12 h-12 text-primary" />,
    title: 'Expense Tracker',
    description: 'Monitor your spending and manage your budget.',
    'data-ai-hint': 'finance money',
  },
  {
    href: '/water-sleep',
    icon: (
      <div className="flex gap-2">
        <Droplets className="w-12 h-12 text-primary" />
        <BedDouble className="w-12 h-12 text-primary" />
      </div>
    ),
    title: 'Water & Sleep Tracker',
    description: 'Keep track of your hydration and sleep patterns.',
    'data-ai-hint': 'health wellness',
  },
  {
    href: '/events',
    icon: <CalendarDays className="w-12 h-12 text-primary" />,
    title: 'Event Tracker',
    description: 'Countdown to important dates and events.',
    'data-ai-hint': 'calendar events',
  },
  {
    href: '/custom',
    icon: <PlusSquare className="w-12 h-12 text-primary" />,
    title: 'Custom Tracker',
    description: 'Create your own tracker for anything you want.',
    'data-ai-hint': 'create new',
  },
];

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 font-body bg-background min-h-screen">
       <header className="text-center mb-12 relative">
        <div className="absolute top-0 right-0">
          <ThemeSelector />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary" style={{ textShadow: '4px 4px 0 hsl(var(--accent))' }}>
          PixelTrack
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">One app to track them all. Choose your tracker.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trackers.map((tracker) => (
          <Link href={tracker.href} key={tracker.title} className="group">
            <Card className="h-full bg-card border-4 border-foreground transition-all duration-300 hover:border-primary hover:-translate-y-2 hover:shadow-2xl" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
              <CardHeader className="p-6">
                <div className="mb-4">{tracker.icon}</div>
                <CardTitle className="text-2xl font-bold font-headline text-accent group-hover:text-primary">{tracker.title}</CardTitle>
                <CardDescription className="text-base">{tracker.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
