
export const formatDuration = (minutes: number): string => {
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

export const isTaskAtSlot = (taskDate: Date, slotDate: Date): boolean => {
  return taskDate.getTime() === slotDate.getTime();
};

export const isSameTimeSlot = (date1: Date, date2: Date): boolean => {
  return date1.getHours() === date2.getHours() && 
         date1.getMinutes() === date2.getMinutes();
};

export const calculateTaskPosition = (
  tasksAtTime: any[], 
  currentTaskId: string
): { left: string; width: string; zIndex: number } => {
  const taskIndex = tasksAtTime.findIndex(task => task.id === currentTaskId);
  const totalTasks = tasksAtTime.length;
  
  if (totalTasks === 1) {
    return { left: '0%', width: '100%', zIndex: 10 };
  }
  
  const widthPerTask = 100 / totalTasks;
  const leftPosition = taskIndex * widthPerTask;
  
  return {
    left: `${leftPosition}%`,
    width: `${widthPerTask}%`,
    zIndex: 10 + taskIndex
  };
};
