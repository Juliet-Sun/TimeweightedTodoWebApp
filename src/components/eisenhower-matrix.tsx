import React from 'react';
import { Task, Quadrant } from '../types';
import { TaskCard } from './task-card';
import { useDrop } from 'react-dnd';
import { calculateQuadrantCompletion } from '../utils/task-helpers';

interface QuadrantProps {
  title: string;
  description: string;
  quadrant: Quadrant;
  tasks: Task[];
  color: string;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
  onDrop: (taskId: string, targetQuadrant: Quadrant) => void;
}

function QuadrantBox({
  title,
  description,
  quadrant,
  tasks,
  color,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onStartTimer,
  onDrop,
}: QuadrantProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item: { id: string }) => {
      onDrop(item.id, quadrant);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const completion = calculateQuadrantCompletion(tasks);

  return (
    <div
      ref={drop}
      className={`rounded-lg p-4 ${color} ${isOver ? 'ring-2 ring-blue-500' : ''} transition-all`}
    >
      <div className="mb-4">
        <h3 className="mb-1">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{tasks.length} tasks</span>
            <span>{Math.round(completion)}% complete</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
            <div
              className="bg-white h-1.5 rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-sm opacity-60">
            No tasks in this quadrant
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} draggable onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}>
              <TaskCard
                task={task}
                onToggleComplete={onToggleComplete}
                onToggleSubtask={onToggleSubtask}
                onEdit={onEdit}
                onDelete={onDelete}
                onStartTimer={onStartTimer}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface EisenhowerMatrixProps {
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartTimer: (task: Task) => void;
  onMoveTask: (taskId: string, targetQuadrant: Quadrant) => void;
}

export function EisenhowerMatrix({
  tasks,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onStartTimer,
  onMoveTask,
}: EisenhowerMatrixProps) {
  const getTasksForQuadrant = (quadrant: Quadrant): Task[] => {
    return tasks.filter(task => {
      if (quadrant === 'important-urgent') {
        return task.importance === 'high' && task.urgency === 'urgent';
      } else if (quadrant === 'important-not-urgent') {
        return task.importance === 'high' && task.urgency === 'not-urgent';
      } else if (quadrant === 'not-important-urgent') {
        return task.importance === 'low' && task.urgency === 'urgent';
      } else {
        return task.importance === 'low' && task.urgency === 'not-urgent';
      }
    });
  };

  const quadrants: Array<{
    quadrant: Quadrant;
    title: string;
    description: string;
    color: string;
  }> = [
    {
      quadrant: 'important-urgent',
      title: 'Do First',
      description: 'Important & Urgent',
      color: 'bg-red-100 border-2 border-red-300',
    },
    {
      quadrant: 'important-not-urgent',
      title: 'Schedule',
      description: 'Important & Not Urgent',
      color: 'bg-yellow-100 border-2 border-yellow-300',
    },
    {
      quadrant: 'not-important-urgent',
      title: 'Delegate',
      description: 'Urgent & Not Important',
      color: 'bg-orange-100 border-2 border-orange-300',
    },
    {
      quadrant: 'not-important-not-urgent',
      title: 'Eliminate',
      description: 'Not Important & Not Urgent',
      color: 'bg-blue-100 border-2 border-blue-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quadrants.map(({ quadrant, title, description, color }) => (
        <QuadrantBox
          key={quadrant}
          quadrant={quadrant}
          title={title}
          description={description}
          tasks={getTasksForQuadrant(quadrant)}
          color={color}
          onToggleComplete={onToggleComplete}
          onToggleSubtask={onToggleSubtask}
          onEdit={onEdit}
          onDelete={onDelete}
          onStartTimer={onStartTimer}
          onDrop={onMoveTask}
        />
      ))}
    </div>
  );
}
