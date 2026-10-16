import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, Sparkles, GripVertical } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, text: 'Initialize miles-lab monorepo', completed: true },
    { id: 2, text: 'Build Project 1: Calculator', completed: true },
    { id: 3, text: 'Build Project 2: Digital Clock', completed: true },
    { id: 4, text: 'Master React state & CRUD operations', completed: false },
  ]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // CREATE
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setInput('');
  };

  // UPDATE (Toggle status)
  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // DELETE
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Drag and Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(draggedIndex, 1);
    updatedTasks.splice(index, 0, movedTask);
    setTasks(updatedTasks);
    setDraggedIndex(null);
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800 shrink-0">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-400" /> 03. To-Do List
          </h2>
          <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-900/50">
            {completedCount}/{tasks.length} Done
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={addTask} className="p-4 bg-slate-950/30 border-b border-slate-800 shrink-0 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Buttons */}
        <div className="flex px-4 py-3 gap-2 bg-slate-950/20 border-b border-slate-800/60 shrink-0">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
              <Sparkles className="w-5 h-5 text-slate-700" />
              <span>No tasks found</span>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                draggable={filter === 'all'}
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  filter === 'all' ? 'cursor-grab active:cursor-grabbing' : ''
                } ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                    : 'bg-slate-950 border-slate-800/80 text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                  {filter === 'all' && (
                    <GripVertical className="w-4 h-4 text-slate-700 group-hover:text-slate-400 shrink-0 transition-colors" />
                  )}
                  <div 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 transition-transform active:scale-90" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-transform active:scale-90" />
                    )}
                    <span className={`text-sm truncate font-medium ${task.completed ? 'line-through text-slate-600' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500 shrink-0">
          <span>HTML5 Drag & Drop</span>
          <span className="font-mono">CRUD + Reorder</span>
        </div>

      </div>
    </div>
  );
}