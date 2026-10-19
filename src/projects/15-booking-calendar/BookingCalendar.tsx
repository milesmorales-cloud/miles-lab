import React, { useState, useEffect } from 'react';

interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Work' | 'Personal' | 'Meeting' | 'Reminder';
  time: string;
  notes?: string;
}

interface Holiday {
  date: string;
  localName: string;
  name: string;
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('miles_lab_bookings');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: '2026-10-25', title: 'Q4 Product Review', category: 'Meeting', time: '10:00 AM', notes: 'Review roadmap progress.' },
      { id: '2', date: '2026-10-28', title: 'Doctor Appointment', category: 'Personal', time: '02:30 PM', notes: 'Annual checkup.' }
    ];
  });

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [countryCode, setCountryCode] = useState('US');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Meeting' | 'Reminder'>('Work');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('miles_lab_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Fetch holidays from Nager.Date API for historical / current / future years
  useEffect(() => {
    async function fetchHolidays() {
      setLoadingHolidays(true);
      try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        if (res.ok) {
          const data = await res.json();
          setHolidays(data);
        } else {
          setHolidays([]);
        }
      } catch (err) {
        console.error('Failed to fetch holidays', err);
        setHolidays([]);
      } finally {
        setLoadingHolidays(false);
      }
    }
    fetchHolidays();
  }, [year, countryCode]);

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (dayNum: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !title.trim()) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      date: selectedDate,
      title: title.trim(),
      category,
      time,
      notes: notes.trim()
    };

    setBookings([...bookings, newBooking]);
    setTitle('');
    setNotes('');
    setIsModalOpen(false);
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  // Filter bookings for selected date or overall upcoming
  const selectedDateBookings = selectedDate ? bookings.filter(b => b.date === selectedDate) : [];
  const upcomingReminders = bookings.filter(b => b.category === 'Reminder' || new Date(b.date) >= new Date());

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
            📅 Project 15: Advanced Booking & Event Calendar Hub
          </h1>
          <p className="text-slate-400 text-sm">
            Multi-year historical lookups, public holidays, personal planning, and active reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={countryCode} 
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
            <option value="CA">Canada (CA)</option>
            <option value="AU">Australia (AU)</option>
            <option value="DE">Germany (DE)</option>
          </select>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <button onClick={handlePrevMonth} className="px-3 py-2 hover:bg-slate-800 text-slate-300 transition">&larr;</button>
            <span className="px-4 py-2 font-semibold text-sm">{monthNames[month]}</span>
            <input
              type="number"
              value={year}
              onChange={e => {
                const y = parseInt(e.target.value);
                if (!isNaN(y)) setCurrentDate(new Date(y, month, 1));
              }}
              className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-indigo-400 text-center focus:outline-none focus:border-indigo-500"
            />
            <button onClick={handleNextMonth} className="px-3 py-2 hover:bg-slate-800 text-slate-300 transition">&rarr;</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-4 text-center font-semibold text-xs text-slate-400 uppercase tracking-wider">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-28 bg-slate-900/20 rounded-xl border border-transparent"></div>
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const formattedMonth = String(month + 1).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const dayBookings = bookings.filter(b => b.date === dateStr);
              const dayHoliday = holidays.find(h => h.date === dateStr);

               const today = new Date();
               const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
               const isToday = dateStr === todayStr;

               return (
                 <div
                   key={dateStr}
                   onClick={() => handleDayClick(dayNum)}
                   className={`h-28 border rounded-xl p-2 flex flex-col justify-between cursor-pointer transition group relative overflow-hidden ${isToday ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40' : 'bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/50'}`}
                 >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400">{dayNum}</span>
                    {dayHoliday && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full truncate max-w-17.5" title={dayHoliday.name}>
                        Holiday
                      </span>
                    )}
                  </div>

                  {/* Indicators for bookings */}
                  <div className="space-y-1 overflow-y-auto max-h-16 [&::-webkit-scrollbar]:hidden">
                    {dayBookings.map(b => (
                      <div 
                        key={b.id} 
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                          b.category === 'Work' ? 'bg-indigo-500/20 text-indigo-300' :
                          b.category === 'Meeting' ? 'bg-amber-500/20 text-amber-300' :
                          b.category === 'Reminder' ? 'bg-rose-500/20 text-rose-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {b.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Reminders & Selected Date Details */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              🔔 Active Reminders & Plans
            </h2>
            <div className="space-y-3 max-h-100 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {loadingHolidays && <p className="text-xs text-slate-500">Loading public holidays...</p>}
              {upcomingReminders.length === 0 ? (
                <p className="text-sm text-slate-500">No active reminders found.</p>
              ) : (
                upcomingReminders.map(rem => (
                  <div key={rem.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{rem.title}</h4>
                      <p className="text-xs text-indigo-400 mt-0.5">{rem.date} at {rem.time}</p>
                      {rem.notes && <p className="text-xs text-slate-400 mt-1">{rem.notes}</p>}
                    </div>
                    <button 
                      onClick={() => handleDeleteBooking(rem.id)} 
                      className="text-slate-500 hover:text-rose-400 text-xs transition"
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-300 mb-2">💡 Quick Tip</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any date on the calendar grid to schedule personal plans, meetings, or set a reminder. Historical lookups fetch official public holidays automatically!
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Adding Plans / Bookings */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-100">Add Plan for {selectedDate}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">&times;</button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title / Event</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Client Pitch, Dentist, Project Deadline" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <select 
                    value={category} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as Booking['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Notes (Optional)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Add details, links, or reminders..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Existing bookings on this date */}
              {selectedDateBookings.length > 0 && (
                <div className="border-t border-slate-800 pt-3 mt-2">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">Existing Plans on this Day:</span>
                  <div className="space-y-2 max-h-28 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {selectedDateBookings.map(b => (
                      <div key={b.id} className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-lg text-xs">
                        <span className="text-slate-200 font-medium">{b.title} ({b.time})</span>
                        <button type="button" onClick={() => handleDeleteBooking(b.id)} className="text-rose-400 hover:text-rose-300">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}