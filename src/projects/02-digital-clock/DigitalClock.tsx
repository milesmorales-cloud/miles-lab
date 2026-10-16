import { useState, useEffect } from 'react';
import { Clock, Calendar, Globe, Sun, Moon } from 'lucide-react';

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [timeZone, setTimeZone] = useState('local');

  // Set up the interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on unmount to prevent memory leaks
    return () => clearInterval(timer);
  }, []);

  // Format time based on options
  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !is24Hour,
    };

    if (timeZone !== 'local') {
      options.timeZone = timeZone;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (timeZone !== 'local') {
      options.timeZone = timeZone;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> 02. Digital Clock
          </h2>
          <button 
            onClick={() => setIs24Hour(!is24Hour)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-900/50 font-mono"
          >
            {is24Hour ? '24H Mode' : '12H Mode'}
          </button>
        </div>

        {/* Clock Main View */}
        <div className="p-8 flex flex-col items-center">
          
          {/* Time Display */}
          <div className="w-full bg-slate-950 p-6 rounded-2xl mb-6 border border-slate-800/80 text-center shadow-inner">
            <div className="text-4xl md:text-5xl font-black tracking-wider font-mono bg-linear-to-r from-indigo-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              {formatTime(time)}
            </div>
          </div>

          {/* Date Display */}
          <div className="flex items-center gap-2 text-slate-300 text-sm font-medium mb-8 bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{formatDate(time)}</span>
          </div>

          {/* Timezone Switcher */}
          <div className="w-full space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Select Time Zone
            </label>
            <select 
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium"
            >
              <option value="local">Local Time (Default)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

        </div>

        {/* Footer info badge */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            {time.getHours() >= 6 && time.getHours() < 18 ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            {time.getHours() >= 6 && time.getHours() < 18 ? 'Daytime' : 'Nighttime'}
          </span>
          <span className="font-mono">setInterval(1000ms)</span>
        </div>

      </div>
    </div>
  );
}