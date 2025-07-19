
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bed, Droplet, Minus, Plus, Trash2, BarChart3, Trophy, Repeat } from 'lucide-react';
import { format, differenceInMinutes, parse, formatISO, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CircularProgress } from './CircularProgress';

interface SleepEntry {
  id: string;
  date: string;
  bedTime: string; // "h:mm a"
  wakeTime: string; // "h:mm a"
  duration: number; // in minutes
}

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
    const [waterCount, setWaterCount] = useState(0);
    const [waterGoal, setWaterGoal] = useState(8);

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
            const today = format(new Date(), 'yyyy-MM-dd');
            const storedWater = localStorage.getItem(`pixel-water-${today}`);
            if (storedWater) {
                setWaterCount(JSON.parse(storedWater));
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
            const today = format(new Date(), 'yyyy-MM-dd');
            localStorage.setItem(`pixel-water-${today}`, JSON.stringify(waterCount));
            localStorage.setItem('pixel-water-goal', JSON.stringify(waterGoal));
            localStorage.setItem('pixel-sleep-log', JSON.stringify(sleepLog));
        }
    }, [waterCount, waterGoal, sleepLog, isClient]);

    const handleWaterChange = (amount: number) => {
        setWaterCount(prev => Math.max(0, prev + amount));
    };
    
    const handleWaterGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parsedValue = parseInt(value, 10);
        if (value === "") {
            setWaterGoal(0);
        } else if (!isNaN(parsedValue)) {
            setWaterGoal(parsedValue);
        }
    };

    const handleWaterGoalBlur = () => {
        if (waterGoal < 1) {
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
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const waterFillPercentage = isClient && waterGoal > 0 ? (waterCount / waterGoal) * 100 : 0;

    const sleepStats = useMemo(() => {
        const recentLog = sleepLog.slice(0, 7);
        if (recentLog.length === 0) {
            return { average: 0, best: 0, consistency: 0 };
        }

        // Average and Best Sleep
        const totalDuration = recentLog.reduce((sum, entry) => sum + entry.duration, 0);
        const average = totalDuration / recentLog.length;
        const best = Math.max(...recentLog.map(entry => entry.duration));

        // Consistency Score
        let consistency = 0;
        if (recentLog.length > 1) {
            const bedTimesInMinutes = recentLog.map(entry => {
                const time = parse(entry.bedTime, 'h:mm a', new Date());
                let minutes = time.getHours() * 60 + time.getMinutes();
                // Handle times past midnight (e.g. 1 AM is smaller than 11 PM)
                if (minutes < 12 * 60) minutes += 24 * 60;
                return minutes;
            });
            const meanBedTime = bedTimesInMinutes.reduce((a, b) => a + b) / bedTimesInMinutes.length;
            const stdDev = Math.sqrt(bedTimesInMinutes.map(x => Math.pow(x - meanBedTime, 2)).reduce((a, b) => a + b) / bedTimesInMinutes.length);
            
            // Normalize std dev to a 0-100 score. 60 min deviation is acceptable (around 75% score).
            consistency = Math.max(0, 100 - (stdDev / 90) * 100);
        } else {
             consistency = 100;
        }

        return { average, best, consistency: Math.round(consistency) };

    }, [sleepLog]);
    
    const sleepGoalMinutes = 8 * 60; // 8 hours


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
                        <CardDescription className="text-muted-foreground/90 font-medium">Log your daily water intake.</CardDescription>
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
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                               {sleepLog.length > 0 ? (
                                 sleepLog.map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center bg-secondary/30 p-3 rounded-md">
                                        <div>
                                            <p className="font-bold">{format(parseISO(entry.date), 'EEE, MMM d')}</p>
                                            <p className="text-sm text-muted-foreground">{entry.bedTime} - {entry.wakeTime}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-bold text-lg text-primary">{formatDuration(entry.duration)}</p>
                                            <Button variant="ghost" size="icon" onClick={() => deleteSleepEntry(entry.id)} className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                ))
                               ) : (
                                 <p className="text-muted-foreground text-center py-4">No sleep logged yet.</p>
                               )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {sleepLog.length > 0 && (
                <div>
                     <h3 className="text-2xl font-bold font-headline text-accent text-center mb-6">Your 7-Day Sleep Insights</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="flex flex-col items-center gap-2">
                            <CircularProgress 
                                value={(sleepStats.average / sleepGoalMinutes) * 100}
                                size={150}
                                strokeWidth={15}
                            >
                                <BarChart3 className="w-8 h-8 text-muted-foreground" />
                            </CircularProgress>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{formatDuration(sleepStats.average)}</p>
                                <p className="text-sm font-medium text-muted-foreground">7-Day Average</p>
                            </div>
                        </div>

                         <div className="flex flex-col items-center gap-2">
                             <CircularProgress
                                value={(sleepStats.best / sleepGoalMinutes) * 100}
                                size={150}
                                strokeWidth={15}
                             >
                                <Trophy className="w-8 h-8 text-muted-foreground" />
                             </CircularProgress>
                             <div className="text-center">
                                <p className="text-3xl font-bold">{formatDuration(sleepStats.best)}</p>
                                <p className="text-sm font-medium text-muted-foreground">Best Night</p>
                            </div>
                        </div>

                         <div className="flex flex-col items-center gap-2">
                             <CircularProgress
                                value={sleepStats.consistency}
                                size={150}
                                strokeWidth={15}
                            >
                                <Repeat className="w-8 h-8 text-muted-foreground" />
                             </CircularProgress>
                            <div className="text-center">
                                <p className="text-3xl font-bold">{sleepStats.consistency}%</p>
                                <p className="text-sm font-medium text-muted-foreground">Bedtime Consistency</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
