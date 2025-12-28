import React, { useState } from 'react';
import { Task, Subtask } from '../types';
import { Clock, Calendar, Tag, ChevronDown, ChevronRight, Edit, Trash2, Timer } from 'lucide-react';
import { calculateTaskProgress, formatTime } from '../utils/task-helpers';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onStartTimer,
  isDragging,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = calculateTaskProgress(task);

  const getQuadrantColor = () => {
    if (task.importance === 'high' && task.urgency === 'urgent') return 'border-l-red-500';
    if (task.importance === 'high' && task.urgency === 'not-urgent') return 'border-l-yellow-500';
    if (task.importance === 'low' && task.urgency === 'urgent') return 'border-l-orange-500';
    return 'border-l-blue-500';
  };

  return (
    <div
      className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow ${getQuadrantColor()} ${
        isDragging ? 'opacity-50' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-500 cursor-pointer"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onStartTimer(task)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Start Pomodoro"
                >
                  <Timer className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(task.estimatedMinutes)}
              </span>
              
              {task.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}

              {task.actualMinutes > 0 && (
                <span className="text-purple-600">
                  Actual: {formatTime(task.actualMinutes)}
                </span>
              )}
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {task.subtasks.length > 0 && (
              <>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-200">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => onToggleSubtask(task.id, subtask.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 cursor-pointer"
                        />
                        <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </span>
                        <span className="text-xs text-gray-500">{formatTime(subtask.estimatedMinutes)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
