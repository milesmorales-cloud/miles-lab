import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, CheckCircle, Coffee, Briefcase, Settings, Plus, X, Save, Clock3, ListChecks, Flame, Trash2 } from 'lucide-react';

interface FocusSession {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  timestamp: string;
}

const SESSIONS_STORAGE_KEY = 'miles_lab_morales_sessions';

function getLocalDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSessionDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function PomodoroApp() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const parsedSessions: unknown = savedSessions ? JSON.parse(savedSessions) : [];
      return Array.isArray(parsedSessions) ? parsedSessions as FocusSession[] : [];
    } catch {
      return [];
    }
  });
  
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionDialogMode, setSessionDialogMode] = useState<'completed' | 'manual' | null>(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionCategory, setSessionCategory] = useState('Coding');
  const [sessionDuration, setSessionDuration] = useState(workMinutes);

  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const minutesByDay = new Map<string, number>();
  sessions.forEach(session => {
    const dateKey = getLocalDateKey(new Date(session.timestamp));
    if (dateKey) minutesByDay.set(dateKey, (minutesByDay.get(dateKey) || 0) + session.durationMinutes);
  });
  const todayMinutes = minutesByDay.get(todayKey) || 0;
  let streak = 0;
  const streakDate = new Date(today);
  if (!minutesByDay.has(todayKey)) streakDate.setDate(streakDate.getDate() - 1);
  while (minutesByDay.has(getLocalDateKey(streakDate))) {
    streak++;
    streakDate.setDate(streakDate.getDate() - 1);
  }
  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dateKey = getLocalDateKey(date);
    return {
      date,
      minutes: minutesByDay.get(dateKey) || 0,
      label: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
    };
  });

  const saveSession = useCallback((sessionData: FocusSession) => {
    const updatedSessions = [...sessions, sessionData];
    setSessions(updatedSessions);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  }, [sessions]);

  const deleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  };

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
        setSessionTitle('');
        setSessionCategory('Coding');
        setSessionDuration(workMinutes);
        setSessionDialogMode('completed');
        setMode('break');
        setTimeLeft(breakMinutes * 60);
      } else {
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

  const openManualSessionDialog = () => {
    setSessionTitle('');
    setSessionCategory('Coding');
    setSessionDuration(workMinutes);
    setSessionDialogMode('manual');
  };

  const handleSaveSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSession({
      id: crypto.randomUUID(),
      title: sessionTitle.trim(),
      category: sessionCategory.trim(),
      durationMinutes: sessionDuration,
      timestamp: new Date().toISOString(),
    });
    setSessionDialogMode(null);
  };

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6 text-white">
      <section aria-label="Productivity overview" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Focus today</span><Clock3 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{(todayMinutes / 60).toFixed(1)}<span className="ml-1 text-sm font-medium text-slate-400">hrs</span></div>
          <p className="mt-1 text-[11px] text-slate-500">{todayMinutes} minutes logged</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total sessions</span><ListChecks className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{sessions.length}</div>
          <p className="mt-1 text-[11px] text-slate-500">Across all logged focus time</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Activity streak</span><Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{streak}<span className="ml-1 text-sm font-medium text-slate-400">days</span></div>
          <p className="mt-1 text-[11px] text-slate-500">Consecutive days with focus logged</p>
        </div>
      </section>

      <section aria-label="Seven-day focus activity" className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200">Last 7 days</h3>
          <span className="text-[10px] text-slate-500">Focus minutes</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {activityDays.map(day => {
            const intensity = day.minutes === 0 ? 'bg-slate-800' : day.minutes < 30 ? 'bg-indigo-950' : day.minutes < 60 ? 'bg-indigo-800' : day.minutes < 120 ? 'bg-indigo-600' : 'bg-indigo-400';
            return (
              <div key={getLocalDateKey(day.date)} className="flex min-w-0 flex-col items-center gap-1.5" title={`${day.label}: ${day.minutes} focus minutes`}>
                <div className={`h-7 w-full max-w-16 rounded-md ${intensity}`} />
                <span className="text-[10px] text-slate-500">{day.label}</span>
                <span className="font-mono text-[10px] text-slate-400">{day.minutes}m</span>
              </div>
            );
          })}
        </div>
      </section>

      <main className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <div className="w-full">
      <div className="mx-auto w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col lg:mx-0">
        
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
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start {mode === 'work' ? 'Focus' : 'Break'}</>}
            </button>

            <button
              onClick={resetTimer}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl transition-all cursor-pointer border border-slate-700"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={openManualSessionDialog}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-indigo-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Manual Session
          </button>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> Custom Duration Settings</span>
          <span className="font-mono">React State</span>
        </div>

      </div>
      </div>

      <section className="flex min-h-128 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl" aria-labelledby="session-history-title">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 id="session-history-title" className="text-sm font-bold text-white">Session history</h2>
            <p className="mt-1 text-[11px] text-slate-500">Your saved focus sessions</p>
          </div>
          <span className="rounded-lg border border-indigo-900/50 bg-indigo-950/40 px-2.5 py-1 font-mono text-xs text-indigo-300">{sessions.length}</span>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto scroll-smooth">
          {sessions.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <Timer className="h-8 w-8 text-slate-700" />
              <p className="mt-3 text-sm font-medium text-slate-300">No sessions logged yet</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">Completed focus blocks and manual entries will appear here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/80">
              {[...sessions].sort((first, second) => new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()).map(session => (
                <li key={session.id} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-800/30 sm:px-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-900/50 bg-indigo-950/50 text-indigo-300">
                    <Timer className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{session.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-indigo-900/50 bg-indigo-950/40 px-2 py-0.5 text-[10px] font-medium text-indigo-300">{session.category}</span>
                      <span className="text-[10px] text-slate-500">{formatSessionDate(session.timestamp)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-slate-300">{session.durationMinutes}m</span>
                  <button
                    type="button"
                    onClick={() => deleteSession(session.id)}
                    aria-label={`Delete ${session.title}`}
                    title="Delete session"
                    className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-950/50 hover:text-rose-300 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      </main>

      {sessionDialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-dialog-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto no-scrollbar rounded-2xl border border-slate-700 bg-slate-900 text-white shadow-2xl shadow-black/40"
          >
            <div className="flex items-start justify-between border-b border-slate-800 bg-slate-950/50 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  {sessionDialogMode === 'completed' ? 'Focus complete' : 'Session log'}
                </p>
                <h3 id="session-dialog-title" className="mt-1 text-base font-bold">
                  {sessionDialogMode === 'completed' ? 'Save your focus session' : 'Log manual session'}
                </h3>
                {sessionDialogMode === 'completed' && (
                  <p className="mt-1 text-xs text-slate-400">Your {sessionDuration}-minute focus block is ready to save.</p>
                )}
              </div>
              {sessionDialogMode === 'manual' && (
                <button
                  type="button"
                  onClick={() => setSessionDialogMode(null)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
                  aria-label="Close session form"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 p-5">
              <div>
                <label htmlFor="session-title" className="mb-1.5 block text-xs font-medium text-slate-300">Title</label>
                <input
                  id="session-title"
                  autoFocus
                  required
                  maxLength={80}
                  value={sessionTitle}
                  onChange={event => setSessionTitle(event.target.value)}
                  placeholder="e.g. Refine project proposal"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="session-category" className="mb-1.5 block text-xs font-medium text-slate-300">Category</label>
                <input
                  id="session-category"
                  required
                  maxLength={40}
                  value={sessionCategory}
                  onChange={event => setSessionCategory(event.target.value)}
                  placeholder="Coding"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="session-duration" className="mb-1.5 block text-xs font-medium text-slate-300">Duration (minutes)</label>
                <input
                  id="session-duration"
                  type="number"
                  min="1"
                  max="1440"
                  required
                  disabled={sessionDialogMode === 'completed'}
                  value={sessionDuration}
                  onChange={event => setSessionDuration(Math.max(1, Number(event.target.value) || 1))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-sm text-white outline-none transition-colors focus:border-indigo-500 disabled:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Session
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}