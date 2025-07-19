import { PlusSquare } from 'lucide-react';

export default function CustomPage() {
  return (
    <main className="container mx-auto p-4 md:p-8 font-body bg-background min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary" style={{ textShadow: '4px 4px 0 hsl(var(--accent))' }}>
          Custom Tracker
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">Create your own tracker for anything you want.</p>
      </header>
      <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
        <PlusSquare className="w-16 h-16 mx-auto text-primary mb-4" />
        <p className="text-xl font-medium text-muted-foreground">Custom Tracker Coming Soon!</p>
        <p className="text-muted-foreground mt-2">This feature is under construction.</p>
      </div>
    </main>
  );
}
