
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DateNavigationProps {
  currentDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  title?: string;
}

export const DateNavigation = ({ 
  currentDate, 
  onPreviousDay, 
  onNextDay, 
  onToday,
  title 
}: DateNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreviousDay}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">
          {title || format(currentDate, 'EEEE, MMMM d')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Today
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNextDay}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
