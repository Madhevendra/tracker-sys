
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Movie } from '@/lib/types';
import { AddMovieDialog } from './AddMovieDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCard } from './MovieCard';
import { Clapperboard } from 'lucide-react';
import { Separator } from './ui/separator';

export default function MovieTracker() {
  const [items, setItems] = useState<Movie[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedItems = localStorage.getItem('pixel-movies');
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Failed to parse items from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-movies', JSON.stringify(items));
    }
  }, [items, isClient]);

  const addItem = (item: Omit<Movie, 'id' | 'status'>) => {
    const newItem: Movie = {
      id: crypto.randomUUID(),
      ...item,
      status: 'watchlist'
    };
    setItems(prevItems => [newItem, ...prevItems]);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };
  
  const updateItemStatus = (id: string, status: Movie['status'], details?: { rating?: number; season?: number; episode?: number }) => {
      setItems(items.map(item => {
          if (item.id === id) {
              const updatedItem = { ...item, status };
              if (item.type === 'movie' && status === 'watched') {
                  updatedItem.rating = details?.rating;
              } else if (item.type === 'movie' && status === 'watchlist') {
                  delete updatedItem.rating;
              }
              
              if (item.type === 'series') {
                  if (status === 'watching') {
                      updatedItem.currentSeason = details?.season ?? item.currentSeason;
                      updatedItem.currentEpisode = details?.episode ?? item.currentEpisode;
                  } else if (status === 'watchlist') {
                      updatedItem.currentSeason = 1;
                      updatedItem.currentEpisode = 1;
                  }
              }

              return updatedItem;
          }
          return item;
      }));
  }
  
  const movies = useMemo(() => items.filter(i => i.type === 'movie'), [items]);
  const series = useMemo(() => items.filter(i => i.type === 'series'), [items]);
  
  const movieWatchlist = movies.filter(m => m.status === 'watchlist');
  const moviesWatched = movies.filter(m => m.status === 'watched');

  const seriesWatchlist = series.filter(s => s.status === 'watchlist');
  const seriesWatching = series.filter(s => s.status === 'watching');
  const seriesWatched = series.filter(s => s.status === 'watched');

  if (!isClient) {
    return null;
  }

  const renderGrid = (items: Movie[], emptyMessage: {title: string, description: string}) => {
      if (items.length > 0) {
          return (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                {items.map(item => (
                    <MovieCard key={item.id} movie={item} onDelete={deleteItem} onUpdateStatus={updateItemStatus} />
                ))}
            </div>
          );
      }
      return (
        <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30 mt-6">
            <Clapperboard className="w-16 h-16 mx-auto text-primary mb-4" />
            <p className="text-xl font-medium text-muted-foreground">{emptyMessage.title}</p>
            <p className="text-muted-foreground mt-2">{emptyMessage.description}</p>
        </div>
      );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <AddMovieDialog onAddItem={addItem} />
      </div>

      <div>
        <h2 className="text-3xl font-bold font-headline text-accent mb-4">Movies</h2>
        <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlist">Watchlist ({movieWatchlist.length})</TabsTrigger>
            <TabsTrigger value="watched">Watched ({moviesWatched.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="watchlist">
                {renderGrid(movieWatchlist, {
                    title: "Your movie watchlist is empty.",
                    description: "Click \"Add Movie or Series\" to build your list."
                })}
            </TabsContent>
            <TabsContent value="watched">
                {renderGrid(moviesWatched, {
                    title: "You haven't watched any movies yet.",
                    description: "Move items from your watchlist once you've seen them."
                })}
            </TabsContent>
        </Tabs>
      </div>

      <Separator className="my-12" />

      <div>
          <h2 className="text-3xl font-bold font-headline text-accent mb-4">Series</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-center text-primary border-b-4 border-primary pb-2">To Watch ({seriesWatchlist.length})</h3>
                   <div className="p-2 space-y-4 rounded-lg bg-secondary/30 min-h-64">
                    {renderGrid(seriesWatchlist, {
                        title: "No series to watch.",
                        description: "Add a series to get started."
                    })}
                   </div>
              </div>
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-center text-primary border-b-4 border-primary pb-2">Watching ({seriesWatching.length})</h3>
                   <div className="p-2 space-y-4 rounded-lg bg-secondary/30 min-h-64">
                    {renderGrid(seriesWatching, {
                        title: "No series in progress.",
                        description: "Update a series' progress to move it here."
                    })}
                   </div>
              </div>
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-center text-primary border-b-4 border-primary pb-2">Watched ({seriesWatched.length})</h3>
                   <div className="p-2 space-y-4 rounded-lg bg-secondary/30 min-h-64">
                    {renderGrid(seriesWatched, {
                        title: "No series watched yet.",
                        description: "Finish a series to move it here."
                    })}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}
