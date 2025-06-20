
import React, { useMemo } from 'react';
import { Task } from "@/hooks/useTasks";
import { Clock, CheckCircle, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, addMinutes, isSameDay } from "date-fns";
import { getContrastColor } from "@/utils/colorUtils";
import { formatDuration, calculateTaskPosition } from "@/utils/timeUtils";

interface ScheduledTaskProps {
  task: Task;
  slot: { dateTime: Date };
  tasksAtTime: Task[];
  resizing: { taskId: string; edge: 'top' | 'bottom' } | null;
  previewDuration: number | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
  onResizeStart: (e: React.MouseEvent, taskId: string, edge: 'top' | 'bottom') => void;
}

export const ScheduledTask = React.memo(({
  task,
  slot,
  tasksAtTime,
  resizing,
  previewDuration,
  onDragStart,
  onEditTask,
  onCompleteTask,
  onUnscheduleTask,
  onResizeStart
}: ScheduledTaskProps) => {
  const taskStart = task.scheduledDate!;
  const currentDuration = resizing?.taskId === task.id && previewDuration ? previewDuration : task.duration;
  
  const textColor = useMemo(() => getContrastColor(task.color), [task.color]);
  const taskHeight = useMemo(() => Math.max(80, (currentDuration / 30) * 80), [currentDuration]);
  const taskEnd = useMemo(() => addMinutes(taskStart, currentDuration), [taskStart, currentDuration]);
  
  // Calculate position for overlapping tasks
  const position = useMemo(() => 
    calculateTaskPosition(tasksAtTime, task.id), 
    [tasksAtTime, task.id]
  );
  
  // Only show if this slot is the start of the task
  if (!isSameDay(taskStart, slot.dateTime) || 
      taskStart.getHours() !== slot.dateTime.getHours() ||
      taskStart.getMinutes() !== slot.dateTime.getMinutes()) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onEditTask(task);
        break;
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onUnscheduleTask(task.id);
        break;
      case 'c':
      case 'C':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onCompleteTask(task.id);
        }
        break;
    }
  };
  
  return (
    <Card 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`p-2 border-2 cursor-move relative group ${
        task.completed ? 'opacity-75 line-through' : ''
      } absolute top-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      style={{ 
        backgroundColor: task.color,
        borderColor: task.color,
        height: `${taskHeight}px`,
        left: position.left,
        width: position.width,
        zIndex: position.zIndex
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}, Duration: ${formatDuration(currentDuration)}, ${task.completed ? 'Completed' : 'Pending'}`}
      aria-describedby={`task-${task.id}-description`}
      onKeyDown={handleKeyDown}
    >
      {/* Resize handles */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
        onMouseDown={(e) => onResizeStart(e, task.id, 'top')}
        role="button"
        tabIndex={0}
        aria-label="Resize task from top"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onResizeStart(e as any, task.id, 'top');
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
        onMouseDown={(e) => onResizeStart(e, task.id, 'bottom')}
        role="button"
        tabIndex={0}
        aria-label="Resize task from bottom"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onResizeStart(e as any, task.id, 'bottom');
        }}
      />
      
      {/* Duration preview during resize */}
      {resizing?.taskId === task.id && previewDuration && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs z-20"
        >
          {formatDuration(previewDuration)}
        </div>
      )}
      
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0" onClick={() => onEditTask(task)}>
          <div className="text-xs font-medium truncate" style={{ color: textColor }}>
            {task.completed && '✓ '}{task.title}
          </div>
          <div 
            id={`task-${task.id}-description`}
            className="text-xs mt-1" 
            style={{ color: textColor }}
          >
            {format(taskStart, 'h:mm a')} - {format(taskEnd, 'h:mm a')}
          </div>
          <div className="text-xs flex items-center gap-1 mt-1" style={{ color: textColor }}>
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatDuration(currentDuration)}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCompleteTask(task.id)}
            className="p-1 h-6 w-6"
            style={{ color: textColor }}
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            <CheckCircle className={`h-3 w-3 ${task.completed ? 'fill-current' : ''}`} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-6 w-6" style={{ color: textColor }}>
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={() => onUnscheduleTask(task.id)}>
                <X className="h-4 w-4 mr-2" />
                Unschedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
});

ScheduledTask.displayName = 'ScheduledTask';
