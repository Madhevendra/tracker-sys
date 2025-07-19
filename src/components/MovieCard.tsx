
"use client";

import type { Movie } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { Check, Star, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';

interface MovieCardProps {
  movie: Movie;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'watchlist' | 'watched', rating?: number) => void;
}

export function MovieCard({ movie, onDelete, onUpdateStatus }: MovieCardProps) {
  const [rating, setRating] = useState(movie.rating || 0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleMarkAsWatched = () => {
    onUpdateStatus(movie.id, 'watched', rating);
    setPopoverOpen(false);
  };
  
  const handleMoveToWatchlist = () => {
      onUpdateStatus(movie.id, 'watchlist');
  }

  return (
    <Card className="bg-card border-4 border-foreground relative group overflow-hidden" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <div className="absolute top-2 right-2 z-20 flex gap-1">
             {movie.status === 'watchlist' && (
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-primary/80 text-primary-foreground border-2 border-primary-foreground hover:bg-primary">
                            <Check className="w-4 h-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 space-y-4">
                        <p className="font-bold text-center">Rate this movie</p>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)}>
                                    <Star className={`w-6 h-6 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}/>
                                </button>
                            ))}
                        </div>
                        <Button onClick={handleMarkAsWatched} className="w-full">Mark as Watched</Button>
                    </PopoverContent>
                </Popover>
             )}
             {movie.status === 'watched' && (
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-secondary/80 text-secondary-foreground border-2 border-foreground" onClick={handleMoveToWatchlist}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
                      <path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16"/>
                    </svg>
                 </Button>
             )}
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-destructive/80 text-destructive-foreground border-2 border-destructive-foreground hover:bg-destructive" onClick={() => onDelete(movie.id)}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
      
        <div className="aspect-[2/3] w-full relative">
            <Image src={movie.posterDataUri} alt={`Poster for ${movie.title}`} layout="fill" objectFit="cover" className="transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        <CardContent className="p-3 absolute bottom-0 w-full z-10">
            <h3 className="font-bold text-background truncate" title={movie.title}>{movie.title} ({movie.year})</h3>
            {movie.status === 'watched' && movie.rating && (
                 <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`w-4 h-4 ${movie.rating && movie.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-background/50'}`}/>
                    ))}
                 </div>
            )}
        </CardContent>
    </Card>
  );
}
