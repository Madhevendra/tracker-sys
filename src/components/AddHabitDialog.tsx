"use client";

import { useState, type ReactNode, useEffect, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from './icons';
import { suggestHabits } from '@/ai/flows/suggest-habits-flow';
import { Loader, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddHabitDialogProps {
  onAddHabit: (name: string) => void;
  existingHabits: string[];
  children: ReactNode;
}

export function AddHabitDialog({ onAddHabit, existingHabits, children }: AddHabitDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();

  const getSuggestions = () => {
    startSuggestionTransition(async () => {
      try {
        const result = await suggestHabits({ existingHabits });
        if (result.suggestions) {
          setSuggestions(result.suggestions);
        }
      } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Suggestion Error",
            description: "Could not get AI suggestions. Please try again.",
        })
      }
    });
  };

  useEffect(() => {
    if (open) {
      // Reset state when opening
      setHabitName('');
      setSuggestions([]);
      getSuggestions();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAddHabit(habitName.trim());
      setHabitName('');
      setOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setHabitName(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-4 border-foreground" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Add a New Habit</DialogTitle>
          <DialogDescription>What new skill will you master?</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-bold">
                Habit
              </Label>
              <Input
                id="name"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="col-span-3 bg-background border-2 border-foreground focus:ring-accent"
                placeholder="e.g. Meditate for 10 minutes"
              />
            </div>
          </div>
        </form>
        
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label className="font-bold">Suggestions</Label>
                <Button variant="ghost" size="sm" onClick={getSuggestions} disabled={isSuggesting}>
                    <RefreshCcw className={`w-4 h-4 mr-2 ${isSuggesting ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
            {isSuggesting && !suggestions.length ? (
                 <div className="flex justify-center items-center p-4">
                    <Loader className="w-8 h-8 animate-spin text-primary" />
                 </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((s, i) => (
                        <Button key={i} variant="outline" size="sm" onClick={() => handleSuggestionClick(s)} className="text-xs h-auto py-1 px-2">
                            {s}
                        </Button>
                    ))}
                </div>
            )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg hover:bg-primary/90 active:border-b-2 active:border-r-2">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
