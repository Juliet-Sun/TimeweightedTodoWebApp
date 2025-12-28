import { Task, Subtask, Quadrant } from '../types';

export const getQuadrant = (task: Task): Quadrant => {
  if (task.importance === 'high' && task.urgency === 'urgent') {
    return 'important-urgent';
  } else if (task.importance === 'high' && task.urgency === 'not-urgent') {
    return 'important-not-urgent';
  } else if (task.importance === 'low' && task.urgency === 'urgent') {
    return 'not-important-urgent';
  } else {
    return 'not-important-not-urgent';
  }
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.completed) return 100;
  if (task.subtasks.length === 0) return 0;
  
  const completedTime = task.subtasks
    .filter(st => st.completed)
    .reduce((sum, st) => sum + st.estimatedMinutes, 0);
  
  const totalTime = task.subtasks.reduce((sum, st) => sum + st.estimatedMinutes, 0);
  
  return totalTime > 0 ? (completedTime / totalTime) * 100 : 0;
};

export const calculateDailyCompletion = (tasks: Task[]): number => {
  const totalTime = tasks.reduce((sum, task) => {
    const taskTime = task.estimatedMinutes;
    return sum + taskTime;
  }, 0);
  
  const completedTime = tasks.reduce((sum, task) => {
    if (task.completed) {
      return sum + task.estimatedMinutes;
    } else if (task.subtasks.length > 0) {
      const subtaskCompletedTime = task.subtasks
        .filter(st => st.completed)
        .reduce((stSum, st) => stSum + st.estimatedMinutes, 0);
      return sum + subtaskCompletedTime;
    }
    return sum;
  }, 0);
  
  return totalTime > 0 ? (completedTime / totalTime) * 100 : 0;
};

export const calculateQuadrantCompletion = (tasks: Task[]): number => {
  return calculateDailyCompletion(tasks);
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
