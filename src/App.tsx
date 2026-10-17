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
  ChevronRight, 
  FolderGit2, 
  Sparkles, 
  Timer
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
import ShoppingCart from './projects/13-shopping-cart/ShoppingCart';

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
    { id: 'shop', number: '13', title: 'Supermarket Hub', category: 'E-Commerce', icon: ShoppingBag, component: ShoppingCart },
  ];

  const activeProject = PROJECTS.find(p => p.id === activeId) || PROJECTS[0];
  const ActiveComponent = activeProject.component;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Miles Lab ⚡
              </h1>
              <p className="text-[11px] text-slate-400">React Monorepo (7/25)</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
            {PROJECTS.map(project => {
              const IconComponent = project.icon;
              const isActive = activeId === project.id;

              return (
                <button
                  key={project.id}
                  onClick={() => setActiveId(project.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span className="text-left">
                      <span className="font-mono text-[10px] opacity-75 mr-1.5">{project.number}.</span>
                      {project.title}
                    </span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          React • TypeScript • Vite • Tailwind
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
    { id: 'shop', number: '13', title: 'Supermarket Hub', category: 'E-Commerce', icon: ShoppingBag },
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