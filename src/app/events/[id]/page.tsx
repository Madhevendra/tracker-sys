
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventDetails from '@/components/EventDetails';
import type { Event } from '@/lib/types';

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isClient, setIsClient] = useState(false);
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && eventId) {
      try {
        const storedEvents = localStorage.getItem('pixel-events');
        if (storedEvents) {
          const events: Event[] = JSON.parse(storedEvents);
          const currentEvent = events.find(e => e.id === eventId);
          if (currentEvent) {
            setEvent(currentEvent);
          } else {
            router.push('/events');
          }
        } else {
            router.push('/events');
        }
      } catch (error) {
        console.error("Failed to parse events from localStorage", error);
        router.push('/events');
      }
    }
  }, [eventId, router]);

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvent(updatedEvent);
    try {
      const storedEvents = localStorage.getItem('pixel-events');
      if (storedEvents) {
        let events: Event[] = JSON.parse(storedEvents);
        events = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
        localStorage.setItem('pixel-events', JSON.stringify(events));
      }
    } catch (error) {
      console.error("Failed to update event in localStorage", error);
    }
  };
  
  if (!isClient || !event) {
    // You can add a loader here
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8 font-body bg-background min-h-screen">
       <div className="mb-8">
        <Button asChild variant="ghost">
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Event Tracker
          </Link>
        </Button>
      </div>
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold font-headline text-primary" style={{ textShadow: '4px 4px 0 hsl(var(--accent))' }}>
          {event.name}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">Plan and prepare for your upcoming event.</p>
      </header>
      <EventDetails event={event} onUpdateEvent={handleUpdateEvent} />
    </main>
  );
}
