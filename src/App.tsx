import { useState } from 'react';
import { 
  Calculator, 
  Clock, 
  CheckSquare, 
  CloudSun, 
  Lock, 
  Wallet,
  HelpCircle, 
  ShoppingBag, 
  LayoutDashboard, 
  ChevronLeft,
  ChevronRight, 
  FolderGit2, 
  Sparkles, 
  Timer,
  FileText,
  Utensils,
  Columns,
  Calendar,
  MessageSquare
} from 'lucide-react';

// Import your project components
import CalculatorApp from './projects/01-calculator/Calculator';
import DigitalClock from './projects/02-digital-clock/DigitalClock';
import TodoList from './projects/03-todo-list/TodoList';
import WeatherApp from './projects/04-weather-app/WeatherApp';
import LoginForm from './projects/05-login-form/LoginForm';
import QuizApp from './projects/06-quiz-app/QuizApp';
import PomodoroApp from './projects/07-pomodoro/PomodoroApp';
import ExpenseTracker from './projects/08-expense-tracker/ExpenseTracker';
import MarkdownPreviewer from './projects/09-markdown-previewer/MarkdownPreviewer';
import NotesVault from './projects/10-notes-vault/NotesVault';
import ShoppingCart from './projects/13-shopping-cart/ShoppingCart';
import RecipePlanner from './projects/11-recipe-planner/RecipePlanner';
import HabitTracker from './projects/12-habit-tracker/HabitTracker';
import KanbanBoard from './projects/14-kanban-board/KanbanBoard';
import BookingCalendar from './projects/15-booking-calendar/BookingCalendar';
import ChatHub from './projects/16-chat-hub/ChatHub';

interface ProjectItem {
  id: string;
  number: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export default function App() {
  const [activeId, setActiveId] = useState('hub');
  const [isExpanded, setIsExpanded] = useState(true);

  const PROJECTS: ProjectItem[] = [
    { id: 'hub', number: '00', title: 'Dashboard Overview', category: 'Home', icon: LayoutDashboard, component: () => <HubOverview onSelect={setActiveId} /> },
    { id: 'calculator', number: '01', title: 'Calculator', category: 'Utility', icon: Calculator, component: CalculatorApp },
    { id: 'clock', number: '02', title: 'Digital Clock', category: 'Utility', icon: Clock, component: DigitalClock },
    { id: 'todo', number: '03', title: 'To-Do List (DnD)', category: 'Productivity', icon: CheckSquare, component: TodoList },
    { id: 'weather', number: '04', title: 'Weather App', category: 'API Integration', icon: CloudSun, component: WeatherApp },
    { id: 'auth', number: '05', title: 'Auth & RBAC Gateway', category: 'Security', icon: Lock, component: LoginForm },
    { id: 'quiz', number: '06', title: 'Quiz LMS Portal', category: 'Education', icon: HelpCircle, component: QuizApp },
    { id: 'pomodoro', number: '07', title: 'Pomodoro Focus Timer', category: 'Productivity', icon: Timer, component: PomodoroApp },
    { id: 'expenses', number: '08', title: 'Expense Tracker', category: 'Finance', icon: Wallet, component: ExpenseTracker },
    { id: 'markdown', number: '09', title: 'Markdown Previewer', category: 'Productivity', icon: FileText, component: MarkdownPreviewer },
    { id: 'notes', number: '10', title: 'Notes Vault', category: 'Productivity', icon: FileText, component: NotesVault },
    { id: 'recipe', number: '11', title: 'Recipe Planner', category: 'Food & Drink', icon: Utensils, component: RecipePlanner },
    { id: 'habit', number: '12', title: 'Habit Tracker', category: 'Productivity', icon: CheckSquare, component: HabitTracker },
    { id: 'shop', number: '13', title: 'Supermarket Hub', category: 'E-Commerce', icon: ShoppingBag, component: ShoppingCart },
    { id: 'kanban', number: '14', title: 'Kanban Board', category: 'Productivity', icon: Columns, component: KanbanBoard },
    { id: 'booking', number: '15', title: 'Booking Calendar', category: 'Productivity', icon: Calendar, component: BookingCalendar },
    { id: 'chat', number: '16', title: 'Chat Hub', category: 'Communication', icon: LayoutDashboard, component: ChatHub },
  ];

  const activeProject = PROJECTS.find(p => p.id === activeId) || PROJECTS[0];
  const ActiveComponent = activeProject.component;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className={`w-full ${isExpanded ? 'md:w-64' : 'md:w-20'} bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0 transition-[width] duration-300 ease-in-out`}>
        <div>
          {/* Logo / Header */}
          <div className={`border-b border-slate-800 flex items-center justify-between ${isExpanded ? 'p-6' : 'p-4'}`}>
            <div className={`flex items-center ${isExpanded ? 'gap-3' : ''}`}>
            <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            {isExpanded && <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Miles Lab ⚡
              </h1>
              <p className="text-[11px] text-slate-400">React Monorepo (7/25)</p>
            </div>}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(expanded => !expanded)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Project navigation" tabIndex={0} className={`space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto scroll-smooth no-scrollbar ${isExpanded ? 'p-4' : 'p-3'}`}>
            {PROJECTS.map(project => {
              const IconComponent = project.icon;
              const isActive = activeId === project.id;

              return (
                <button
                  key={project.id}
                  onClick={() => setActiveId(project.id)}
                  aria-label={`${project.number}. ${project.title}, ${project.category}`}
                  title={!isExpanded ? `${project.number}. ${project.title} · ${project.category}` : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${isExpanded ? 'justify-between px-3.5 py-2.5' : 'justify-center flex-col gap-1.5 px-2 py-2.5'} ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className={`flex items-center ${isExpanded ? 'gap-3 min-w-0' : 'flex-col gap-1'}`}>
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span className={`font-mono text-[10px] opacity-75 ${isExpanded ? 'hidden' : ''}`}>
                      {project.number}
                    </span>
                    {isExpanded && <span className="text-left min-w-0">
                      <span className="block truncate"><span className="font-mono text-[10px] opacity-75 mr-1.5">{project.number}.</span>{project.title}</span>
                      <span className="block text-[10px] text-slate-400/80 mt-0.5">{project.category}</span>
                    </span>}
                  </div>
                  {isActive && isExpanded && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={`border-t border-slate-800 text-center text-[11px] text-slate-500 ${isExpanded ? 'p-4' : 'p-3'}`}>
          {isExpanded && <>React • TypeScript • Vite • Tailwind</>}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="px-6 py-4 bg-slate-900/50 border-b border-slate-800/80 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-900 rounded-md">
              Project {activeProject.number}
            </span>
            <h2 className="text-sm font-bold text-slate-200">{activeProject.title}</h2>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Active Workspace
          </span>
        </header>

        <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
          <ActiveComponent />
        </div>
      </main>

    </div>
  );
}

// Hub Overview Component (Dashboard Home)
function HubOverview({ onSelect }: { onSelect: (id: string) => void }) {
  const categories = [
    { id: 'calculator', number: '01', title: 'Calculator', category: 'Utility', icon: Calculator },
    { id: 'clock', number: '02', title: 'Digital Clock', category: 'Utility', icon: Clock },
    { id: 'todo', number: '03', title: 'To-Do List (DnD)', category: 'Productivity', icon: CheckSquare },
    { id: 'weather', number: '04', title: 'Weather App', category: 'API Integration', icon: CloudSun },
    { id: 'auth', number: '05', title: 'Auth & RBAC Gateway', category: 'Security', icon: Lock },
    { id: 'quiz', number: '06', title: 'Quiz LMS Portal', category: 'Education', icon: HelpCircle },
    { id: 'pomodoro', number: '07', title: 'Pomodoro Focus Timer', category: 'Productivity', icon: Timer },
    { id: 'expenses', number: '08', title: 'Expense Tracker', category: 'Finance', icon: Wallet },
    { id: 'markdown', number: '09', title: 'Markdown Previewer', category: 'Productivity', icon: FileText },
    { id: 'notes', number: '10', title: 'Notes Vault', category: 'Productivity', icon: FileText },
    { id: 'recipe', number: '11', title: 'Recipe Planner', category: 'Food & Drink', icon: Utensils },
    { id: 'habit', number: '12', title: 'Habit Tracker', category: 'Productivity', icon: CheckSquare },
    { id: 'shop', number: '13', title: 'Supermarket Hub', category: 'E-Commerce', icon: ShoppingBag },
    { id: 'kanban', number: '14', title: 'Kanban Board', category: 'Productivity', icon: Columns },
    { id: 'booking', number: '15', title: 'Booking Calendar', category: 'Productivity', icon: Calendar },
    { id: 'chat', number: '16', title: 'Chat Hub', category: 'Communication', icon: MessageSquare },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full py-8">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-white mb-2">Welcome to Miles Lab Dashboard ⚡</h3>
        <p className="text-sm text-slate-400">
          Select any project below to launch its workspace, test state management, or manage administrative tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(project => {
          const IconComponent = project.icon;
          return (
            <button
              key={project.id}
              onClick={() => onSelect(project.id)}
              className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group flex flex-col justify-between cursor-pointer shadow-lg"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-bold">#{project.number}</span>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/40">
                  {project.category}
                </span>
                <h4 className="text-base font-bold text-white mt-2 mb-1 group-hover:text-indigo-300 transition-colors">
                  {project.title}
                </h4>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 group-hover:text-white">
                <span>Launch Workspace</span>
                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}