export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  importance: 'high' | 'low';
  urgency: 'urgent' | 'not-urgent';
  deadline?: string;
  tags: string[];
  completed: boolean;
  subtasks: Subtask[];
  actualMinutes: number;
}

export interface RoutineTask {
  id: string;
  title: string;
  period: 'morning' | 'afternoon' | 'evening';
  estimatedMinutes: number;
  completed: boolean;
}

export type ViewMode = 'quadrant' | 'deadline' | 'tags';

export type Quadrant = 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
