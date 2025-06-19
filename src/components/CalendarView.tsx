
import { useState } from "react";
import { Task } from "@/hooks/useTasks";
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, addDays, subDays, startOfDay, addMinutes, isSameDay } from "date-fns";

interface CalendarViewProps {
  tasks: Task[];
  onScheduleTask: (taskId: string, dateTime: Date) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

export const CalendarView = ({ tasks, onScheduleTask, onEditTask, onCompleteTask }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const scheduledTasks = tasks.filter(task => 
    task.scheduledDate && isSameDay(task.scheduledDate, currentDate)
  );

  const unscheduledTasks = tasks.filter(task => !task.scheduledDate && !task.completed);

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      dateTime: addMinutes(startOfDay(currentDate), hour * 60),
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

  return (
    <div className="space-y-4">
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
                className="flex-shrink-0 p-3 bg-blue-50 border-blue-200 cursor-move min-w-[150px]"
              >
                <div className="text-sm font-medium text-blue-900 truncate">
                  {task.title}
                </div>
                <div className="text-xs text-blue-600 flex items-center gap-1 mt-1">
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
              <div className="w-16 text-sm text-gray-500 text-right">
                {slot.time}
              </div>
              
              <div className="flex-1">
                {existingTask ? (
                  <Card className="p-3 bg-green-50 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-900">
                          {existingTask.title}
                        </div>
                        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {existingTask.duration} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCompleteTask(existingTask.id)}
                          className="text-green-600 hover:text-green-700 p-1 h-8 w-8"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
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
