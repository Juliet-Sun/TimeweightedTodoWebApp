import React, { useState } from 'react';
import { Task } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'completed' | 'actualMinutes'>) => void;
  onClose: () => void;
  initialTask?: Task;
}

export function TaskForm({ onSubmit, onClose, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialTask?.estimatedMinutes || 30);
  const [importance, setImportance] = useState<'high' | 'low'>(initialTask?.importance || 'high');
  const [urgency, setUrgency] = useState<'urgent' | 'not-urgent'>(initialTask?.urgency || 'urgent');
  const [deadline, setDeadline] = useState(initialTask?.deadline || '');
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [subtasks, setSubtasks] = useState(initialTask?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState({ title: '', estimatedMinutes: 15 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      estimatedMinutes,
      importance,
      urgency,
      deadline: deadline || undefined,
      tags,
      subtasks,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addSubtask = () => {
    if (newSubtask.title.trim()) {
      setSubtasks([
        ...subtasks,
        {
          id: Date.now().toString(),
          title: newSubtask.title,
          completed: false,
          estimatedMinutes: newSubtask.estimatedMinutes,
        },
      ]);
      setNewSubtask({ title: '', estimatedMinutes: 15 });
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Estimated Time (minutes)</label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 30))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Importance</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportance('high')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    importance === 'high'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  High
                </button>
                <button
                  type="button"
                  onClick={() => setImportance('low')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    importance === 'low'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Low
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Urgency</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('urgent')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    urgency === 'urgent'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Urgent
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('not-urgent')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    urgency === 'not-urgent'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Not Urgent
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Subtasks</label>
            <div className="space-y-2 mb-3">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                  <span className="flex-1">{subtask.title}</span>
                  <span className="text-sm text-gray-500">{subtask.estimatedMinutes}m</span>
                  <button type="button" onClick={() => removeSubtask(subtask.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask.title}
                onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                placeholder="Subtask title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                value={newSubtask.estimatedMinutes}
                onChange={(e) =>
                  setNewSubtask({ ...newSubtask, estimatedMinutes: Math.max(1, parseInt(e.target.value) || 15) })
                }
                placeholder="15"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
