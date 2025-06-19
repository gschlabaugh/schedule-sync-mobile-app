
import { useState, useEffect } from "react";
import { Task } from "@/hooks/useTasks";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface TaskEditorProps {
  task?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const TaskEditor = ({ task, onSave, onCancel }: TaskEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [recurrenceType, setRecurrenceType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDuration(task.duration);
      setRecurrenceType(task.recurrence?.type || 'none');
      setRecurrenceInterval(task.recurrence?.interval || 1);
    }
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) return;

    const taskData: Omit<Task, 'id' | 'completed' | 'createdAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration,
      scheduledDate: task?.scheduledDate,
      recurrence: recurrenceType !== 'none' ? {
        type: recurrenceType,
        interval: recurrenceInterval,
      } : undefined,
    };

    onSave(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No recurrence</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recurrenceType !== 'none' && (
              <div>
                <Label htmlFor="interval">Every</Label>
                <Select value={recurrenceInterval.toString()} onValueChange={(value) => setRecurrenceInterval(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {recurrenceType === 'daily' ? 'day(s)' : 
                           recurrenceType === 'weekly' ? 'week(s)' : 'month(s)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              disabled={!title.trim()}
            >
              {task ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
