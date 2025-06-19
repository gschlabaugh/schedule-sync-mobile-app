
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

const getContrastColor = (backgroundColor: string) => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

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
  const [previewDuration, setPreviewDuration] = useState<number | null>(null);
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
      setPreviewDuration(task.duration);
    }
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizing) return;
    
    const deltaY = e.clientY - resizeStartY.current;
    const minutesPerPixel = 2;
    const deltaMinutes = Math.round(deltaY * minutesPerPixel);
    
    let newDuration = originalDuration.current;
    if (resizing.edge === 'bottom') {
      newDuration = Math.max(15, originalDuration.current + deltaMinutes);
    } else {
      newDuration = Math.max(15, originalDuration.current - deltaMinutes);
    }
    
    setPreviewDuration(newDuration);
  };

  const handleResizeEnd = () => {
    if (resizing && previewDuration !== null) {
      onUpdateTask(resizing.taskId, { duration: previewDuration });
    }
    setResizing(null);
    setPreviewDuration(null);
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
            {unscheduledTasks.map((task) => {
              const textColor = getContrastColor(task.color);
              return (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onEditTask(task)}
                  className={`flex-shrink-0 p-3 border-2 cursor-move min-w-[150px] ${
                    task.completed ? 'opacity-50' : ''
                  }`}
                  style={{ 
                    backgroundColor: `${task.color}40`,
                    borderColor: task.color
                  }}
                >
                  <div className="text-sm font-medium truncate" style={{ color: textColor }}>
                    {task.completed && '✓ '}{task.title}
                  </div>
                  <div className="text-xs flex items-center gap-1 mt-1" style={{ color: textColor }}>
                    <Clock className="h-3 w-3" />
                    {task.duration} min
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="space-y-1">
        {timeSlots.map((slot) => {
          const tasksAtTime = getTasksAtTime(slot.dateTime);
          
          return (
            <div
              key={slot.time}
              className="flex items-start gap-4 min-h-[60px] border-b border-gray-100 last:border-b-0"
              onDrop={(e) => handleDrop(e, slot.dateTime)}
              onDragOver={handleDragOver}
            >
              <div className="w-24 text-sm text-gray-500 text-right pt-2">
                {slot.time}
              </div>
              
              <div className="flex-1 relative">
                {tasksAtTime.length > 0 ? (
                  tasksAtTime.map(task => {
                    const taskStart = task.scheduledDate!;
                    const currentDuration = resizing?.taskId === task.id && previewDuration ? previewDuration : task.duration;
                    const taskHeight = Math.max(60, (currentDuration / 60) * 60);
                    const textColor = getContrastColor(task.color);
                    
                    // Only show if this slot is the start of the task
                    if (!isSameDay(taskStart, slot.dateTime) || taskStart.getHours() !== slot.dateTime.getHours()) {
                      return null;
                    }
                    
                    return (
                      <Card 
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`p-3 border-2 cursor-move relative group ${
                          task.completed ? 'opacity-75 line-through' : ''
                        }`}
                        style={{ 
                          backgroundColor: task.color,
                          borderColor: task.color,
                          height: `${taskHeight}px`
                        }}
                      >
                        {/* Resize handles */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
                          onMouseDown={(e) => handleResizeStart(e, task.id, 'top')}
                        />
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
                          onMouseDown={(e) => handleResizeStart(e, task.id, 'bottom')}
                        />
                        
                        {/* Duration preview during resize */}
                        {resizing?.taskId === task.id && previewDuration && (
                          <div 
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs"
                          >
                            {Math.floor(previewDuration / 60)}h {previewDuration % 60}m
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between h-full">
                          <div className="flex-1" onClick={() => onEditTask(task)}>
                            <div className="text-sm font-medium" style={{ color: textColor }}>
                              {task.completed && '✓ '}{task.title}
                            </div>
                            <div className="text-xs flex items-center gap-1 mt-1" style={{ color: textColor }}>
                              <Clock className="h-3 w-3" />
                              {currentDuration} min
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCompleteTask(task.id)}
                              className="p-1 h-8 w-8"
                              style={{ color: textColor }}
                            >
                              <CheckCircle className={`h-4 w-4 ${task.completed ? 'fill-current' : ''}`} />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 h-8 w-8" style={{ color: textColor }}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem onClick={() => handleUnscheduleTask(task.id)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Unschedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </Card>
                    );
                  })
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
