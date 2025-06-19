import { useState, useRef } from "react";
import { Task } from "@/hooks/useTasks";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, addDays, subDays, startOfDay, addMinutes, isSameDay } from "date-fns";

interface CalendarViewProps {
  tasks: Task[];
  onScheduleTask: (taskId: string, dateTime: Date) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const CalendarView = ({ 
  tasks, 
  onScheduleTask, 
  onEditTask, 
  onCompleteTask, 
  onUnscheduleTask,
  onUpdateTask 
}: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resizing, setResizing] = useState<{ taskId: string; edge: 'top' | 'bottom' } | null>(null);
  const resizeStartY = useRef<number>(0);
  const originalDuration = useRef<number>(0);

  const scheduledTasks = tasks.filter(task => 
    task.scheduledDate && isSameDay(task.scheduledDate, currentDate)
  );

  const unscheduledTasks = tasks.filter(task => !task.scheduledDate && !task.completed);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const date = addMinutes(startOfDay(currentDate), hour * 60);
    const timeLabel = format(date, 'h:mm a');
    return {
      time: timeLabel,
      dateTime: date,
    };
  });

  const getTaskAtTime = (dateTime: Date) => {
    return scheduledTasks.find(task => {
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

  const handleDrop = (e: React.DragEvent, dateTime: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onScheduleTask(taskId, dateTime);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUnscheduleTask = (taskId: string) => {
    onUnscheduleTask(taskId);
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string, edge: 'top' | 'bottom') => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setResizing({ taskId, edge });
      resizeStartY.current = e.clientY;
      originalDuration.current = task.duration;
    }
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing) return;
    
    const deltaY = e.clientY - resizeStartY.current;
    const minutesPerPixel = 2; // Adjust sensitivity
    const deltaMinutes = Math.round(deltaY * minutesPerPixel);
    
    let newDuration = originalDuration.current;
    if (resizing.edge === 'bottom') {
      newDuration = Math.max(15, originalDuration.current + deltaMinutes);
    } else {
      newDuration = Math.max(15, originalDuration.current - deltaMinutes);
    }
    
    onUpdateTask(resizing.taskId, { duration: newDuration });
  };

  const handleResizeEnd = () => {
    setResizing(null);
  };

  return (
    <div 
      className="space-y-4"
      onMouseMove={handleResizeMove}
      onMouseUp={handleResizeEnd}
    >
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'EEEE, MMMM d')}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Drag to schedule:</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {unscheduledTasks.map((task) => (
              <Card
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onClick={() => onEditTask(task)}
                className={`flex-shrink-0 p-3 border-2 cursor-move min-w-[150px] ${
                  task.completed ? 'opacity-50' : ''
                }`}
                style={{ 
                  backgroundColor: `${task.color}20`,
                  borderColor: task.color
                }}
              >
                <div className="text-sm font-medium truncate" style={{ color: task.color }}>
                  {task.completed && '✓ '}{task.title}
                </div>
                <div className="text-xs flex items-center gap-1 mt-1" style={{ color: task.color }}>
                  <Clock className="h-3 w-3" />
                  {task.duration} min
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="space-y-1">
        {timeSlots.map((slot) => {
          const existingTask = getTaskAtTime(slot.dateTime);
          
          return (
            <div
              key={slot.time}
              className="flex items-center gap-3 min-h-[60px] border-b border-gray-100 last:border-b-0"
              onDrop={(e) => handleDrop(e, slot.dateTime)}
              onDragOver={handleDragOver}
            >
              <div className="w-20 text-sm text-gray-500 text-right">
                {slot.time}
              </div>
              
              <div className="flex-1">
                {existingTask ? (
                  <Card 
                    draggable
                    onDragStart={(e) => handleDragStart(e, existingTask)}
                    className={`p-3 border-2 cursor-move relative group ${
                      existingTask.completed ? 'opacity-75' : ''
                    }`}
                    style={{ 
                      backgroundColor: `${existingTask.color}20`,
                      borderColor: existingTask.color,
                      height: `${Math.max(60, (existingTask.duration / 60) * 60)}px`
                    }}
                  >
                    {/* Resize handles */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-gray-300"
                      onMouseDown={(e) => handleResizeStart(e, existingTask.id, 'top')}
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-gray-300"
                      onMouseDown={(e) => handleResizeStart(e, existingTask.id, 'bottom')}
                    />
                    
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1" onClick={() => onEditTask(existingTask)}>
                        <div className="text-sm font-medium" style={{ color: existingTask.color }}>
                          {existingTask.completed && '✓ '}{existingTask.title}
                        </div>
                        <div className="text-xs flex items-center gap-1 mt-1" style={{ color: existingTask.color }}>
                          <Clock className="h-3 w-3" />
                          {existingTask.duration} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCompleteTask(existingTask.id)}
                          className="p-1 h-8 w-8"
                          style={{ color: existingTask.color }}
                        >
                          <CheckCircle className={`h-4 w-4 ${existingTask.completed ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => handleUnscheduleTask(existingTask.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Unschedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="h-12 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                    Drop task here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
