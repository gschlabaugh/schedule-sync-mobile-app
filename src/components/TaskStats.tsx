
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, CheckCircle, Calendar, TrendingUp } from "lucide-react";

interface TaskStatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    scheduledTasks: number;
    taskStats: Array<{
      task: any;
      totalInstances: number;
      completedInstances: number;
      scheduledInstances: number;
      completionRate: number;
    }>;
  };
}

export const TaskStats = ({ stats }: TaskStatsProps) => {
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const schedulingRate = stats.totalTasks > 0 ? (stats.scheduledTasks / stats.totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Task Statistics</h3>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduledTasks}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Completion Rate</span>
              <span className="font-medium">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Scheduling Rate</span>
              <span className="font-medium">{schedulingRate.toFixed(1)}%</span>
            </div>
            <Progress value={schedulingRate} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Individual Task Stats */}
      <Card className="p-4">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Task Performance</h4>
        <div className="space-y-3">
          {stats.taskStats.slice(0, 10).map(({ task, totalInstances, completedInstances, completionRate }) => (
            <div key={task.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="text-sm font-medium truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{completedInstances}/{totalInstances}</span>
                  <span className="font-medium">{(completionRate * 100).toFixed(0)}%</span>
                </div>
              </div>
              <Progress value={completionRate * 100} className="h-1" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
