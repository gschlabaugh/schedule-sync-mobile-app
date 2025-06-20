
import React from 'react';
import { Task } from "@/hooks/useTasks";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getContrastColor } from "@/utils/colorUtils";
import { formatDuration } from "@/utils/timeUtils";

interface UnscheduledTasksListProps {
  tasks: Task[];
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onEditTask: (task: Task) => void;
}

export const UnscheduledTasksList = React.memo(({ 
  tasks, 
  onDragStart, 
  onEditTask 
}: UnscheduledTasksListProps) => {
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
});

UnscheduledTasksList.displayName = 'UnscheduledTasksList';
