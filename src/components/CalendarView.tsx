
import { useState, useRef } from "react";
import { Task } from "@/hooks/useTasks";
import { addDays, subDays, startOfDay, addMinutes, isSameDay } from "date-fns";
import { TimeSlot } from "@/components/calendar/TimeSlot";
import { ScheduledTask } from "@/components/calendar/ScheduledTask";
import { UnscheduledTasksList } from "@/components/calendar/UnscheduledTasksList";
import { DateNavigation } from "@/components/calendar/DateNavigation";

interface CalendarViewProps {
  tasks: Task[];
  onScheduleTask: (taskId: string, dateTime: Date) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (dateTime?: Date) => void;
}

export const CalendarView = ({ 
  tasks, 
  onScheduleTask, 
  onEditTask, 
  onCompleteTask, 
  onUnscheduleTask,
  onUpdateTask,
  onCreateTask
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resizing, setResizing] = useState<{ taskId: string; edge: 'top' | 'bottom' } | null>(null);
  const [previewDuration, setPreviewDuration] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<{ taskId: string; dateTime: Date } | null>(null);
  const resizeStartY = useRef<number>(0);
  const originalDuration = useRef<number>(0);

  const scheduledTasks = tasks.filter(task => 
    task.scheduledDate && isSameDay(task.scheduledDate, currentDate)
  );

  const unscheduledTasks = tasks.filter(task => !task.scheduledDate && !task.completed);

  // Generate time slots from 6:00 AM to 11:00 PM
  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minutes = (i % 2) * 30;
    const date = addMinutes(startOfDay(currentDate), hour * 60 + minutes);
    const timeLabel = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return {
      time: timeLabel,
      dateTime: date,
    };
  });

  const getTasksAtTime = (dateTime: Date) => {
    return scheduledTasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskStart = task.scheduledDate;
      const taskEnd = addMinutes(taskStart, task.duration);
      return dateTime >= taskStart && dateTime < taskEnd;
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/task-source', task.scheduledDate ? 'scheduled' : 'unscheduled');
  };

  const handleDragOver = (e: React.DragEvent, dateTime: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      setDragPreview({ taskId, dateTime });
    }
  };

  const handleDragLeave = () => {
    setDragPreview(null);
  };

  const handleDrop = (e: React.DragEvent, dateTime: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onScheduleTask(taskId, dateTime);
    }
    setDragPreview(null);
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    e.preventDefault();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setResizing({ taskId, edge });
      resizeStartY.current = e.clientY;
      originalDuration.current = task.duration;
      setPreviewDuration(task.duration);
    }
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing) return;
    
    const deltaY = e.clientY - resizeStartY.current;
    const minutesPerPixel = 30 / 80;
    const deltaMinutes = Math.round(deltaY * minutesPerPixel / 30) * 30;
    
    let newDuration = originalDuration.current;
    if (resizing.edge === 'bottom') {
      newDuration = Math.max(30, Math.min(480, originalDuration.current + deltaMinutes));
    } else {
      newDuration = Math.max(30, Math.min(480, originalDuration.current - deltaMinutes));
    }
    
    setPreviewDuration(newDuration);
  };

  const handleResizeEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resizing && previewDuration !== null) {
      onUpdateTask(resizing.taskId, { duration: previewDuration });
    }
    setResizing(null);
    setPreviewDuration(null);
  };

  const handleSlotClick = (dateTime: Date) => {
    onCreateTask(dateTime);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div 
      className="space-y-4"
      onMouseMove={handleResizeMove}
      onMouseUp={handleResizeEnd}
    >
      <DateNavigation
        currentDate={currentDate}
        onPreviousDay={() => setCurrentDate(subDays(currentDate, 1))}
        onNextDay={() => setCurrentDate(addDays(currentDate, 1))}
        onToday={handleToday}
      />

      <UnscheduledTasksList
        tasks={unscheduledTasks}
        onDragStart={handleDragStart}
        onEditTask={onEditTask}
      />

      <div className="space-y-0">
        {timeSlots.map((slot) => {
          const tasksAtTime = getTasksAtTime(slot.dateTime);
          
          return (
            <TimeSlot
              key={slot.time}
              time={slot.time}
              dateTime={slot.dateTime}
              tasksAtTime={tasksAtTime}
              dragPreview={dragPreview}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onSlotClick={handleSlotClick}
            >
              {tasksAtTime.map(task => (
                <ScheduledTask
                  key={task.id}
                  task={task}
                  slot={slot}
                  resizing={resizing}
                  previewDuration={previewDuration}
                  onDragStart={handleDragStart}
                  onEditTask={onEditTask}
                  onCompleteTask={onCompleteTask}
                  onUnscheduleTask={onUnscheduleTask}
                  onResizeStart={handleResizeStart}
                />
              ))}
            </TimeSlot>
          );
        })}
      </div>
    </div>
  );
};
