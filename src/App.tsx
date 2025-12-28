import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, RoutineTask, ViewMode, Quadrant } from './types';
import { EisenhowerMatrix } from './components/eisenhower-matrix';
import { DeadlineView } from './components/deadline-view';
import { TagsView } from './components/tags-view';
import { TaskForm } from './components/task-form';
import { PomodoroTimer } from './components/pomodoro-timer';
import { DailyRoutine } from './components/daily-routine';
import { calculateDailyCompletion } from './utils/task-helpers';
import { Plus, Calendar, Tag, Grid3X3, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'todo-app-data';

const defaultRoutines: RoutineTask[] = [
  { id: '1', title: 'Wake up naturally', period: 'morning', estimatedMinutes: 10, completed: false },
  { id: '2', title: 'Open Sleep Town to log wake-up', period: 'morning', estimatedMinutes: 2, completed: false },
  { id: '3', title: 'Eight Brocade Qigong', period: 'morning', estimatedMinutes: 15, completed: false },
  { id: '4', title: 'Make breakfast (listen to podcast)', period: 'morning', estimatedMinutes: 20, completed: false },
  { id: '5', title: 'Wash up', period: 'morning', estimatedMinutes: 15, completed: false },
  { id: '6', title: 'Eat breakfast', period: 'morning', estimatedMinutes: 15, completed: false },
  { id: '7', title: 'Drink half bottle of water', period: 'morning', estimatedMinutes: 2, completed: false },
  { id: '8', title: 'Start NoSQL DB work', period: 'morning', estimatedMinutes: 120, completed: false },
  { id: '9', title: 'Make lunch', period: 'afternoon', estimatedMinutes: 30, completed: false },
  { id: '10', title: 'Eat lunch', period: 'afternoon', estimatedMinutes: 20, completed: false },
  { id: '11', title: 'Plan and think about Datathon', period: 'afternoon', estimatedMinutes: 60, completed: false },
  { id: '12', title: 'Reading', period: 'afternoon', estimatedMinutes: 30, completed: false },
  { id: '13', title: 'Ziwei Astrology', period: 'afternoon', estimatedMinutes: 45, completed: false },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>(defaultRoutines);
  const [viewMode, setViewMode] = useState<ViewMode>('quadrant');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [timerTask, setTimerTask] = useState<Task | RoutineTask | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setTasks(data.tasks || []);
        setRoutineTasks(data.routineTasks || defaultRoutines);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, routineTasks }));
  }, [tasks, routineTasks]);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed' | 'actualMinutes'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      actualMinutes: 0,
    };
    setTasks([...tasks, newTask]);
    setShowTaskForm(false);
  };

  const handleEditTask = (taskData: Omit<Task, 'id' | 'completed' | 'actualMinutes'>) => {
    if (editingTask) {
      setTasks(
        tasks.map(task =>
          task.id === editingTask.id
            ? { ...taskData, id: task.id, completed: task.completed, actualMinutes: task.actualMinutes }
            : task
        )
      );
      setEditingTask(undefined);
      setShowTaskForm(false);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(st =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const handleMoveTask = (taskId: string, targetQuadrant: Quadrant) => {
    setTasks(
      tasks.map(task => {
        if (task.id === taskId) {
          const [importance, urgency] = targetQuadrant.split('-') as ['important' | 'not-important', 'urgent' | 'not-urgent'];
          return {
            ...task,
            importance: importance === 'important' ? 'high' : 'low',
            urgency: urgency,
          };
        }
        return task;
      })
    );
  };

  const handleStartTaskTimer = (task: Task) => {
    setTimerTask(task);
  };

  const handleStartRoutineTimer = (task: RoutineTask) => {
    setTimerTask(task);
  };

  const handleTimeLogged = (minutes: number) => {
    if (timerTask && 'actualMinutes' in timerTask) {
      setTasks(
        tasks.map(task =>
          task.id === timerTask.id
            ? { ...task, actualMinutes: task.actualMinutes + minutes }
            : task
        )
      );
    }
  };

  const handleAddRoutine = (routineData: Omit<RoutineTask, 'id' | 'completed'>) => {
    const newRoutine: RoutineTask = {
      ...routineData,
      id: Date.now().toString(),
      completed: false,
    };
    setRoutineTasks([...routineTasks, newRoutine]);
  };

  const handleDeleteRoutine = (id: string) => {
    if (confirm('Are you sure you want to delete this routine?')) {
      setRoutineTasks(routineTasks.filter(rt => rt.id !== id));
    }
  };

  const handleToggleRoutine = (id: string) => {
    setRoutineTasks(
      routineTasks.map(rt => (rt.id === id ? { ...rt, completed: !rt.completed } : rt))
    );
  };

  const handleUpdateRoutine = (id: string, routineData: Omit<RoutineTask, 'id' | 'completed'>) => {
    setRoutineTasks(
      routineTasks.map(rt =>
        rt.id === id
          ? { ...routineData, id: rt.id, completed: rt.completed }
          : rt
      )
    );
  };

  const handleReorderRoutine = (taskId: string, newIndex: number, period: 'morning' | 'afternoon' | 'evening') => {
    const task = routineTasks.find(t => t.id === taskId);
    if (!task) return;

    // Get all tasks in the same period
    const periodTasks = routineTasks.filter(t => t.period === period);
    const otherTasks = routineTasks.filter(t => t.period !== period);

    // Remove the dragged task from period tasks
    const filteredPeriodTasks = periodTasks.filter(t => t.id !== taskId);

    // Insert at new position
    filteredPeriodTasks.splice(newIndex, 0, { ...task, period });

    // Combine and update
    setRoutineTasks([...otherTasks, ...filteredPeriodTasks]);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const dailyCompletion = calculateDailyCompletion(tasks);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl mb-2">Time-Weighted ToDo App</h1>
            <p className="text-gray-600">
              Organize tasks by priority, track time, and achieve your goals
            </p>
          </div>

          {/* Daily Progress */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h2 className="text-xl">Daily Progress</h2>
              </div>
              <span className="text-2xl">{Math.round(dailyCompletion)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${dailyCompletion}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Completion weighted by estimated time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              {/* View Controls */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('quadrant')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'quadrant'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                      Quadrant
                    </button>
                    <button
                      onClick={() => setViewMode('deadline')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'deadline'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      Deadline
                    </button>
                    <button
                      onClick={() => setViewMode('tags')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'tags'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                      Tags
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setEditingTask(undefined);
                      setShowTaskForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Task
                  </button>
                </div>
              </div>

              {/* Task Views */}
              {viewMode === 'quadrant' && (
                <EisenhowerMatrix
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                  onStartTimer={handleStartTaskTimer}
                  onMoveTask={handleMoveTask}
                />
              )}

              {viewMode === 'deadline' && (
                <DeadlineView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                  onStartTimer={handleStartTaskTimer}
                />
              )}

              {viewMode === 'tags' && (
                <TagsView
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onToggleSubtask={handleToggleSubtask}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                  onStartTimer={handleStartTaskTimer}
                />
              )}
            </div>

            {/* Daily Routine Sidebar */}
            <div className="lg:col-span-1">
              <DailyRoutine
                routineTasks={routineTasks}
                onAddRoutine={handleAddRoutine}
                onDeleteRoutine={handleDeleteRoutine}
                onToggleRoutine={handleToggleRoutine}
                onUpdateRoutine={handleUpdateRoutine}
                onReorderRoutine={handleReorderRoutine}
                onStartTimer={handleStartRoutineTimer}
              />
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(undefined);
            }}
            initialTask={editingTask}
          />
        )}

        {/* Pomodoro Timer Modal */}
        {timerTask && (
          <PomodoroTimer
            taskTitle={timerTask.title}
            onClose={() => setTimerTask(null)}
            onTimeLogged={handleTimeLogged}
          />
        )}
      </div>
    </DndProvider>
  );
}

export default App;