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
import type { Expense } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface AddExpenseDialogProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  children: ReactNode;
}

const categories = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

export function AddExpenseDialog({ onAddExpense, children }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && amount && category && date) {
      onAddExpense({
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        date: date.toISOString(),
      });
      // Reset form
      setName('');
      setAmount('');
      setCategory('');
      setDate(new Date());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-4 border-foreground" style={{boxShadow: '4px 4px 0 0 hsl(var(--foreground))'}}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Add a New Expense</DialogTitle>
          <DialogDescription>Log a new transaction to your tracker.</DialogDescription>
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
              placeholder="e.g. Coffee"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right font-bold">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3 bg-background border-2 border-foreground focus:ring-accent"
              placeholder="e.g. 4.50"
              required
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right font-bold">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3 bg-background border-2 border-foreground focus:ring-accent">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
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
                />
              </PopoverContent>
            </Popover>
          </div>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg hover:bg-primary/90 active:border-b-2 active:border-r-2">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
