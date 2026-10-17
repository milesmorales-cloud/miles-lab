import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, PieChart, DollarSign, Tag, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food & Dining', 'Rent & Housing', 'Utilities', 'Transport', 'Entertainment', 'Shopping', 'Other']
};

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('miles_lab_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('miles_lab_expenses', JSON.stringify(transactions));
  }, [transactions]);

  // Update category options when type changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTx, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Category breakdown for expenses
  const expenseByCategory = CATEGORIES.expense.map(cat => {
    const total = transactions
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((acc, t) => acc + t.amount, 0);
    return { category: cat, total, percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0 };
  }).filter(item => item.total > 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-400" /> 08. Expense Tracker & Budget Visualizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage cash flow, categorize spending, and track your net balance.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-xs text-slate-400">Total Transactions:</span>
          <span className="text-xs font-mono font-bold text-indigo-400">{transactions.length}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balance</span>
            <DollarSign className="w-5 h-5 text-indigo-400" />
          </div>
          <div className={`text-3xl font-black font-mono mt-3 ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Available funds</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Income</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono mt-3 text-emerald-400">
            +${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Inflows recorded</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono mt-3 text-rose-400">
            -${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Outflows recorded</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Transaction Form & Budget Visualizer */}
        <div className="space-y-6">
          
          {/* Add Form */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> New Transaction
            </h3>
            
            <form onSubmit={addTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Monthly Salary, Client payment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES[type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                Add Transaction
              </button>
            </form>
          </div>

          {/* Budget Visualizer Bars */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" /> Spending Breakdown
            </h3>
            
            {expenseByCategory.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No expenses recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {expenseByCategory.map(item => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.category}</span>
                      <span className="font-mono text-slate-400">${item.total.toFixed(2)} ({item.percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Transactions History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Transaction History
          </h3>

          <div className="flex-1 overflow-y-auto max-h-125 space-y-2.5 pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No transactions found. Switch to Income and add your earnings to get started!
              </div>
            ) : (
              transactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      t.type === 'income' 
                        ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' 
                        : 'bg-rose-950/40 border-rose-900/50 text-rose-400'
                    }`}>
                      {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{t.description}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-indigo-400" /> {t.category}
                        </span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500 font-mono">{t.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-mono font-bold ${
                      t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}