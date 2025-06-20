
import { Task } from "@/hooks/useTasks";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UnscheduledTasksListProps {
  tasks: Task[];
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onEditTask: (task: Task) => void;
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

export const UnscheduledTasksList = ({ tasks, onDragStart, onEditTask }: UnscheduledTasksListProps) => {
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Drag to schedule:</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tasks.map((task) => {
          const textColor = getContrastColor(task.color);
          return (
            <Card
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task)}
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
                {formatDuration(task.duration)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
