import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, X } from 'lucide-react';

interface PomodoroTimerProps {
  taskTitle: string;
  onClose: () => void;
  onTimeLogged: (minutes: number) => void;
}

export function PomodoroTimer({ taskTitle, onClose, onTimeLogged }: PomodoroTimerProps) {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (!isBreak) {
      setTotalFocusTime(prev => prev + focusDuration);
      onTimeLogged(focusDuration);
    }
    
    // Auto-start break or next focus session
    setIsBreak(!isBreak);
    setTimeLeft((!isBreak ? breakDuration : focusDuration) * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft((isBreak ? breakDuration : focusDuration) * 60);
  };

  const applySettings = () => {
    setTimeLeft((isBreak ? breakDuration : focusDuration) * 60);
    setShowSettings(false);
    setIsRunning(false);
  };

  const formatTimeDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? breakDuration * 60 : focusDuration * 60) - timeLeft) / (isBreak ? breakDuration * 60 : focusDuration * 60) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg">{taskTitle}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSettings ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Focus Duration (minutes)</label>
              <input
                type="number"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Math.max(1, parseInt(e.target.value) || 25))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Break Duration (minutes)</label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
              />
            </div>
            <button
              onClick={applySettings}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Apply Settings
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-64 h-64 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke={isBreak ? '#10b981' : '#3b82f6'}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl mb-2">{formatTimeDisplay(timeLeft)}</div>
                <div className="text-sm text-gray-500">{isBreak ? 'Break Time' : 'Focus Time'}</div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={toggleTimer}
                className={`p-4 rounded-full ${isRunning ? 'bg-orange-500' : 'bg-blue-500'} text-white hover:opacity-90`}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={resetTimer}
                className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-4 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Total Focus Time: {totalFocusTime}m
            </div>
          </>
        )}
      </div>
    </div>
  );
}
