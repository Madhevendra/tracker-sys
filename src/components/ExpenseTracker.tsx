"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Expense } from '@/lib/types';
import { AddExpenseDialog } from './AddExpenseDialog';
import { Button } from './ui/button';
import { PlusIcon, TrashIcon } from './icons';
import { format, isSameMonth, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet, Utensils, Bus, ShoppingCart, FileText, Clapperboard, HeartPulse, MoreHorizontal } from 'lucide-react';

const categoryIcons: { [key: string]: React.ReactNode } = {
    "Food": <Utensils className='w-6 h-6 text-primary' />,
    "Transport": <Bus className='w-6 h-6 text-primary' />,
    "Shopping": <ShoppingCart className='w-6 h-6 text-primary' />,
    "Bills": <FileText className='w-6 h-6 text-primary' />,
    "Entertainment": <Clapperboard className='w-6 h-6 text-primary' />,
    "Health": <HeartPulse className='w-6 h-6 text-primary' />,
    "Other": <MoreHorizontal className='w-6 h-6 text-primary' />,
};


export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedExpenses = localStorage.getItem('pixel-expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.error("Failed to parse expenses from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-expenses', JSON.stringify(expenses));
    }
  }, [expenses, isClient]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      ...expense
    };
    setExpenses(prevExpenses => [...prevExpenses, newExpense].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };
  
  const monthlyTotal = useMemo(() => {
    const currentMonth = new Date();
    return expenses
      .filter(expense => isSameMonth(parseISO(expense.date), currentMonth))
      .reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent">Monthly Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Wallet className="w-12 h-12 text-primary" />
                        <div>
                            <p className="text-3xl md:text-4xl font-bold">${monthlyTotal.toFixed(2)}</p>
                            <p className="text-muted-foreground -mt-1">Spent in {format(new Date(), 'MMMM')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex items-center justify-center">
                <AddExpenseDialog onAddExpense={addExpense}>
                    <button className="w-full h-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
                        <PlusIcon className="w-6 h-6" />
                        Add Expense
                    </button>
                </AddExpenseDialog>
            </div>
        </div>
      
      {expenses.length > 0 ? (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline text-accent">Recent Expenses</h2>
            <div className="bg-card p-4 rounded-lg border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                <ul className="divide-y-2 divide-foreground/20">
                    {expenses.map((expense) => (
                        <li key={expense.id} className="flex justify-between items-center py-3 gap-2">
                           <div className='flex items-center gap-4'>
                                <div className='hidden sm:block p-3 bg-secondary/50 rounded-md border-2 border-foreground'>
                                    {categoryIcons[expense.category] || <Wallet className='w-6 h-6 text-primary' />}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{expense.name}</p>
                                    <p className="text-sm text-muted-foreground">{format(parseISO(expense.date), 'MMM d, yyyy')} - <span className='font-semibold'>{expense.category}</span></p>
                                </div>
                           </div>
                           <div className="flex items-center gap-4">
                                <p className="font-bold text-xl text-right">${expense.amount.toFixed(2)}</p>
                                <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => deleteExpense(expense.id)}>
                                    <TrashIcon className="w-5 h-5" />
                                </Button>
                           </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
          <Wallet className="w-16 h-16 mx-auto text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No expenses yet!</p>
          <p className="text-muted-foreground mt-2">Click "Add Expense" to start tracking.</p>
        </div>
      )}
    </div>
  );
}
