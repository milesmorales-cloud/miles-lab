import { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Flame, Calendar, Check, Award, PenLine, Smile } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  completedDates: string[];
}

interface DayEntry {
  note: string;
  mood: number; // 1-5
}

const createHabitId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `habit-${Math.random().toString(16).slice(2)}`;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('miles_lab_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [dayEntries, setDayEntries] = useState<Record<string, DayEntry>>(() => {
    const saved = localStorage.getItem('miles_lab_habit_days');
    return saved ? JSON.parse(saved) : {};
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Productivity');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => { localStorage.setItem('miles_lab_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('miles_lab_habit_days', JSON.stringify(dayEntries)); }, [dayEntries]);

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const todayStr = getTodayString();

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    setHabits([{
      id: createHabitId(),
      name: newHabitName.trim(),
      category: newHabitCategory,
      createdAt: todayStr,
      completedDates: [],
    }, ...habits]);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleHabitDate = (id: string, dateStr: string) => {
    setHabits(habits.map(habit => {
      if (habit.id !== id) return habit;
      const completed = habit.completedDates.includes(dateStr);
      const updated = completed
        ? habit.completedDates.filter(d => d !== dateStr)
        : [...habit.completedDates, dateStr];
      return { ...habit, completedDates: updated };
    }));
  };

  const toggleTodayHabit = (id: string) => toggleHabitDate(id, todayStr);

  const calculateStreak = (completedDates: string[]) => {
    if (!completedDates || completedDates.length === 0) return 0;
    let streak = 0;
    const currentDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (completedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = currentDate.toISOString().split('T')[0];
        if (!completedDates.includes(yesterdayStr)) break;
      } else {
        break;
      }
    }
    return streak;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ dateStr: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }), dayNum: d.getDate() });
    }
    return days;
  };
  const weekDays = getLast7Days();

  // heatmap: last 52 weeks (364 days)
  const getHeatmapDays = () => {
    const days = [];
    const total = 52 * 7;
    for (let i = total - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
      const ratio = habits.length ? completedCount / habits.length : 0;
      days.push({ dateStr, ratio, completedCount });
    }
    return days;
  };
  const heatmapDays = getHeatmapDays();

  const heatColor = (ratio: number) => {
    if (ratio === 0) return 'bg-slate-900/60';
    if (ratio < 0.34) return 'bg-emerald-900/60';
    if (ratio < 0.67) return 'bg-emerald-700/70';
    return 'bg-emerald-500';
  };

  const selectedEntry = dayEntries[selectedDate] || { note: '', mood: 0 };

  useEffect(() => {
    setNoteDraft(dayEntries[selectedDate]?.note || '');
  }, [selectedDate, dayEntries]);

  const saveDayEntry = (mood?: number) => {
    setDayEntries(prev => ({
      ...prev,
      [selectedDate]: {
        note: noteDraft,
        mood: mood !== undefined ? mood : (prev[selectedDate]?.mood || 0),
      },
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-white flex flex-col min-h-[calc(100vh-80px)] no-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" /> 12. Life OS & Consistency Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">Build consistency, reflect daily, and track your mood & energy.</p>
        </div>
        <form onSubmit={addHabit} className="flex flex-wrap gap-2 w-full md:w-auto">
          <input type="text" placeholder="New habit name..." value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1 md:w-48" />
          <select value={newHabitCategory} onChange={(e) => setNewHabitCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
            <option value="Productivity">Productivity</option>
            <option value="Health">Health</option>
            <option value="Fitness">Fitness</option>
            <option value="Mindset">Mindset</option>
          </select>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20">
            <Plus className="w-4 h-4" /> Add Habit
          </button>
        </form>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-xs flex-1 flex flex-col items-center justify-center">
          <Award className="w-12 h-12 text-slate-700 mb-3" />
          <p className="font-semibold text-slate-400">No habits tracked yet</p>
          <p className="mt-1">Add your first custom habit above to start building daily consistency.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="p-3 bg-indigo-950/60 rounded-xl border border-indigo-900/50 text-indigo-400"><CheckSquare className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Habits</div><div className="text-lg font-bold text-white mt-0.5">{habits.length}</div></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="p-3 bg-amber-950/60 rounded-xl border border-amber-900/50 text-amber-400"><Flame className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Completed Today</div><div className="text-lg font-bold text-white mt-0.5">{habits.filter(h => h.completedDates.includes(todayStr)).length} / {habits.length}</div></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-3">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-900/50 text-emerald-400"><Award className="w-5 h-5" /></div>
              <div><div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Streaks</div><div className="text-lg font-bold text-white mt-0.5">{habits.reduce((acc, h) => acc + (calculateStreak(h.completedDates) > 0 ? 1 : 0), 0)}</div></div>
            </div>
          </div>

          {/* Daily Reflection & Mood */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <PenLine className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Daily Reflection & Mood</span>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-auto bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Smile className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-slate-400">Energy / Mood (1-5):</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => { saveDayEntry(n); }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      (dayEntries[selectedDate]?.mood || 0) === n
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => saveDayEntry()}
              placeholder="Write a short reflection for this day..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none h-20 no-scrollbar"
            />
          </div>

          {/* Habit List */}
          <div className="space-y-3">
            {habits.map(habit => {
              const isCompletedToday = habit.completedDates.includes(todayStr);
              const currentStreak = calculateStreak(habit.completedDates);
              return (
                <div key={habit.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleTodayHabit(habit.id)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        isCompletedToday ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-950/60 border-slate-800 text-transparent hover:border-slate-700'
                      }`} title={isCompletedToday ? 'Completed today!' : 'Mark complete for today'}>
                      <Check className="w-5 h-5 stroke-3" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${isCompletedToday ? 'text-white line-through opacity-75' : 'text-white'}`}>{habit.name}</h3>
                        <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-900/50">{habit.category}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono"><Flame className="w-3.5 h-3.5 fill-current" /> {currentStreak} day streak</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" /> Created {habit.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="flex items-center gap-1.5">
                      {weekDays.map(day => {
                        const completed = habit.completedDates.includes(day.dateStr);
                        const isToday = day.dateStr === todayStr;
                        return (
                          <div key={day.dateStr} className="flex flex-col items-center gap-1">
                            <span className="text-[9px] text-slate-500 font-mono">{day.label}</span>
                            <button onClick={() => toggleHabitDate(habit.id, day.dateStr)}
                              className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono transition-all cursor-pointer ${
                                completed ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 font-bold' : isToday ? 'bg-slate-800 border-indigo-500/50 text-slate-400' : 'bg-slate-950/40 border-slate-800/80 text-slate-600'
                              }`} title={`${day.dateStr}: ${completed ? 'Completed' : 'Missed'}`}>{day.dayNum}</button>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} className="text-slate-500 hover:text-rose-400 p-2 rounded-xl transition-all cursor-pointer" title="Delete habit">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Year Heatmap */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Year Consistency Heatmap</span>
            </div>
            <div className="flex flex-wrap gap-1 no-scrollbar overflow-hidden">
              {heatmapDays.map(d => (
                <div key={d.dateStr} title={`${d.dateStr}: ${d.completedCount}/${habits.length}`} className={`w-2.5 h-2.5 rounded-sm ${heatColor(d.ratio)}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
