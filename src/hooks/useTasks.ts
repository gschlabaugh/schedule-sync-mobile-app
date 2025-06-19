
import { useState, useEffect } from "react";
import { startOfDay, isSameDay, addWeeks, addDays, addMonths, format } from "date-fns";

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
  completedAt?: Date;
  createdAt: Date;
  color: string;
  isRecurringInstance?: boolean;
  parentTaskId?: string; // for recurring instances
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
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('schedule-sync-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Generate recurring task instances for today only
  useEffect(() => {
    const today = startOfDay(new Date());
    const recurringTasks = tasks.filter(task => 
      task.recurrence && !task.isRecurringInstance
    );

    recurringTasks.forEach(parentTask => {
      const shouldCreateInstance = shouldCreateRecurringInstance(parentTask, today);
      const todayInstanceId = `${parentTask.id}-${format(today, 'yyyy-MM-dd')}`;
      const existingInstance = tasks.find(task => task.id === todayInstanceId);

      if (shouldCreateInstance && !existingInstance) {
        const instance: Task = {
          ...parentTask,
          id: todayInstanceId,
          parentTaskId: parentTask.id,
          isRecurringInstance: true,
          scheduledDate: undefined,
          completed: false,
          completedAt: undefined,
        };
        setTasks(prev => [...prev, instance]);
      }
    });
  }, []);

  const shouldCreateRecurringInstance = (task: Task, date: Date): boolean => {
    if (!task.recurrence) return false;

    const dayOfWeek = date.getDay();
    
    switch (task.recurrence.type) {
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === 1; // Create on Mondays for weekly tasks
      case 'monthly':
        return date.getDate() === 1; // Create on first of month
      case 'weekdays':
        return task.recurrence.weekdays?.includes(dayOfWeek) || false;
      default:
        return false;
    }
  };

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
    setTasks(prev => prev.filter(task => task.id !== id && task.parentTaskId !== id));
  };

  const scheduleTask = (id: string, dateTime: Date) => {
    updateTask(id, { scheduledDate: dateTime });
  };

  const unscheduleTask = (id: string) => {
    updateTask(id, { scheduledDate: undefined });
  };

  const completeTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { 
        completed: !task.completed, 
        completedAt: !task.completed ? new Date() : undefined 
      });
    }
  };

  const getTaskStats = () => {
    const allTasks = tasks.filter(task => !task.isRecurringInstance);
    const completedTasks = tasks.filter(task => task.completed);
    const scheduledTasks = tasks.filter(task => task.scheduledDate);
    
    const taskStats = allTasks.map(task => {
      const instances = tasks.filter(t => t.parentTaskId === task.id || t.id === task.id);
      const completedInstances = instances.filter(t => t.completed);
      const scheduledInstances = instances.filter(t => t.scheduledDate);
      
      return {
        task,
        totalInstances: instances.length,
        completedInstances: completedInstances.length,
        scheduledInstances: scheduledInstances.length,
        completionRate: instances.length > 0 ? completedInstances.length / instances.length : 0,
      };
    });

    return {
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      scheduledTasks: scheduledTasks.length,
      taskStats,
    };
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    scheduleTask,
    unscheduleTask,
    completeTask,
    getTaskStats,
  };
};
