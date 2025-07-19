
"use client";

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from './icons';
import { getMovieDetails, type GetMovieDetailsOutput } from '@/ai/flows/get-movie-details-flow';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import type { Movie, MovieType } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface AddMovieDialogProps {
  onAddItem: (item: Omit<Movie, 'id' | 'status' | 'rating'>) => void;
}

export function AddMovieDialog({ onAddItem }: AddMovieDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<MovieType>('movie');
  const [movieDetails, setMovieDetails] = useState<GetMovieDetailsOutput | null>(null);
  const [isSearching, startSearchTransition] = useTransition();

  const resetForm = () => {
    setTitle('');
    setItemType('movie');
    setMovieDetails(null);
  };

  const handleSearch = async () => {
    if (!title.trim()) return;
    setMovieDetails(null);
    startSearchTransition(async () => {
      try {
        const result = await getMovieDetails({ title: title.trim() });
        setMovieDetails(result);
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Search Error",
          description: "Could not find movie details. Please try another title.",
        });
      }
    });
  };
  
  const handleAddItem = () => {
    if (!movieDetails) return;
    
    const baseItem = {
        ...movieDetails,
    };

    if (itemType === 'series') {
        onAddItem({
            ...baseItem,
            type: 'series',
            currentSeason: 1,
            currentEpisode: 1,
        });
    } else {
        onAddItem({
            ...baseItem,
            type: 'movie',
        });
    }

    resetForm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
            <PlusIcon className="w-6 h-6" />
            Add Movie or Series
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background border-4 border-foreground" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Add to Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-1">
                <Label htmlFor="title" className="font-bold">Title</Label>
                <div className="flex gap-2">
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background border-2 border-foreground focus:ring-accent"
                        placeholder="e.g. Blade Runner 2049"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button type="button" onClick={handleSearch} disabled={isSearching} className="px-4">
                        {isSearching ? <Loader2 className="w-5 h-5 animate-spin"/> : <Search className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {isSearching && (
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="font-bold text-muted-foreground">Searching for "{title}"...</p>
                </div>
            )}
            
            {movieDetails && (
                <div className="space-y-4 pt-4 animate-in fade-in">
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

                    <div className="w-full aspect-[2/3] relative rounded-lg overflow-hidden border-2 border-foreground">
                        <Image src={movieDetails.posterDataUri} alt={`Poster for ${movieDetails.title}`} layout="fill" objectFit="cover" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-headline">{movieDetails.title} ({movieDetails.year})</h3>
                        <p className="text-sm text-muted-foreground">{movieDetails.description}</p>
                    </div>
                </div>
            )}

        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} disabled={!movieDetails || isSearching}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add to Library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
