import { useState, useEffect } from 'react';

interface Palette {
  id: string;
  name: string;
  colors: string[];
  timestamp: string;
}

export default function ColorGenerator() {
  const [colors, setColors] = useState<string[]>([
    '#0f172a', // slate-900
    '#1e293b', // slate-800
    '#6366f1', // indigo-500
    '#10b981', // emerald-500
    '#f43f5e'  // rose-500
  ]);
  
  const [paletteName, setPaletteName] = useState<string>('Miles Slate Synth');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const [savedPalettes, setSavedPalettes] = useState<Palette[]>(() => {
    const saved = localStorage.getItem('miles_lab_saved_palettes');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist saved palettes
  useEffect(() => {
    localStorage.setItem('miles_lab_saved_palettes', JSON.stringify(savedPalettes));
  }, [savedPalettes]);

  // Generate random hex color
  const getRandomHex = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate a brand new cohesive random palette of 5 colors
  const handleGenerateRandom = () => {
    const newColors = [
      getRandomHex(),
      getRandomHex(),
      getRandomHex(),
      getRandomHex(),
      getRandomHex()
    ];
    setColors(newColors);
    setPaletteName(`Palette #${Math.floor(Math.random() * 899 + 100)}`);
  };

  // Copy code to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Update specific color in current palette
  const handleColorChange = (index: number, newColor: string) => {
    const updated = [...colors];
    updated[index] = newColor;
    setColors(updated);
  };

  // Save current palette to local storage
  const handleSavePalette = () => {
    const newPalette: Palette = {
      id: Date.now().toString(),
      name: paletteName || 'Custom Palette',
      colors,
      timestamp: new Date().toLocaleDateString()
    };
    setSavedPalettes([newPalette, ...savedPalettes]);
  };

  // Helper to calculate relative luminance / text contrast color (black or white)
  const getContrastText = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16) || 0;
    const g = parseInt(hexColor.slice(3, 5), 16) || 0;
    const b = parseInt(hexColor.slice(5, 7), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness >= 128 ? '#0f172a' : '#f8fafc';
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
            🎨 Color Generator & Palette Studio
          </h1>
          <p className="text-slate-400 text-sm">
            Generate custom color schemes, inspect hex/RGB codes, copy snippets, and persist your design tokens locally.
          </p>
        </div>
        <button 
          onClick={handleGenerateRandom}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          ⚡ Generate Random Palette
        </button>
      </div>

      {/* Palette Builder / Active Display */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input 
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-lg font-bold text-slate-100 focus:outline-none focus:border-indigo-500 w-full md:w-72"
            placeholder="Palette Name..."
          />
          <button 
            onClick={handleSavePalette}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-sm transition border border-slate-700 w-full md:w-auto"
          >
            💾 Save to Vault
          </button>
        </div>

        {/* Color Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {colors.map((hex, index) => {
            const textColor = getContrastText(hex);
            return (
              <div 
                key={index}
                className="h-64 rounded-2xl p-4 flex flex-col justify-between shadow-xl border border-white/10 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: hex, color: textColor }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-black/20 backdrop-blur-md uppercase tracking-wider">
                    Stop {index + 1}
                  </span>
                  <input 
                    type="color" 
                    value={hex}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    title="Pick Color"
                  />
                </div>

                <div className="space-y-2">
                  <div className="font-mono font-extrabold text-lg tracking-wide uppercase">
                    {hex}
                  </div>
                  <button 
                    onClick={() => handleCopy(hex)}
                    className="w-full py-2 rounded-xl bg-black/30 hover:bg-black/50 backdrop-blur-md text-xs font-semibold transition border border-white/20"
                  >
                    {copiedHex === hex ? 'Copied!' : 'Copy Hex'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved Palettes Vault */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Saved Palettes Vault</h2>
          {savedPalettes.length > 0 && (
            <button 
              onClick={() => setSavedPalettes([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {savedPalettes.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No saved palettes yet. Customize or generate a palette and click "Save to Vault".</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPalettes.map(palette => (
              <div key={palette.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-200">{palette.name}</h3>
                  <span className="text-[10px] text-slate-500">{palette.timestamp}</span>
                </div>
                
                {/* Mini Color Swatches */}
                <div className="flex h-10 rounded-lg overflow-hidden border border-slate-800 mb-3">
                  {palette.colors.map((c, i) => (
                    <div 
                      key={i} 
                      className="flex-1 cursor-pointer transition hover:opacity-90" 
                      style={{ backgroundColor: c }}
                      onClick={() => handleCopy(c)}
                      title={`Click to copy ${c}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => setColors(palette.colors)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs font-semibold py-2 rounded-lg border border-slate-800 transition"
                >
                  Load Palette
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}