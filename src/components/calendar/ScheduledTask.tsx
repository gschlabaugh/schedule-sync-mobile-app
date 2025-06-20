
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

interface ScheduledTaskProps {
  task: Task;
  slot: { dateTime: Date };
  resizing: { taskId: string; edge: 'top' | 'bottom' } | null;
  previewDuration: number | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
  onResizeStart: (e: React.MouseEvent, taskId: string, edge: 'top' | 'bottom') => void;
}

const getContrastColor = (backgroundColor: string) => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  }
};

export const ScheduledTask = ({
  task,
  slot,
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
  const taskHeight = Math.max(80, (currentDuration / 30) * 80);
  const textColor = getContrastColor(task.color);
  const taskEnd = addMinutes(taskStart, currentDuration);
  
  // Only show if this slot is the start of the task
  if (!isSameDay(taskStart, slot.dateTime) || 
      taskStart.getHours() !== slot.dateTime.getHours() ||
      taskStart.getMinutes() !== slot.dateTime.getMinutes()) {
    return null;
  }
  
  return (
    <Card 
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`p-3 border-2 cursor-move relative group ${
        task.completed ? 'opacity-75 line-through' : ''
      } absolute top-0 left-0 right-0 z-10`}
      style={{ 
        backgroundColor: task.color,
        borderColor: task.color,
        height: `${taskHeight}px`
      }}
    >
      {/* Resize handles */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
        onMouseDown={(e) => onResizeStart(e, task.id, 'top')}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-black bg-opacity-20"
        onMouseDown={(e) => onResizeStart(e, task.id, 'bottom')}
      />
      
      {/* Duration preview during resize */}
      {resizing?.taskId === task.id && previewDuration && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs z-10"
        >
          {formatDuration(previewDuration)}
        </div>
      )}
      
      <div className="flex items-center justify-between h-full">
        <div className="flex-1" onClick={() => onEditTask(task)}>
          <div className="text-sm font-medium" style={{ color: textColor }}>
            {task.completed && '✓ '}{task.title}
          </div>
          <div className="text-xs mt-1" style={{ color: textColor }}>
            {format(taskStart, 'h:mm a')} - {format(taskEnd, 'h:mm a')}
          </div>
          <div className="text-xs flex items-center gap-1 mt-1" style={{ color: textColor }}>
            <Clock className="h-3 w-3" />
            {formatDuration(currentDuration)}
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
};
