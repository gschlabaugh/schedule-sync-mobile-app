
import { useState } from "react";
import { Task } from "@/hooks/useTasks";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from "date-fns";

interface MonthlyViewProps {
  tasks: Task[];
  onScheduleTask: (taskId: string, dateTime: Date) => void;
  onEditTask: (task: Task) => void;
}

export const MonthlyView = ({ tasks, onScheduleTask, onEditTask }: MonthlyViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => 
      task.scheduledDate && isSameDay(task.scheduledDate, date)
    );
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      // Schedule for 9 AM by default
      const scheduleTime = new Date(date);
      scheduleTime.setHours(9, 0, 0, 0);
      onScheduleTask(taskId, scheduleTime);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {daysInMonth.map(date => {
          const dayTasks = getTasksForDay(date);
          const isToday = isSameDay(date, new Date());
          
          return (
            <Card
              key={date.toISOString()}
              className={`min-h-[80px] p-2 border ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${!isSameMonth(date, currentMonth) ? 'opacity-50' : ''}`}
              onDrop={(e) => handleDrop(e, date)}
              onDragOver={handleDragOver}
            >
              <div className="text-sm font-medium mb-1">
                {format(date, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded truncate cursor-pointer"
                    style={{ 
                      backgroundColor: `${task.color}30`,
                      color: task.color
                    }}
                    onClick={() => onEditTask(task)}
                  >
                    {task.completed && '✓ '}
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
