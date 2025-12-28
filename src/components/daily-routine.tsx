import React, { useState } from 'react';
import { RoutineTask } from '../types';
import { Plus, Trash2, Timer, ChevronDown, ChevronUp, Edit, GripVertical } from 'lucide-react';
import { formatTime } from '../utils/task-helpers';

interface DailyRoutineProps {
  routineTasks: RoutineTask[];
  onAddRoutine: (task: Omit<RoutineTask, 'id' | 'completed'>) => void;
  onDeleteRoutine: (id: string) => void;
  onToggleRoutine: (id: string) => void;
  onStartTimer: (task: RoutineTask) => void;
  onUpdateRoutine: (id: string, task: Omit<RoutineTask, 'id' | 'completed'>) => void;
  onReorderRoutine: (id: string, newIndex: number, period: 'morning' | 'afternoon' | 'evening') => void;
}

export function DailyRoutine({
  routineTasks,
  onAddRoutine,
  onDeleteRoutine,
  onToggleRoutine,
  onStartTimer,
  onUpdateRoutine,
  onReorderRoutine,
}: DailyRoutineProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    period: 'morning' as 'morning' | 'afternoon' | 'evening',
    estimatedMinutes: 15,
  });
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.title.trim()) {
      if (editingTask) {
        onUpdateRoutine(editingTask.id, newTask);
        setEditingTask(null);
      } else {
        onAddRoutine(newTask);
      }
      setNewTask({ title: '', period: 'morning', estimatedMinutes: 15 });
      setShowForm(false);
    }
  };

  const handleEdit = (task: RoutineTask) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      period: task.period,
      estimatedMinutes: task.estimatedMinutes,
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setNewTask({ title: '', period: 'morning', estimatedMinutes: 15 });
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetTaskId: string, period: 'morning' | 'afternoon' | 'evening') => {
    e.preventDefault();
    if (!draggedTask || draggedTask === targetTaskId) return;

    const periodTasks = getTasksByPeriod(period);
    const targetIndex = periodTasks.findIndex(t => t.id === targetTaskId);
    
    if (targetIndex !== -1) {
      onReorderRoutine(draggedTask, targetIndex, period);
    }
    
    setDraggedTask(null);
  };

  const getTasksByPeriod = (period: 'morning' | 'afternoon' | 'evening') => {
    return routineTasks.filter(task => task.period === period);
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'morning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'afternoon':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'evening':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl">Daily Routine</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          Add Routine
        </button>
      </div>

      {isExpanded && (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Routine task title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newTask.period}
                    onChange={(e) =>
                      setNewTask({ ...newTask, period: e.target.value as 'morning' | 'afternoon' | 'evening' })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                  <input
                    type="number"
                    value={newTask.estimatedMinutes}
                    onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: Math.max(1, parseInt(e.target.value) || 15) })}
                    placeholder="Minutes"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    {editingTask ? 'Update' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {['morning', 'afternoon', 'evening'].map(period => {
              const tasks = getTasksByPeriod(period as 'morning' | 'afternoon' | 'evening');
              if (tasks.length === 0) return null;

              return (
                <div key={period}>
                  <h3 className="text-sm uppercase tracking-wide text-gray-600 mb-3">
                    {period}
                  </h3>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, task.id, period as 'morning' | 'afternoon' | 'evening')}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${getPeriodColor(period)} cursor-move transition-opacity ${
                          draggedTask === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => onToggleRoutine(task.id)}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                        />
                        <span className={`flex-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </span>
                        <span className="text-sm">{formatTime(task.estimatedMinutes)}</span>
                        <button
                          onClick={() => onStartTimer(task)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          title="Start Timer"
                        >
                          <Timer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRoutine(task.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}