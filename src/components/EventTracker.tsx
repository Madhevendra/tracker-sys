
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Event } from '@/lib/types';
import { AddEventDialog } from './AddEventDialog';
import { Button } from './ui/button';
import { PlusIcon, TrashIcon, ChevronsRight } from './icons';
import { format, parseISO, intervalToDuration } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { CalendarDays, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { Progress } from './ui/progress';


const useCountdown = (targetDate: string) => {
    const countDownDate = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
    
    const [now, setNow] = useState(new Date().getTime());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date().getTime());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const distance = countDownDate - now;

    if (distance < 0) {
        return { expired: true };
    }

    const duration = intervalToDuration({ start: 0, end: distance });
    
    return {
        expired: false,
        days: duration.days,
        hours: duration.hours,
        minutes: duration.minutes,
        seconds: duration.seconds,
    };
};

export default function EventTracker() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isClient, setIsClient] = useState(false);

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
    return events.filter(event => parseISO(event.date).getTime() > new Date().getTime());
  }, [events]);

  const pastEvents = useMemo(() => {
    return events.filter(event => parseISO(event.date).getTime() <= new Date().getTime())
                 .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [events]);


  if (!isClient) {
    return null;
  }
  
  const CountdownCard = ({ event }: { event: Event }) => {
    const countdown = useCountdown(event.date);
    const eventDate = parseISO(event.date);
    const taskProgress = useMemo(() => {
      if (!event.tasks || event.tasks.length === 0) return 0;
      const completedTasks = event.tasks.filter(t => t.completed).length;
      return (completedTasks / event.tasks.length) * 100;
    }, [event.tasks]);


    return (
      <Card className="bg-card border-4 border-foreground relative flex flex-col justify-between" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)} className="absolute top-2 right-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
            <TrashIcon className="w-5 h-5" />
        </Button>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent pr-8">{event.name}</CardTitle>
          <CardDescription>{format(eventDate, 'PPP')} {event.time ? `at ${event.time}` : ''}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end">
          {!countdown.expired ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-4xl font-bold text-primary">{countdown.days ?? 0}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">{countdown.hours ?? 0}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">{countdown.minutes ?? 0}</div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary">{countdown.seconds ?? 0}</div>
                <div className="text-xs text-muted-foreground">Seconds</div>
              </div>
            </div>
          ) : (
            <p className="text-primary font-bold">The event has started!</p>
          )}
        </CardContent>
        <div className="p-4 border-t-2 border-foreground mt-4 space-y-2">
            {event.tasks && event.tasks.length > 0 && (
                 <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm font-bold">
                            <ListTodo className="w-4 h-4"/>
                            <span>Tasks</span>
                        </div>
                        <span className="text-xs font-mono">{event.tasks.filter(t=>t.completed).length}/{event.tasks.length}</span>
                    </div>
                    <Progress value={taskProgress} className="h-2"/>
                 </div>
            )}
            <Button asChild variant="link" className="p-0 h-auto text-primary justify-end w-full">
                <Link href={`/events/${event.id}`}>
                    View Planner
                    <ChevronsRight className="w-4 h-4 ml-1" />
                </Link>
            </Button>
        </div>
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <CardDescription>{format(parseISO(event.date), 'PPP')} {event.time ? `at ${event.time}` : ''}</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <p className="text-muted-foreground font-medium">This event has passed.</p>
                                 <Button asChild variant="link" className="p-0 h-auto text-primary/70 justify-end w-full">
                                    <Link href={`/events/${event.id}`}>
                                        View Planner
                                        <ChevronsRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
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
