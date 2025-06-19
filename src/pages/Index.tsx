
import { useState } from "react";
import { Calendar, CheckSquare, Plus } from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { CalendarView } from "@/components/CalendarView";
import { TaskEditor } from "@/components/TaskEditor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";

const Index = () => {
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { tasks, addTask, updateTask, deleteTask, scheduleTask } = useTasks();

  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskEditor(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskEditor(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setShowTaskEditor(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
  };

  const handleScheduleTask = (taskId, dateTime) => {
    scheduleTask(taskId, dateTime);
  };

  const handleCompleteTask = (taskId) => {
    updateTask(taskId, { completed: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Schedule Sync</h1>
          <Button
            onClick={handleAddTask}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
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
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Editor Modal */}
      {showTaskEditor && (
        <TaskEditor
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={() => {
            setShowTaskEditor(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
