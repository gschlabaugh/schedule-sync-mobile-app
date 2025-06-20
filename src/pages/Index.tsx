import { useState } from "react";
import { Calendar, CheckSquare, BarChart3, List, CalendarDays } from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { CalendarView } from "@/components/CalendarView";
import { MonthlyView } from "@/components/MonthlyView";
import { ScheduledTasks } from "@/components/ScheduledTasks";
import { TaskStats } from "@/components/TaskStats";
import { TaskEditor } from "@/components/TaskEditor";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const { tasks, addTask, updateTask, deleteTask, scheduleTask, unscheduleTask, completeTask, getTaskStats } = useTasks();

  const handleAddTask = () => {
    setEditingTask(null);
    setScheduledDateTime(null);
    setShowTaskEditor(true);
  };

  const handleCreateTask = (dateTime?: Date) => {
    setEditingTask(null);
    setScheduledDateTime(dateTime || null);
    setShowTaskEditor(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setScheduledDateTime(null);
    setShowTaskEditor(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      const newTaskData = scheduledDateTime 
        ? { ...taskData, scheduledDate: scheduledDateTime }
        : taskData;
      addTask(newTaskData);
    }
    setShowTaskEditor(false);
    setEditingTask(null);
    setScheduledDateTime(null);
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleScheduleTask = (taskId, dateTime) => {
    scheduleTask(taskId, dateTime);
  };

  const handleCompleteTask = (taskId) => {
    completeTask(taskId);
  };

  const handleUnscheduleTask = (taskId) => {
    unscheduleTask(taskId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Schedule Sync</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-1 text-xs">
              <List className="h-3 w-3" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-1 text-xs">
              <CalendarDays className="h-3 w-3" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-1 text-xs">
              <CheckSquare className="h-3 w-3" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <TaskList
              tasks={tasks.filter(task => !task.scheduledDate && !task.completed)}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onCompleteTask={handleCompleteTask}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView
              tasks={tasks}
              onScheduleTask={handleScheduleTask}
              onEditTask={handleEditTask}
              onCompleteTask={handleCompleteTask}
              onUnscheduleTask={handleUnscheduleTask}
              onUpdateTask={updateTask}
              onCreateTask={handleCreateTask}
            />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <MonthlyView
              tasks={tasks}
              onScheduleTask={handleScheduleTask}
              onEditTask={handleEditTask}
            />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <ScheduledTasks
              tasks={tasks.filter(task => task.scheduledDate)}
              onEditTask={handleEditTask}
              onCompleteTask={handleCompleteTask}
              onUnscheduleTask={handleUnscheduleTask}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <TaskStats stats={getTaskStats()} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleAddTask} />

      {/* Task Editor Modal */}
      {showTaskEditor && (
        <TaskEditor
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskEditor(false);
            setEditingTask(null);
            setScheduledDateTime(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
