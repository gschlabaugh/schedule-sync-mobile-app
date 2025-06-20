
import { Task } from "@/hooks/useTasks";
import { Clock, Edit, CheckCircle, MoreVertical, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface ScheduledTasksProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
  onUnscheduleTask: (taskId: string) => void;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

export const ScheduledTasks = ({ tasks, onEditTask, onCompleteTask, onUnscheduleTask }: ScheduledTasksProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled tasks</h3>
        <p className="text-gray-500">Schedule tasks from the Tasks tab or drag them to the calendar!</p>
      </div>
    );
  }

  const sortedTasks = tasks.sort((a, b) => {
    if (!a.scheduledDate || !b.scheduledDate) return 0;
    return a.scheduledDate.getTime() - b.scheduledDate.getTime();
  });

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Scheduled Tasks</h3>
      
      {sortedTasks.map((task) => (
        <Card 
          key={task.id} 
          className={`p-4 border-2 shadow-sm ${
            task.completed ? 'opacity-75 bg-green-50' : ''
          }`}
          style={{ 
            backgroundColor: task.completed ? '#f0fdf4' : `${task.color}10`,
            borderColor: task.completed ? '#22c55e' : `${task.color}40`
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium truncate ${
                task.completed ? 'line-through text-green-700' : ''
              }`} style={{ color: task.completed ? '#15803d' : task.color }}>
                {task.completed && '✓ '}{task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {task.scheduledDate && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: task.completed ? '#15803d' : task.color }}>
                    <Calendar className="h-3 w-3" />
                    {format(task.scheduledDate, 'MMM d, h:mm a')}
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs" style={{ color: task.completed ? '#15803d' : task.color }}>
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.duration)}
                </div>
                {task.recurrence && (
                  <div 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: task.completed ? '#dcfce7' : `${task.color}20`,
                      color: task.completed ? '#15803d' : task.color
                    }}
                  >
                    {task.recurrence.type === 'weekdays' && task.recurrence.weekdays
                      ? `${task.recurrence.weekdays.length} weekdays`
                      : task.recurrence.type}
                  </div>
                )}
                {task.completed && task.completedAt && (
                  <div className="text-xs text-green-600">
                    Completed {format(task.completedAt, 'MMM d, h:mm a')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCompleteTask(task.id)}
                className="p-1 h-8 w-8"
                style={{ color: task.completed ? '#15803d' : task.color }}
              >
                <CheckCircle className={`h-4 w-4 ${task.completed ? 'fill-current' : ''}`} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  <DropdownMenuItem onClick={() => onEditTask(task)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUnscheduleTask(task.id)}>
                    <X className="h-4 w-4 mr-2" />
                    Unschedule
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
