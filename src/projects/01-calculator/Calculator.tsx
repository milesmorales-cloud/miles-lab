import { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle number and decimal clicks
  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle operators (+, -, *, /)
  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  // Calculate result
  const calculate = () => {
    try {
      const fullExpression = equation + display;
      const result = String(new Function(`return ${fullExpression}`)());
      
      setHistory([`${fullExpression} = ${result}`, ...history.slice(0, 4)]);
      setDisplay(result);
      setEquation('');
    } catch {
      setDisplay('Error');
      setEquation('');
    }
  };

  // Clear states
  const clearAll = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white">
        
        {/* Header / History Toggle */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">01. Calculator</h2>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-900/50"
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? 'Calculator' : 'History'}
          </button>
        </div>

        {!showHistory ? (
          /* Calculator Main View */
          <div className="p-6">
            {/* Screen */}
            <div className="bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800/80 text-right">
              <div className="text-xs text-slate-500 h-5 font-mono overflow-hidden">{equation}</div>
              <div className="text-3xl font-bold tracking-tight text-white font-mono truncate">{display}</div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-4 gap-3">
              <button onClick={clearAll} className="col-span-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Clear
              </button>
              <button onClick={deleteLast} className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-all flex items-center justify-center">
                <Delete className="w-4 h-4" />
              </button>
              <button onClick={() => handleOperator('/')} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">÷</button>

              <button onClick={() => handleNumber('7')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">7</button>
              <button onClick={() => handleNumber('8')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">8</button>
              <button onClick={() => handleNumber('9')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">9</button>
              <button onClick={() => handleOperator('*')} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">×</button>

              <button onClick={() => handleNumber('4')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">4</button>
              <button onClick={() => handleNumber('5')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">5</button>
              <button onClick={() => handleNumber('6')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">6</button>
              <button onClick={() => handleOperator('-')} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">-</button>

              <button onClick={() => handleNumber('1')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">1</button>
              <button onClick={() => handleNumber('2')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">2</button>
              <button onClick={() => handleNumber('3')} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">3</button>
              <button onClick={() => handleOperator('+')} className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all">+</button>

              <button onClick={() => handleNumber('0')} className="col-span-2 bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">0</button>
              <button onClick={handleDecimal} className="bg-slate-800/60 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold transition-all">.</button>
              <button onClick={calculate} className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all">=</button>
            </div>
          </div>
        ) : (
          /* History View */
          <div className="p-6 h-85 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Recent Calculations</h3>
            {history.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                No calculations yet
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <div key={index} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right font-mono text-indigo-300">
                    {item}
                  </div>
                ))}
              </div>
            )}
            <button 
              onClick={() => setHistory([])}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}