import React from 'react';
import { Task } from '../types';
import { TaskCard } from './task-card';
import { Tag } from 'lucide-react';

interface TagsViewProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
}

export function TagsView({
  tasks,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onStartTimer,
}: TagsViewProps) {
  // Get all unique tags
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));
  
  // Group tasks by tag
  const groupedTasks = allTags.reduce((groups, tag) => {
    groups[tag] = tasks.filter(task => task.tags.includes(tag));
    return groups;
  }, {} as Record<string, Task[]>);

  // Tasks with no tags
  const untaggedTasks = tasks.filter(task => task.tags.length === 0);
  if (untaggedTasks.length > 0) {
    groupedTasks['Untagged'] = untaggedTasks;
  }

  const tagColors: Record<string, string> = {
    work: 'bg-blue-100 border-blue-400',
    school: 'bg-purple-100 border-purple-400',
    health: 'bg-green-100 border-green-400',
    leisure: 'bg-pink-100 border-pink-400',
    personal: 'bg-yellow-100 border-yellow-400',
    shopping: 'bg-orange-100 border-orange-400',
    Untagged: 'bg-gray-100 border-gray-400',
  };

  const getTagColor = (tag: string): string => {
    return tagColors[tag.toLowerCase()] || 'bg-indigo-100 border-indigo-400';
  };

  const sortedTags = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'Untagged') return 1;
    if (b === 'Untagged') return -1;
    return groupedTasks[b].length - groupedTasks[a].length;
  });

  return (
    <div className="space-y-6">
      {sortedTags.map(tag => {
        const tasksInGroup = groupedTasks[tag];
        const color = getTagColor(tag);

        return (
          <div key={tag} className={`rounded-lg border-2 p-4 ${color}`}>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <h3>{tag}</h3>
                <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full text-sm">
                  {tasksInGroup.length}
                </span>
              </div>
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

      {sortedTags.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No tasks available. Create your first task!
        </div>
      )}
    </div>
  );
}
