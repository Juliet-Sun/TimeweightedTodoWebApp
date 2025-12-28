import React from 'react';
import { Task } from '../types';
import { TaskCard } from './task-card';
import { getQuadrant } from '../utils/task-helpers';

interface DeadlineViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
}

export function DeadlineView({
  tasks,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onStartTimer,
}: DeadlineViewProps) {
  // Group tasks by deadline
  const groupedTasks = tasks.reduce((groups, task) => {
    const deadline = task.deadline || 'No Deadline';
    if (!groups[deadline]) {
      groups[deadline] = [];
    }
    groups[deadline].push(task);
    return groups;
  }, {} as Record<string, Task[]>);

  // Sort deadlines
  const sortedDeadlines = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'No Deadline') return 1;
    if (b === 'No Deadline') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  // Sort tasks within each deadline group by quadrant priority
  const quadrantPriority = {
    'important-urgent': 1,
    'important-not-urgent': 2,
    'not-important-urgent': 3,
    'not-important-not-urgent': 4,
  };

  sortedDeadlines.forEach(deadline => {
    groupedTasks[deadline].sort((a, b) => {
      return quadrantPriority[getQuadrant(a)] - quadrantPriority[getQuadrant(b)];
    });
  });

  const getDeadlineStatus = (deadline: string) => {
    if (deadline === 'No Deadline') return { color: 'bg-gray-100 border-gray-300', status: '' };
    
    const date = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(date);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { color: 'bg-red-100 border-red-400', status: 'Overdue' };
    } else if (diffDays === 0) {
      return { color: 'bg-orange-100 border-orange-400', status: 'Due Today' };
    } else if (diffDays <= 3) {
      return { color: 'bg-yellow-100 border-yellow-400', status: `${diffDays} days left` };
    } else if (diffDays <= 7) {
      return { color: 'bg-blue-100 border-blue-400', status: `${diffDays} days left` };
    } else {
      return { color: 'bg-green-100 border-green-400', status: `${diffDays} days left` };
    }
  };

  return (
    <div className="space-y-6">
      {sortedDeadlines.map(deadline => {
        const { color, status } = getDeadlineStatus(deadline);
        const tasksInGroup = groupedTasks[deadline];

        return (
          <div key={deadline} className={`rounded-lg border-2 p-4 ${color}`}>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3>
                  {deadline === 'No Deadline'
                    ? 'No Deadline'
                    : new Date(deadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                </h3>
                {status && (
                  <span className="px-3 py-1 bg-white bg-opacity-50 rounded-full text-sm">
                    {status}
                  </span>
                )}
              </div>
              <p className="text-sm opacity-80 mt-1">{tasksInGroup.length} tasks</p>
            </div>

            <div className="space-y-3">
              {tasksInGroup.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStartTimer={onStartTimer}
                />
              ))}
            </div>
          </div>
        );
      })}

      {sortedDeadlines.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No tasks available. Create your first task!
        </div>
      )}
    </div>
  );
}
