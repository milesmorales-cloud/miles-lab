import { useState, useEffect } from 'react';

interface ConversionRecord {
  id: string;
  amount: number;
  from: string;
  to: string;
  result: number;
  rate: number;
  timestamp: string;
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'ZAR'];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number | ''>(100);
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('EUR');
  
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const [history, setHistory] = useState<ConversionRecord[]>(() => {
    const saved = localStorage.getItem('miles_lab_currency_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch live rates with fallback to localStorage
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      setRates({});
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurr}`);
        if (!res.ok) throw new Error(`Rate request failed: ${res.status}`);
        const data = await res.json();
        if (data?.result !== 'success' || !data.rates || typeof data.rates !== 'object') {
          throw new Error('Rate response was invalid');
        }
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
        localStorage.setItem(`miles_lab_rates_${fromCurr}`, JSON.stringify(data.rates));
      } catch {
        const cached = localStorage.getItem(`miles_lab_rates_${fromCurr}`);
        if (cached) {
          try {
            const cachedRates: unknown = JSON.parse(cached);
            if (cachedRates && typeof cachedRates === 'object' && !Array.isArray(cachedRates)) {
              setRates(cachedRates as Record<string, number>);
            }
          } catch {
            localStorage.removeItem(`miles_lab_rates_${fromCurr}`);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [fromCurr]);

  // Persist history
  useEffect(() => {
    localStorage.setItem('miles_lab_currency_history', JSON.stringify(history));
  }, [history]);

  const numericAmount = typeof amount === 'number' ? amount : 0;
  const currentRate = fromCurr === toCurr ? 1 : rates[toCurr] ?? 0;
  const convertedAmount = numericAmount * currentRate;

  const handleSwap = () => {
    setFromCurr(toCurr);
    setToCurr(fromCurr);
  };

  const handleSaveConversion = () => {
    const record: ConversionRecord = {
      id: Date.now().toString(),
      amount: numericAmount,
      from: fromCurr,
      to: toCurr,
      result: Number(convertedAmount.toFixed(4)),
      rate: Number(currentRate.toFixed(4)),
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHistory([record, ...history.slice(0, 19)]); // keep last 20
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
            💱 Project 17: Currency & Unit Converter
          </h1>
          <p className="text-slate-400 text-sm">
            Real-time global exchange rates with local caching, instant breakdown, and conversion history.
          </p>
        </div>
        {lastUpdated && (
          <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400">
            Rates updated: {lastUpdated}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Converter Card */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Convert Currencies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center mb-6">
              
              {/* Amount Input */}
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-400 mb-2">Amount</label>
                <input 
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* From Currency */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">From</label>
                <select 
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {Object.keys(rates).length > 0 ? (
                    Object.keys(rates).sort().map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))
                  ) : (
                    <option value={fromCurr}>{fromCurr}</option>
                  )}
                </select>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-2 flex justify-center pt-5">
                <button 
                  onClick={handleSwap}
                  className="bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white p-3 rounded-xl transition border border-slate-700 shadow-md"
                  title="Swap Currencies"
                >
                  ⇄ Swap
                </button>
              </div>

            </div>

            {/* To Currency Selection */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-slate-400 mb-2">Converted To ({toCurr})</label>
              <div className="flex gap-3">
                <select 
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {Object.keys(rates).length > 0 ? (
                    Object.keys(rates).sort().map(curr => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))
                  ) : (
                    <option value={toCurr}>{toCurr}</option>
                  )}
                </select>

                <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-indigo-400">
                    {loading ? 'Calculating...' : currentRate === 0 ? 'Rate unavailable' : convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-sm font-bold text-slate-400">{toCurr}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Exchange Rate: {currentRate === 0 ? 'Unavailable' : `1 ${fromCurr} = ${currentRate.toFixed(4)} ${toCurr}`}
            </span>
            <button 
              onClick={handleSaveConversion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
            >
              Save to History
            </button>
          </div>
        </div>

        {/* Quick Multi-Currency Grid */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex flex-col">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Quick Breakdown</h2>
          <div className="flex-1 overflow-y-auto space-y-3 [&::-webkit-scrollbar]:hidden">
            {POPULAR_CURRENCIES.map(curr => {
              if (curr === fromCurr) return null;
              const val = numericAmount * (rates[curr] ?? 0);
              return (
                <div key={curr} className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-300">{curr}</span>
                  <span className="text-sm font-semibold text-indigo-300">
                    {rates[curr] === undefined ? 'Unavailable' : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Conversion History Section */}
      <div className="mt-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Recent Calculations</h2>
          {history.length > 0 && (
            <button 
              onClick={() => setHistory([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No saved calculations yet. Click "Save to History" above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {history.map(item => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-indigo-400">{item.amount} {item.from}</span>
                  <span className="text-xs text-slate-500">{item.timestamp}</span>
                </div>
                <div className="text-sm font-extrabold text-slate-100">
                  = {item.result} {item.to}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}