import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Tag, 
  ListTodo
} from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  tags: string[];
}

const STORAGE_KEY = 'miles_lab_kanban_tasks_v1';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design Master Analytics Dashboard',
    description: 'Integrate metrics across all Miles Lab components into a unified overview.',
    status: 'backlog',
    priority: 'High',
    dueDate: '2026-04-15',
    tags: ['UI/UX', 'Analytics']
  },
  {
    id: 'task-2',
    title: 'Refactor LocalStorage Sync hooks',
    description: 'Ensure robust error handling and fallback states for all persisted modules.',
    status: 'in-progress',
    priority: 'Medium',
    dueDate: '2026-04-10',
    tags: ['Architecture', 'React']
  },
  {
    id: 'task-3',
    title: 'Audit Hidden Scrollbar CSS',
    description: 'Verify all Tailwind classes use [&::-webkit-scrollbar]:hidden across components.',
    status: 'review',
    priority: 'Low',
    dueDate: '2026-04-05',
    tags: ['Tailwind', 'Polish']
  },
  {
    id: 'task-4',
    title: 'Build Morales Deep Work Hub',
    description: 'Pomodoro timer integration with daily streak heatmap and auto-session logger.',
    status: 'completed',
    priority: 'High',
    dueDate: '2026-04-01',
    tags: ['Productivity', 'Timer']
  }
];

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: 'border-slate-700 bg-slate-900/40 text-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300' },
  { id: 'review', title: 'Review', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
  { id: 'completed', title: 'Completed', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
] as const;

export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('backlog');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [tasks]);

  const handleOpenAddModal = (defaultStatus?: Task['status']) => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus(defaultStatus || 'backlog');
    setPriority('Medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setTagInput('General');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setTagInput(task.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? {
        ...t,
        title,
        description,
        status,
        priority,
        dueDate,
        tags: tags.length ? tags : ['General']
      } : t));
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        description,
        status,
        priority,
        dueDate,
        tags: tags.length ? tags : ['General']
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleMoveStatus = (id: string, direction: 'left' | 'right') => {
    const statusOrder: Task['status'][] = ['backlog', 'in-progress', 'review', 'completed'];
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const currentIndex = statusOrder.indexOf(task.status);
    const targetIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < statusOrder.length) {
      const newStatus = statusOrder[targetIndex];
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const getPriorityBadgeClass = (p: Task['priority']) => {
    switch (p) {
      case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Low': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Kanban Workflow Hub</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">Manage project pipelines, task priorities, and agile milestones seamlessly.</p>
        </div>
        <button
          onClick={() => handleOpenAddModal('backlog')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Task
        </button>
      </header>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 items-start">
        {COLUMNS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`bg-slate-900/60 border ${col.color.split(' ')[0]} rounded-2xl p-4 flex flex-col max-h-[calc(100vh-14rem)]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 font-semibold">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${col.color}`}>
                    {columnTasks.length}
                  </span>
                  <span className="text-slate-200">{col.title}</span>
                </div>
                <button
                  onClick={() => handleOpenAddModal(col.id as Task['status'])}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Add Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task Cards Container (Hidden Scrollbar) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
                    No tasks in {col.title}
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-sm hover:shadow-md group flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-slate-200 leading-snug">{task.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border uppercase tracking-wider font-bold ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      )}

                      {/* Tags & Due Date */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="flex items-center gap-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5 text-indigo-400" /> {tag}
                          </span>
                        ))}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            <Clock className="w-2.5 h-2.5 text-amber-400" /> {task.dueDate}
                          </span>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveStatus(task.id, 'left')}
                            disabled={col.id === 'backlog'}
                            className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-25 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStatus(task.id, 'right')}
                            disabled={col.id === 'completed'}
                            className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-25 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                            title="Move Right"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-1 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Update analytics graphs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed context or requirements..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none [&::-webkit-scrollbar]:hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Column / Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Task['status'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Task['priority'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="React, UI, API"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;