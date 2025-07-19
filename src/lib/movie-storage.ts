
'use client';

import type { Movie } from '@/lib/types';

const MOVIE_LIST_KEY = 'pixel-movies-list';
const getPosterKey = (id: string) => `pixel-movie-poster-${id}`;

export const movieStorage = {
  getMovies: (): Movie[] => {
    if (typeof window === 'undefined') return [];
    try {
      const listJson = localStorage.getItem(MOVIE_LIST_KEY);
      if (!listJson) return [];
      
      const list: Omit<Movie, 'posterDataUri'>[] = JSON.parse(listJson);
      
      // We return a list without poster data. The card will load it on its own.
      return list.map(item => ({
        ...item,
        posterDataUri: '', // Initially empty
      })) as Movie[];

    } catch (error) {
      console.error("Failed to parse movie list from localStorage", error);
      return [];
    }
  },

  saveMovies: (movies: Movie[]) => {
    if (typeof window === 'undefined') return;
    try {
      // Don't save poster data in the main list
      const listToSave = movies.map(({ posterDataUri, ...rest }) => rest);
      localStorage.setItem(MOVIE_LIST_KEY, JSON.stringify(listToSave));
    } catch (error) {
      console.error("Failed to save movie list to localStorage", error);
    }
  },

  addMovie: (movie: Movie) => {
    if (typeof window === 'undefined') return;
    try {
      // Save the poster separately
      localStorage.setItem(getPosterKey(movie.id), movie.posterDataUri);
      
      const currentMovies = movieStorage.getMovies();
      const updatedMovies = [movie, ...currentMovies];
      movieStorage.saveMovies(updatedMovies);

      return updatedMovies;
    } catch (error) {
       console.error("Failed to add movie to localStorage", error);
       if (error instanceof DOMException && error.name === 'QuotaExceededError') {
         alert("Storage limit exceeded. Could not save the new movie poster. Try deleting some old movies.");
       }
       return movieStorage.getMovies();
    }
  },

  deleteMovie: (id: string) => {
    if (typeof window === 'undefined') return;
    const currentMovies = movieStorage.getMovies();
    const updatedMovies = currentMovies.filter(movie => movie.id !== id);
    movieStorage.saveMovies(updatedMovies);
    // Also remove the poster from storage
    localStorage.removeItem(getPosterKey(id));
    return updatedMovies;
  },

  getPoster: (id: string): string => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(getPosterKey(id)) || '';
  }
};
