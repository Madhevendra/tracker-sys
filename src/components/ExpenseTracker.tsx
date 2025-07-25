
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Expense } from '@/lib/types';
import { AddExpenseDialog } from './AddExpenseDialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PlusIcon, TrashIcon } from './icons';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Wallet, Utensils, Bus, ShoppingCart, FileText, Clapperboard, HeartPulse, MoreHorizontal } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const categoryIcons: { [key: string]: React.ReactNode } = {
    "Food": <Utensils className='w-5 h-5' />,
    "Transport": <Bus className='w-5 h-5' />,
    "Shopping": <ShoppingCart className='w-5 h-5' />,
    "Bills": <FileText className='w-5 h-5' />,
    "Entertainment": <Clapperboard className='w-5 h-5' />,
    "Health": <HeartPulse className='w-5 h-5' />,
    "Other": <MoreHorizontal className='w-5 h-5' />,
};

const currencies = [
    { value: '$', label: 'USD ($)' },
    { value: '₹', label: 'INR (₹)' },
]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [budgetInput, setBudgetInput] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [currency, setCurrency] = useState('₹');

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
      const storedCurrency = localStorage.getItem('pixel-currency');
      if (storedCurrency) {
        setCurrency(storedCurrency);
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
      localStorage.setItem('pixel-currency', currency);
    }
  }, [expenses, budgetAmount, currency, isClient]);

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
  
  const currentPeriodTotal = useMemo(() => {
    return spendingChartData.reduce((total, day) => total + day.total, 0);
  }, [spendingChartData]);

  const budgetProgress = useMemo(() => {
    if (budgetAmount === 0) return 0;
    return (currentPeriodTotal / budgetAmount) * 100;
  }, [currentPeriodTotal, budgetAmount]);

  const getProgressColor = () => {
    if (budgetProgress > 100) return 'bg-destructive';
    if (budgetProgress > 75) return 'bg-yellow-500';
    return 'bg-primary';
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-accent">Spending Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <p className="text-4xl md:text-5xl font-bold">{currency}{currentPeriodTotal.toFixed(2)}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-end gap-2">
                             <div>
                                <Label htmlFor="budget" className="font-bold text-sm">Set Your Budget</Label>
                                <div className="flex items-center mt-1">
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-foreground text-xl font-bold">{currency}</span>
                                        </div>
                                        <Input
                                            type="number"
                                            id="budget"
                                            placeholder="500"
                                            value={budgetInput}
                                            onChange={(e) => setBudgetInput(e.target.value)}
                                            className="w-40 bg-background border-2 border-r-0 border-foreground rounded-r-none pl-8 text-lg font-bold"
                                        />
                                    </div>
                                    <Button onClick={handleSetBudget} className="rounded-l-none border-2 border-b-4 border-r-4 border-primary-foreground">Set</Button>
                                </div>
                            </div>
                             <div>
                                <Label className="font-bold text-sm">Currency</Label>
                                <Select value={currency} onValueChange={setCurrency}>
                                    <SelectTrigger className="w-28 bg-background border-2 border-foreground focus:ring-accent mt-1">
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map(c => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                <BarChart accessibilityLayer data={spendingChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${currency}${value}`} />
                    <Tooltip 
                        cursor={{fill: 'hsl(var(--accent) / 0.2)'}}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="p-2 rounded-lg bg-background border-2 border-foreground">
                                    <p className="font-bold">{`${label} (${payload[0].payload.fullDate})`}</p>
                                    <p className="text-primary">{`Total: ${currency}${payload[0].value.toFixed(2)}`}</p>
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

       <Card className="bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <CardHeader>
            <CardTitle className="font-headline text-2xl text-accent">Recent Transactions</CardTitle>
            <CardDescription>A list of your most recent expenses.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[80px]">Category</TableHead>
                    <TableHead>Expense</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[50px]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.length > 0 ? (
                        expenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-primary">
                                        {categoryIcons[expense.category] || <MoreHorizontal className='w-5 h-5' />}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{expense.name}</TableCell>
                                <TableCell>{format(parseISO(expense.date), 'dd MMM yyyy')}</TableCell>
                                <TableCell className="text-right font-mono">{currency}{expense.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)} className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                                        <TrashIcon className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                No expenses yet. Click "Add Expense" to start tracking.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      {expenses.length === 0 && (
        <div className="text-center py-16 px-6 bg-secondary/50 rounded-lg border-2 border-dashed border-muted-foreground/30">
          <Wallet className="w-16 h-16 mx-auto text-primary mb-4" />
          <p className="text-xl font-medium text-muted-foreground">No expenses yet!</p>
          <p className="text-muted-foreground mt-2">Click "Add Expense" to start tracking.</p>
        </div>
      )}
    </div>
  );
}
