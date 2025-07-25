
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bed, Droplet, Minus, Plus, Trash2 } from 'lucide-react';
import { format, differenceInMinutes, parse, formatISO, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { SleepEntry } from '@/lib/types';
import { WaterIntakeCalendar } from './WaterIntakeCalendar';
import { SleepCalendar } from './SleepCalendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const Glass = ({ filled }: { filled: boolean }) => (
    <svg width="48" height="48" viewBox="0 0 24 24" className={`transition-colors duration-300 z-10 ${filled ? 'text-blue-200' : 'text-foreground/20'}`}>
        <path fill="currentColor" d="M8 3h8c.75 0 1.38.56 1.48 1.29l.16 1.28H6.36l.16-1.28C6.62 3.56 7.25 3 8 3m-.36 4l-1 8.83C6.55 17.02 7.21 18 8.1 18h7.8c.89 0 1.55-.98 1.46-1.87L16.36 7zM6 20v1h12v-1z"/>
    </svg>
);

const hours12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

export default function WaterSleepTracker() {
    const [isClient, setIsClient] = useState(false);

    // Water Tracker State
    const [waterLog, setWaterLog] = useState<{ [date: string]: number }>({});
    const [waterGoal, setWaterGoal] = useState(8);
    const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
    const waterCount = waterLog[todayStr] || 0;

    // Sleep Tracker State
    const [sleepLog, setSleepLog] = useState<SleepEntry[]>([]);
    const [bedTimeHour, setBedTimeHour] = useState("10");
    const [bedTimeMinute, setBedTimeMinute] = useState("30");
    const [bedTimePeriod, setBedTimePeriod] = useState("PM");
    const [wakeTimeHour, setWakeTimeHour] = useState("6");
    const [wakeTimeMinute, setWakeTimeMinute] = useState("30");
    const [wakeTimePeriod, setWakeTimePeriod] = useState("AM");

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            // Load water data
            const storedWaterLog = localStorage.getItem('pixel-water-log');
            if (storedWaterLog) {
                setWaterLog(JSON.parse(storedWaterLog));
            } else {
                 // Migration logic from old format
                 const todayKey = `pixel-water-${format(new Date(), 'yyyy-MM-dd')}`;
                 const oldData = localStorage.getItem(todayKey);
                 if (oldData) {
                    setWaterLog({ [format(new Date(), 'yyyy-MM-dd')]: JSON.parse(oldData) });
                    localStorage.removeItem(todayKey);
                 }
            }

            const storedWaterGoal = localStorage.getItem('pixel-water-goal');
            if (storedWaterGoal) {
                setWaterGoal(JSON.parse(storedWaterGoal));
            }

            // Load sleep data
            const storedSleepLog = localStorage.getItem('pixel-sleep-log');
            if (storedSleepLog) {
                setSleepLog(JSON.parse(storedSleepLog));
            }
        }
    }, []);

    useEffect(() => {
        if (isClient) {
            localStorage.setItem('pixel-water-log', JSON.stringify(waterLog));
            localStorage.setItem('pixel-water-goal', JSON.stringify(waterGoal));
            localStorage.setItem('pixel-sleep-log', JSON.stringify(sleepLog));
        }
    }, [waterLog, waterGoal, sleepLog, isClient]);

    const handleWaterChange = (amount: number) => {
        const newCount = Math.max(0, waterCount + amount);
        setWaterLog(prev => ({
            ...prev,
            [todayStr]: newCount
        }));
    };
    
    const handleWaterGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setWaterGoal(value === "" ? 0 : parseInt(value, 10));
    };

    const handleWaterGoalBlur = () => {
        if (waterGoal < 1 || isNaN(waterGoal)) {
            setWaterGoal(1);
        }
    };

    const handleLogSleep = () => {
        const today = new Date();
        const bedTime12h = `${bedTimeHour}:${bedTimeMinute} ${bedTimePeriod}`;
        const wakeTime12h = `${wakeTimeHour}:${wakeTimeMinute} ${wakeTimePeriod}`;
        
        const bedTimeDate = parse(bedTime12h, 'h:mm a', today);
        const wakeTimeDate = parse(wakeTime12h, 'h:mm a', today);

        if (wakeTimeDate <= bedTimeDate) {
            wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
        }

        const duration = differenceInMinutes(wakeTimeDate, bedTimeDate);

        const newEntry: SleepEntry = {
            id: crypto.randomUUID(),
            date: formatISO(today, { representation: 'date' }),
            bedTime: bedTime12h,
            wakeTime: wakeTime12h,
            duration,
        };
        
        setSleepLog(prev => [newEntry, ...prev].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
    };

    const deleteSleepEntry = (id: string) => {
        setSleepLog(prev => prev.filter(entry => entry.id !== id));
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 0 || isNaN(minutes)) return `0h 0m`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const waterFillPercentage = isClient && waterGoal > 0 ? (waterCount / waterGoal) * 100 : 0;
    
    if (!isClient) return null;

    return (
        <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Water Tracker Card */}
                <Card className="bg-card border-4 border-foreground relative overflow-hidden" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                     <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500/80 transition-all duration-1000 ease-in-out"
                        style={{ height: `${waterFillPercentage}%` }}
                    ></div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="font-headline text-2xl text-accent flex items-center gap-2">
                            <Droplet className="w-8 h-8"/>
                            Water Tracker
                        </CardTitle>
                        <CardDescription className="text-foreground/90 font-medium">Log your daily water intake.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col items-center gap-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {Array.from({ length: waterGoal }).map((_, i) => (
                                <Glass key={i} filled={i < waterCount} />
                            ))}
                        </div>
                        <div className="text-4xl font-bold">{waterCount} / {waterGoal}</div>
                        <div className="flex items-center gap-4">
                            <Button size="icon" variant="outline" onClick={() => handleWaterChange(-1)} disabled={waterCount === 0} className="w-14 h-14 rounded-full border-4 bg-background/30 hover:bg-background/50 text-foreground border-foreground">
                                <Minus className="w-8 h-8"/>
                            </Button>
                            <Button size="icon" onClick={() => handleWaterChange(1)} disabled={waterCount >= waterGoal} className="w-20 h-20 rounded-full border-4 border-b-8 border-r-8 bg-background/90 hover:bg-background text-blue-500 border-foreground">
                                <Plus className="w-12 h-12"/>
                            </Button>
                             <div className="w-14 h-14"></div>
                        </div>
                         <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 backdrop-blur-sm">
                            <Label htmlFor="waterGoal" className="font-bold">Daily Goal:</Label>
                            <Input
                                id="waterGoal"
                                type="number"
                                value={waterGoal > 0 ? waterGoal : ''}
                                onChange={handleWaterGoalChange}
                                onBlur={handleWaterGoalBlur}
                                className="w-20 bg-background/80 border-2 border-foreground"
                                min="1"
                            />
                        </div>
                        <WaterIntakeCalendar waterLog={waterLog} waterGoal={waterGoal} />
                    </CardContent>
                </Card>

                {/* Sleep Tracker Card */}
                <Card className="bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-accent flex items-center gap-2">
                            <Bed className="w-8 h-8"/>
                            Sleep Tracker
                        </CardTitle>
                        <CardDescription>Log your sleep duration.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-secondary/50 rounded-lg border-2 border-foreground space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className='font-bold'>Bedtime</Label>
                                    <div className="flex gap-1 mt-1">
                                        <Select value={bedTimeHour} onValueChange={setBedTimeHour}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hours12.map(h => <SelectItem key={`bed-h-${h}`} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={bedTimeMinute} onValueChange={setBedTimeMinute}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {minutes.map(m => <SelectItem key={`bed-m-${m}`} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                         <Select value={bedTimePeriod} onValueChange={setBedTimePeriod}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {periods.map(p => <SelectItem key={`bed-p-${p}`} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label className='font-bold'>Wake-up Time</Label>
                                    <div className="flex gap-1 mt-1">
                                        <Select value={wakeTimeHour} onValueChange={setWakeTimeHour}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hours12.map(h => <SelectItem key={`wake-h-${h}`} value={h}>{h}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={wakeTimeMinute} onValueChange={setWakeTimeMinute}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {minutes.map(m => <SelectItem key={`wake-m-${m}`} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Select value={wakeTimePeriod} onValueChange={setWakeTimePeriod}>
                                            <SelectTrigger className="bg-background border-2 border-foreground focus:ring-accent w-1/3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {periods.map(p => <SelectItem key={`wake-p-${p}`} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleLogSleep} className="w-full text-lg text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg hover:bg-primary/90 active:border-b-2 active:border-r-2">Log Sleep</Button>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">Recent Sleep Log</h4>
                            <div className="w-full max-h-48 overflow-y-auto pr-2 rounded-lg border-2 border-foreground">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Bedtime</TableHead>
                                            <TableHead>Wake-up</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sleepLog.length > 0 ? (
                                            sleepLog.map(entry => (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="font-medium">{format(parseISO(entry.date), 'EEE, d MMM')}</TableCell>
                                                    <TableCell>{entry.bedTime}</TableCell>
                                                    <TableCell>{entry.wakeTime}</TableCell>
                                                    <TableCell className="font-bold text-primary">{formatDuration(entry.duration)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => deleteSleepEntry(entry.id)} className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No sleep logged yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        {sleepLog.length > 0 && <SleepCalendar sleepLog={sleepLog} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
