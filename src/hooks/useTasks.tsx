
import { useState, useEffect } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly' | 'weekdays';
    interval: number;
    weekdays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  scheduledDate?: Date;
  completed: boolean;
  createdAt: Date;
  color: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('schedule-sync-tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
        createdAt: new Date(task.createdAt),
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('schedule-sync-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const scheduleTask = (id: string, dateTime: Date) => {
    updateTask(id, { scheduledDate: dateTime });
  };

  const unscheduleTask = (id: string) => {
    updateTask(id, { scheduledDate: undefined });
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    scheduleTask,
    unscheduleTask,
  };
};
