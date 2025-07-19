"use client";

import type { Movie, MovieStatus } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ArrowRight, Film, ListVideo, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface KanbanCardProps {
  item: Movie;
  onUpdate: (item: Movie) => void;
  onDelete: (id: string) => void;
}

const statusTransitions: Record<MovieStatus, MovieStatus | null> = {
    'to-watch': 'watching',
    'watching': 'watched',
    'watched': null,
};

export function KanbanCard({ item, onUpdate, onDelete }: KanbanCardProps) {
  const [season, setSeason] = useState(item.type === 'series' ? item.season : undefined);
  const [episode, setEpisode] = useState(item.type === 'series' ? item.episode : undefined);
  
  const handleMove = () => {
    const nextStatus = statusTransitions[item.status];
    if (nextStatus) {
      const updatedItem = { ...item, status: nextStatus };
      // If moving a movie to 'watching', just skip to 'watched'
      if (item.type === 'movie' && nextStatus === 'watching') {
        updatedItem.status = 'watched';
      }
      onUpdate(updatedItem);
    }
  };

  const handleUpdateProgress = () => {
    if (item.type !== 'series') return;

    let newStatus = item.status;
    if (item.status === 'to-watch') {
      newStatus = 'watching';
    }

    onUpdate({
        ...item,
        status: newStatus,
        season,
        episode,
    });
  }

  const renderProgress = () => {
    if (item.type !== 'series' || item.status === 'to-watch') return null;

    if (item.status === 'watching') {
      return (
        <Popover>
          <PopoverTrigger asChild>
              <button className="text-xs font-mono p-1 rounded-md bg-primary/20 text-primary font-bold hover:bg-primary/30">
                S{item.season} E{item.episode}
              </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 space-y-4">
            <p className="font-bold text-center">Update Progress</p>
            <div className="flex gap-2 items-end">
                <div className="grid w-24 items-center gap-1.5">
                    <Label htmlFor="season">Season</Label>
                    <Input type="number" id="season" value={season} onChange={e => setSeason(parseInt(e.target.value))} min="1" />
                </div>
                  <div className="grid w-24 items-center gap-1.5">
                    <Label htmlFor="episode">Episode</Label>
                    <Input type="number" id="episode" value={episode} onChange={e => setEpisode(parseInt(e.target.value))} min="1" />
                </div>
            </div>
            <Button onClick={handleUpdateProgress} className="w-full">Update</Button>
          </PopoverContent>
        </Popover>
      );
    }

    if (item.status === 'watched') {
       return <span className="text-xs font-mono p-1 rounded-md bg-green-500/20 text-green-600 font-bold">Finished</span>;
    }
    
    return null;
  }
  
  return (
    <Card className="bg-card border-2 border-foreground relative group" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <CardHeader className="p-3 pb-2 flex-row justify-between items-start">
            <CardTitle className="text-lg font-bold font-headline pr-10 break-all">{item.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground absolute top-3 right-3">
               {item.type === 'movie' ? <Film className="w-5 h-5" /> : <ListVideo className="w-5 h-5" />}
            </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex justify-between items-center">
            {renderProgress()}
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => onDelete(item.id)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
                {statusTransitions[item.status] && (
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:bg-primary/20 hover:text-primary" onClick={handleMove}>
                        <ArrowRight className="w-4 h-4"/>
                    </Button>
                )}
            </div>
          </div>
        </CardContent>
    </Card>
  );
}
