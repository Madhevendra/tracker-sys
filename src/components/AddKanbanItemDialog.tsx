"use client";

import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { MovieType } from '@/lib/types';

interface AddKanbanItemDialogProps {
  onAddItem: (title: string, type: MovieType) => void;
}

export function AddKanbanItemDialog({ onAddItem }: AddKanbanItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<MovieType>('movie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddItem(title.trim(), itemType);
    
    // Reset form
    setTitle('');
    setItemType('movie');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
            <PlusIcon className="w-6 h-6" />
            Add Item to Board
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-4 border-foreground" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Add to Watchlist</DialogTitle>
          <DialogDescription>Add a new movie or series to your "To Watch" list.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="title" className="font-bold">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background border-2 border-foreground focus:ring-accent"
                    placeholder="e.g., The Matrix"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label className='font-bold'>Type</Label>
                <RadioGroup value={itemType} onValueChange={(v) => setItemType(v as MovieType)} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="movie" id="type-movie" />
                        <Label htmlFor="type-movie">Movie</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="series" id="type-series" />
                        <Label htmlFor="type-series">Series</Label>
                    </div>
                </RadioGroup>
            </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
