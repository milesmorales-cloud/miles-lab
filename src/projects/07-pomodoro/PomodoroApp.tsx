import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, CheckCircle, Coffee, Briefcase, Settings } from 'lucide-react';

export default function PomodoroApp() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    let timer: number;

    if (isRunning) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return;

    const completionTimeout = window.setTimeout(() => {
      setIsRunning(false);
      if (mode === 'work') {
        setCompletedPomodoros(prev => prev + 1);
        alert('Pomodoro session completed! Time for a break.');
        setMode('break');
        setTimeLeft(breakMinutes * 60);
      } else {
        alert('Break over! Back to work.');
        setMode('work');
        setTimeLeft(workMinutes * 60);
      }
    }, 0);

    return () => window.clearTimeout(completionTimeout);
  }, [timeLeft, isRunning, mode, workMinutes, breakMinutes]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft((mode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <Timer className="w-4 h-4 text-indigo-400" /> 07. Pomodoro Focus Timer
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900/50">
              {completedPomodoros} Done
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                showSettings 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 animate-fadeIn">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Custom Durations (Minutes)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Focus Time</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={workMinutes}
                  onChange={(e) => {
                    const minutes = Math.max(1, parseInt(e.target.value) || 1);
                    setWorkMinutes(minutes);
                    if (!isRunning && mode === 'work') setTimeLeft(minutes * 60);
                  }}
                  disabled={isRunning}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Break Time</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakMinutes}
                  onChange={(e) => {
                    const minutes = Math.max(1, parseInt(e.target.value) || 1);
                    setBreakMinutes(minutes);
                    if (!isRunning && mode === 'break') setTimeLeft(minutes * 60);
                  }}
                  disabled={isRunning}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 font-mono"
                />
              </div>
            </div>
            {isRunning && (
              <p className="text-[10px] text-amber-400/80 mt-2">Pause the timer to modify durations.</p>
            )}
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => switchMode('work')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'work'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Focus ({workMinutes}m)
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'break'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" /> Break ({breakMinutes}m)
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-48 h-48 rounded-full border-4 border-slate-800 bg-slate-950 flex flex-col items-center justify-center shadow-inner mb-6 relative">
            <div className={`text-5xl font-black font-mono tracking-wider ${mode === 'work' ? 'text-indigo-400' : 'text-emerald-400'}`}>
              {formattedTime}
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-1 font-semibold">
              {mode === 'work' ? 'Focus Time' : 'Rest Time'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                isRunning 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Focus</>}
            </button>

            <button
              onClick={resetTimer}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-all cursor-pointer border border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Custom Duration Settings</span>
          <span className="font-mono">React State</span>
        </div>

      </div>
    </div>
  );
}