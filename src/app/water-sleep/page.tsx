import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import WaterSleepTracker from '@/components/WaterSleepTracker';

export default function WaterSleepPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 font-body bg-background min-h-screen">
      <div className="mb-8">
        <Button asChild variant="ghost">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary" style={{ textShadow: '4px 4px 0 hsl(var(--accent))' }}>
          Water & Sleep Tracker
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">Stay hydrated and well-rested for a healthier life.</p>
      </header>
      <WaterSleepTracker />
    </main>
  );
}
