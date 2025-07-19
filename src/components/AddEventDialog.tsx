
"use client";

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon } from './icons';
import type { Event } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, startOfDay, set } from 'date-fns';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddEventDialogProps {
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  children: ReactNode;
}

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export function AddEventDialog({ onAddEvent, children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [hour, setHour] = useState<string | undefined>();
  const [minute, setMinute] = useState<string | undefined>();
  const [period, setPeriod] = useState<'AM' | 'PM' | undefined>();
  const [hasTime, setHasTime] = useState(false);

  const resetForm = () => {
    setName('');
    setDate(undefined);
    setHour(undefined);
    setMinute(undefined);
    setPeriod(undefined);
    setHasTime(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      return;
    }

    let finalDate = startOfDay(date);
    let timeString = null;
    
    if (hasTime && hour && minute && period) {
      const parsedHour = parseInt(hour, 10);
      const finalHour = period === 'PM' && parsedHour !== 12 ? parsedHour + 12 : (period === 'AM' && parsedHour === 12 ? 0 : parsedHour);
      
      finalDate = set(finalDate, {
        hours: finalHour,
        minutes: parseInt(minute, 10),
      });
      timeString = format(finalDate, 'p'); // e.g. 10:30 PM
    }

    onAddEvent({
      name: name.trim(),
      date: finalDate.toISOString(),
      time: timeString,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-4 border-foreground" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Add a New Event</DialogTitle>
          <DialogDescription>Create a countdown for a special occasion.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right font-bold">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3 bg-background border-2 border-foreground focus:ring-accent"
              placeholder="e.g. Birthday Trip"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right font-bold">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal bg-background border-2 border-foreground hover:bg-accent/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < startOfDay(new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3">
                <Button type="button" variant="link" className="p-0 h-auto text-primary" onClick={() => setHasTime(!hasTime)}>
                  <Clock className="w-4 h-4 mr-2" />
                  {hasTime ? 'Remove time' : 'Add time'}
                </Button>
              </div>
            </div>
          {hasTime && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Time</Label>
              <div className="col-span-3 grid grid-cols-3 gap-2">
                <Select value={hour} onValueChange={setHour} required>
                    <SelectTrigger className="bg-background border-2 border-foreground"><SelectValue placeholder="Hr" /></SelectTrigger>
                    <SelectContent>{hours.map(h => <SelectItem key={`h-${h}`} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={minute} onValueChange={setMinute} required>
                    <SelectTrigger className="bg-background border-2 border-foreground"><SelectValue placeholder="Min" /></SelectTrigger>
                    <SelectContent>{minutes.map(m => <SelectItem key={`m-${m}`} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={period} onValueChange={(v) => setPeriod(v as 'AM' | 'PM')} required>
                    <SelectTrigger className="bg-background border-2 border-foreground"><SelectValue placeholder="AM/PM" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg hover:bg-primary/90 active:border-b-2 active:border-r-2">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
