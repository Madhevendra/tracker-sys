"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Movie, MovieStatus } from '@/lib/types';
import { AddKanbanItemDialog } from './AddKanbanItemDialog';
import { KanbanCard } from './KanbanCard';
import { Clapperboard } from 'lucide-react';

const KANBAN_STORAGE_KEY = 'pixel-kanban-items';

const columns: { status: MovieStatus; title: string }[] = [
  { status: 'to-watch', title: 'To Watch' },
  { status: 'watching', title: 'Watching' },
  { status: 'watched', title: 'Watched' },
];

export default function KanbanBoard() {
  const [items, setItems] = useState<Movie[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedItems = localStorage.getItem(KANBAN_STORAGE_KEY);
        if (storedItems) {
          setItems(JSON.parse(storedItems));
        }
      } catch (error) {
        console.error("Failed to parse items from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isClient]);

  const addItem = (title: string, type: 'movie' | 'series') => {
    const newItem: Movie = {
      id: crypto.randomUUID(),
      title,
      type,
      status: 'to-watch',
    };
    if (type === 'series') {
        newItem.season = 1;
        newItem.episode = 1;
    }
    setItems(prev => [newItem, ...prev]);
  };

  const updateItem = (updatedItem: Movie) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const itemsByStatus = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = [];
      }
      acc[item.status].push(item);
      return acc;
    }, {} as { [key in MovieStatus]: Movie[] });
  }, [items]);


  if (!isClient) {
    return null; 
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <AddKanbanItemDialog onAddItem={addItem} />
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(column => (
          <div key={column.status} className="bg-secondary/50 rounded-lg p-4">
            <h2 className="text-xl font-bold font-headline text-accent mb-4 text-center">
              {column.title} ({itemsByStatus[column.status]?.length || 0})
            </h2>
            <div className="space-y-4 min-h-[200px]">
              {itemsByStatus[column.status]?.length > 0 ? (
                itemsByStatus[column.status].map(item => (
                  <KanbanCard key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center pt-10 text-center">
                   <Clapperboard className="w-12 h-12 text-muted-foreground/50 mb-2" />
                   <p className="text-sm text-muted-foreground italic">This column is empty.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
