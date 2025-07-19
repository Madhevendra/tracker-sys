
"use client";

import { useState, useEffect } from 'react';
import type { Movie } from '@/lib/types';
import { AddMovieDialog } from './AddMovieDialog';
import { Button } from './ui/button';
import { PlusIcon } from './icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCard } from './MovieCard';
import { Clapperboard } from 'lucide-react';

export default function MovieTracker() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedMovies = localStorage.getItem('pixel-movies');
      if (storedMovies) {
        setMovies(JSON.parse(storedMovies));
      }
    } catch (error) {
      console.error("Failed to parse movies from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-movies', JSON.stringify(movies));
    }
  }, [movies, isClient]);

  const addMovie = (movie: Omit<Movie, 'id' | 'status'>) => {
    const newMovie: Movie = {
      id: crypto.randomUUID(),
      ...movie,
      status: 'watchlist'
    };
    setMovies(prevMovies => [newMovie, ...prevMovies]);
  };

  const deleteMovie = (id: string) => {
    setMovies(movies.filter((movie) => movie.id !== id));
  };
  
  const updateMovieStatus = (id: string, status: 'watchlist' | 'watched', rating?: number) => {
      setMovies(movies.map(movie => {
          if (movie.id === id) {
              return { ...movie, status, rating: status === 'watched' ? rating : undefined };
          }
          return movie;
      }));
  }

  if (!isClient) {
    return null;
  }
  
  const watchlist = movies.filter(m => m.status === 'watchlist');
  const watched = movies.filter(m => m.status === 'watched');

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <AddMovieDialog onAddMovie={addMovie} />
      </div>

      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="watchlist">Watchlist ({watchlist.length})</TabsTrigger>
          <TabsTrigger value="watched">Watched ({watched.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="watchlist">
            {watchlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                    {watchlist.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onDelete={deleteMovie} onUpdateStatus={updateMovieStatus} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30 mt-6">
                    <Clapperboard className="w-16 h-16 mx-auto text-primary mb-4" />
                    <p className="text-xl font-medium text-muted-foreground">Your watchlist is empty.</p>
                    <p className="text-muted-foreground mt-2">Click "Add Movie" to start building your list.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="watched">
             {watched.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                    {watched.map(movie => (
                        <MovieCard key={movie.id} movie={movie} onDelete={deleteMovie} onUpdateStatus={updateMovieStatus} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30 mt-6">
                    <Clapperboard className="w-16 h-16 mx-auto text-primary mb-4" />
                    <p className="text-xl font-medium text-muted-foreground">You haven't watched anything yet.</p>
                    <p className="text-muted-foreground mt-2">Move items from your watchlist once you've seen them.</p>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
