"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Expense } from '@/lib/types';
import { AddExpenseDialog } from './AddExpenseDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusIcon, TrashIcon } from './icons';
import { format, subDays, isSameDay, parseISO, isSameMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, Utensils, Bus, ShoppingCart, FileText, Clapperboard, HeartPulse, MoreHorizontal } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

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
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [budgetType, setBudgetType] = useState<'weekly' | 'monthly'>('monthly');
  const [isClient, setIsClient] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    setIsClient(true);
    try {
      const storedExpenses = localStorage.getItem('pixel-expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
      const storedBudgetAmount = localStorage.getItem('pixel-budget-amount');
      if (storedBudgetAmount) {
        const budget = parseFloat(storedBudgetAmount);
        setBudgetAmount(budget);
        setBudgetInput(budget.toString());
      }
      const storedBudgetType = localStorage.getItem('pixel-budget-type');
      if (storedBudgetType === 'weekly' || storedBudgetType === 'monthly') {
        setBudgetType(storedBudgetType);
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('pixel-expenses', JSON.stringify(expenses));
      if (budgetAmount > 0) {
        localStorage.setItem('pixel-budget-amount', budgetAmount.toString());
      }
      localStorage.setItem('pixel-budget-type', budgetType);
    }
  }, [expenses, budgetAmount, budgetType, isClient]);

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
  
  const handleSetBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget >= 0) {
        setBudgetAmount(newBudget);
    }
  }

  const currentPeriodTotal = useMemo(() => {
    const now = new Date();
    if (budgetType === 'monthly') {
        return expenses
            .filter(expense => isSameMonth(parseISO(expense.date), now))
            .reduce((total, expense) => total + expense.amount, 0);
    } else { // weekly
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return expenses
            .filter(expense => {
                const expenseDate = parseISO(expense.date);
                return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }
  }, [expenses, budgetType]);

  const budgetProgress = useMemo(() => {
    if (budgetAmount === 0) return 0;
    return (currentPeriodTotal / budgetAmount) * 100;
  }, [currentPeriodTotal, budgetAmount]);

  const getProgressColor = () => {
    if (budgetProgress > 100) return 'bg-destructive';
    if (budgetProgress > 75) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const spendingChartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30;
    const lastDays = Array.from({ length: days }, (_, i) => subDays(new Date(), i)).reverse();
    
    return lastDays.map(day => {
        const dailyTotal = expenses
            .filter(expense => isSameDay(parseISO(expense.date), day))
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
            date: format(day, days === 7 ? 'EEE' : 'd'),
            fullDate: format(day, 'MMM d'),
            total: dailyTotal,
        };
    });
  }, [expenses, timeRange]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent">Budget Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-4xl md:text-5xl font-bold">${currentPeriodTotal.toFixed(2)}</p>
                            <p className="text-muted-foreground -mt-1">
                                Spent this {budgetType === 'monthly' ? format(new Date(), 'MMMM') : 'week'}
                                {budgetAmount > 0 && ` of $${budgetAmount.toFixed(2)}`}
                            </p>
                        </div>
                        <div className="flex items-end gap-2">
                             <div className="grid w-full max-w-sm items-center gap-1.5">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="budget" className="font-bold">Set Budget</Label>
                                    <Tabs value={budgetType} onValueChange={(value) => setBudgetType(value as 'weekly' | 'monthly')} className="w-auto">
                                        <TabsList className='h-7'>
                                            <TabsTrigger value="weekly" className='text-xs px-2 py-1'>Week</TabsTrigger>
                                            <TabsTrigger value="monthly" className='text-xs px-2 py-1'>Month</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <Input
                                    type="number"
                                    id="budget"
                                    placeholder="e.g. 500"
                                    value={budgetInput}
                                    onChange={(e) => setBudgetInput(e.target.value)}
                                    className="w-32 bg-background border-2 border-foreground"
                                />
                             </div>
                            <Button onClick={handleSetBudget}>Set</Button>
                        </div>
                    </div>
                    {budgetAmount > 0 && (
                        <div className="space-y-2">
                            <div className="w-full bg-secondary/30 rounded-full border-2 border-foreground p-1">
                                <Progress value={budgetProgress} className="h-4 rounded-full" indicatorClassName={getProgressColor()} />
                            </div>
                            <div className="flex justify-between text-sm font-medium">
                                <span className="text-muted-foreground">0%</span>
                                <span className={
                                    budgetProgress > 100 ? 'text-destructive font-bold' : 
                                    budgetProgress > 75 ? 'text-yellow-500 font-bold' : 'text-primary'
                                }>{budgetProgress.toFixed(0)}%</span>
                                <span className="text-muted-foreground">100%</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="md:col-span-1">
                <AddExpenseDialog onAddExpense={addExpense}>
                     <button className="w-full h-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg transition-transform hover:scale-105 active:scale-95 active:border-b-2 active:border-r-2">
                        <PlusIcon className="w-6 h-6" />
                        Add Expense
                    </button>
                </AddExpenseDialog>
            </div>
        </div>
      
      <Card className="bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="font-headline text-2xl text-accent">Spending Overview</CardTitle>
                <CardDescription>Your spending overview for the last {timeRange === '7d' ? '7 days' : '30 days'}.</CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7d' | '30d')} className="w-auto">
                <TabsList>
                    <TabsTrigger value="7d">7 Days</TabsTrigger>
                    <TabsTrigger value="30d">30 Days</TabsTrigger>
                </TabsList>
            </Tabs>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{}} className="h-[200px] w-full">
                <BarChart accessibilityLayer data={spendingChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                        cursor={{fill: 'hsl(var(--accent) / 0.2)'}}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="p-2 rounded-lg bg-background border-2 border-foreground">
                                    <p className="font-bold">{`${label} (${payload[0].payload.fullDate})`}</p>
                                    <p className="text-primary">{`Total: $${payload[0].value.toFixed(2)}`}</p>
                                </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>

      {expenses.length > 0 ? (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold font-headline text-accent">Transaction History</h2>
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
