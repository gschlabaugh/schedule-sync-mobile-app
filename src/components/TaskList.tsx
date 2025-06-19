
import { Task } from "@/hooks/useTasks";
import { Clock, Edit, Trash2, CheckCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
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

export const TaskList = ({ tasks, onEditTask, onDeleteTask, onCompleteTask }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No unscheduled tasks</h3>
        <p className="text-gray-500">Create a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const textColor = getContrastColor(task.color);
        return (
          <Card 
            key={task.id} 
            className={`p-4 border-2 shadow-sm ${task.completed ? 'opacity-75' : ''}`}
            style={{ 
              backgroundColor: `${task.color}40`,
              borderColor: task.color
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium truncate ${task.completed ? 'line-through' : ''}`} style={{ color: textColor }}>
                  {task.completed && '✓ '}{task.title}
                </h3>
                {task.description && (
                  <p className="text-xs opacity-75 mt-1 line-clamp-2" style={{ color: textColor }}>
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs" style={{ color: textColor }}>
                    <Clock className="h-3 w-3" />
                    {task.duration} min
                  </div>
                  {task.recurrence && (
                    <div 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${task.color}60`,
                        color: textColor
                      }}
                    >
                      {task.recurrence.type === 'weekdays' && task.recurrence.weekdays
                        ? `${task.recurrence.weekdays.length} weekdays`
                        : task.recurrence.type}
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
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
