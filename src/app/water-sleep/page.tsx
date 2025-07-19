import { Droplets, BedDouble, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
        <p className="text-muted-foreground mt-4 text-lg">Keep track of your hydration and sleep patterns.</p>
      </header>
       <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
        <div className="flex justify-center gap-4 mb-4">
          <Droplets className="w-16 h-16 text-primary" />
          <BedDouble className="w-16 h-16 text-primary" />
        </div>
        <p className="text-xl font-medium text-muted-foreground">Water & Sleep Tracker Coming Soon!</p>
        <p className="text-muted-foreground mt-2">This feature is under construction.</p>
      </div>
    </main>
  );
}
