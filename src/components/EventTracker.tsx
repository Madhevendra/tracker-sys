
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Event } from '@/lib/types';
import { AddEventDialog } from './AddEventDialog';
import { Button } from './ui/button';
import { PlusIcon, TrashIcon } from './icons';
import { format, differenceInDays, startOfDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CalendarDays } from 'lucide-react';

export default function EventTracker() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isClient, setIsClient] = useState(false);
  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedEvents = localStorage.getItem('pixel-events');
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error("Failed to parse events from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-events', JSON.stringify(events));
    }
  }, [events, isClient]);

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      ...event
    };
    const updatedEvents = [...events, newEvent].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    setEvents(updatedEvents);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

  const upcomingEvents = useMemo(() => {
    return events.filter(event => differenceInDays(parseISO(event.date), today) >= 0);
  }, [events, today]);

  const pastEvents = useMemo(() => {
    return events.filter(event => differenceInDays(parseISO(event.date), today) < 0)
                 .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [events, today]);


  if (!isClient) {
    return null;
  }
  
  const CountdownCard = ({ event }: { event: Event }) => {
    const eventDate = parseISO(event.date);
    const daysRemaining = differenceInDays(eventDate, today);

    return (
      <Card className="bg-card border-4 border-foreground relative flex flex-col justify-between" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
            <TrashIcon className="w-5 h-5" />
        </Button>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent pr-8">{event.name}</CardTitle>
          <CardDescription>{format(eventDate, 'PPP')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-primary">{daysRemaining}</div>
          <div className="text-muted-foreground -mt-1">{daysRemaining === 1 ? 'Day' : 'Days'} Remaining</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <AddEventDialog onAddEvent={addEvent}>
          <button className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
            <PlusIcon className="w-6 h-6" />
            Add Event
          </button>
        </AddEventDialog>
      </div>

      {events.length > 0 ? (
        <div className="space-y-8">
            {upcomingEvents.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold mb-4 font-headline text-accent">Upcoming Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map((event) => (
                           <CountdownCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            )}
            
            {pastEvents.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold mb-4 font-headline text-accent">Past Events</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {pastEvents.map((event) => (
                         <Card key={event.id} className="bg-card/70 border-4 border-foreground/50 relative" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground) / 0.5)'}}>
                            <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                                <TrashIcon className="w-5 h-5" />
                            </Button>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl text-accent/70 pr-8">{event.name}</CardTitle>
                                <CardDescription>{format(parseISO(event.date), 'PPP')}</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <p className="text-muted-foreground font-medium">This event has passed.</p>
                            </CardContent>
                         </Card>
                       ))}
                    </div>
                </div>
            )}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
          <CalendarDays className="w-16 h-16 mx-auto text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No events yet.</p>
          <p className="text-muted-foreground mt-2">Click "Add Event" to start a new countdown.</p>
        </div>
      )}
    </div>
  );
}
