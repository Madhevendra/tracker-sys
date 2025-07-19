
"use client";

import { useState, useMemo } from 'react';
import type { Event, Task } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { PlusIcon } from './icons';
import { Checkbox } from './ui/checkbox';
import { Pen, Trash2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface EventDetailsProps {
  event: Event;
  onUpdateEvent: (event: Event) => void;
}

export default function EventDetails({ event, onUpdateEvent }: EventDetailsProps) {
  const [notes, setNotes] = useState(event.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tasks, setTasks] = useState(event.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');

  const taskProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.completed).length;
    return (completedTasks / tasks.length) * 100;
  }, [tasks]);

  const handleNotesSave = () => {
    onUpdateEvent({ ...event, notes });
    setIsEditingNotes(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    onUpdateEvent({ ...event, tasks: updatedTasks });
    setNewTaskText('');
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    onUpdateEvent({ ...event, tasks: updatedTasks });
  };
  
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onUpdateEvent({ ...event, tasks: updatedTasks });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="font-headline text-2xl text-accent">Notes</CardTitle>
            <CardDescription>Keep track of important details.</CardDescription>
          </div>
          {!isEditingNotes && (
            <Button variant="ghost" size="icon" onClick={() => setIsEditingNotes(true)}>
              <Pen className="w-5 h-5" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] bg-background border-2 border-foreground"
                placeholder="Add your notes here..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => {
                    setNotes(event.notes || '');
                    setIsEditingNotes(false);
                }}>Cancel</Button>
                <Button onClick={handleNotesSave}>Save Notes</Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert min-h-[200px] p-4 rounded-md bg-secondary/30 border-2 border-dashed border-foreground/30 whitespace-pre-wrap">
              {notes || <p className="text-muted-foreground italic">No notes added yet. Click the edit icon to add some.</p>}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card border-4 border-foreground" style={{boxShadow: '6px 6px 0 0 hsl(var(--foreground))'}}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-accent">To-Do List</CardTitle>
          <CardDescription>Break down your planning into tasks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <div className="w-full bg-secondary/30 rounded-full border-2 border-foreground p-1">
                    <Progress value={taskProgress} className="h-4 rounded-full" />
                </div>
                <p className="text-sm text-right font-bold text-primary">{taskProgress.toFixed(0)}% Complete</p>
            </div>
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="bg-background border-2 border-foreground"
            />
            <Button type="submit" className="text-primary-foreground bg-primary border-2 border-b-4 border-r-4 border-primary-foreground rounded-lg hover:bg-primary/90 active:border-b-2 active:border-r-2 px-4">
                <PlusIcon className="w-5 h-5" />
            </Button>
          </form>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 group">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task.id)}
                />
                <label htmlFor={`task-${task.id}`} className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.text}
                </label>
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-destructive/20 hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No tasks yet. Add one above to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
