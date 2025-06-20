
import { Task } from "@/hooks/useTasks";
import { addMinutes, format, isSameDay } from "date-fns";

interface TimeSlotProps {
  time: string;
  dateTime: Date;
  tasksAtTime: Task[];
  dragPreview: { taskId: string; dateTime: Date } | null;
  onDrop: (e: React.DragEvent, dateTime: Date) => void;
  onDragOver: (e: React.DragEvent, dateTime: Date) => void;
  onDragLeave: () => void;
  onSlotClick: (dateTime: Date) => void;
  children: React.ReactNode;
}

export const TimeSlot = ({
  time,
  dateTime,
  tasksAtTime,
  dragPreview,
  onDrop,
  onDragOver,
  onDragLeave,
  onSlotClick,
  children
}: TimeSlotProps) => {
  const isPreviewSlot = dragPreview && 
    isSameDay(dragPreview.dateTime, dateTime) && 
    dragPreview.dateTime.getHours() === dateTime.getHours() &&
    dragPreview.dateTime.getMinutes() === dateTime.getMinutes();

  return (
    <div
      className="flex items-start gap-4 min-h-[80px] border-b border-gray-100 last:border-b-0"
      onDrop={(e) => onDrop(e, dateTime)}
      onDragOver={(e) => onDragOver(e, dateTime)}
      onDragLeave={onDragLeave}
    >
      <div className="w-32 text-sm text-gray-500 text-right pt-2">
        {time}
      </div>
      
      <div className="flex-1 relative min-h-[80px]">
        {tasksAtTime.length > 0 ? (
          children
        ) : (
          <div 
            className={`h-[76px] border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-gray-400 cursor-pointer hover:bg-gray-50 ${
              isPreviewSlot ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => onSlotClick(dateTime)}
          >
            {isPreviewSlot ? 'Drop here' : 'Click to create task'}
          </div>
        )}
        
        {/* Preview for drag and drop */}
        {isPreviewSlot && dragPreview && (
          <div className="absolute inset-0 border-2 border-blue-400 bg-blue-100 bg-opacity-50 rounded-lg pointer-events-none">
            <div className="p-2 text-xs text-blue-700">
              Drop task here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
