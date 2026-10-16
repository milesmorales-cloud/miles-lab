import React, { useState } from 'react';
import { CloudSun, Search, Wind, Droplets, Thermometer, AlertCircle, Loader2, Compass } from 'lucide-react';

interface WeatherInfo {
  city: string;
  country: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
}

export default function WeatherApp() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map Open-Meteo weather codes to friendly descriptions & icons
  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return { text: 'Clear Sky', icon: '☀️' };
      case 1:
      case 2:
      case 3: return { text: 'Partly Cloudy', icon: '⛅' };
      case 45:
      case 48: return { text: 'Foggy', icon: '🌫️' };
      case 51:
      case 53:
      case 55: return { text: 'Drizzle', icon: '🌧️' };
      case 61:
      case 63:
      case 65: return { text: 'Rain', icon: '🌧️' };
      case 71:
      case 73:
      case 75: return { text: 'Snow', icon: '❄️' };
      case 95:
      case 96:
      case 99: return { text: 'Thunderstorm', icon: '⚡' };
      default: return { text: 'Fair', icon: '🌤️' };
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      // Step 1: Get latitude and longitude for the city name
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please check the spelling.');
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Fetch current weather using coordinates
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
      const weatherData = await weatherRes.json();

      setWeather({
        city: name,
        country: country || '',
        temperature: weatherData.current.temperature_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        humidity: weatherData.current.relative_humidity_2m,
        weatherCode: weatherData.current.weather_code,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong fetching the weather.');
      }
    } finally {
      setLoading(false);
    }
  };

  const weatherDetails = weather ? getWeatherDescription(weather.weatherCode) : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/50 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-indigo-400" /> 04. Weather App
          </h2>
          <span className="text-xs text-indigo-300 font-mono bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-900/50">
            Open-Meteo API
          </span>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearch} className="p-4 bg-slate-950/30 border-b border-slate-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city (e.g. Tokyo, London)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-medium placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </form>

        {/* Display Area */}
        <div className="p-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!weather && !loading && !error && (
            <div className="h-48 flex flex-col items-center justify-center text-slate-600 text-sm gap-2">
              <Compass className="w-6 h-6 text-slate-700 animate-pulse" />
              <span>Enter a city name above to check the weather</span>
            </div>
          )}

          {loading && (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Fetching live weather data...</span>
            </div>
          )}

          {weather && weatherDetails && (
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="text-6xl mb-2">{weatherDetails.icon}</div>
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
                {weather.city}, {weather.country}
              </h3>
              <p className="text-sm text-indigo-400 font-medium mb-6">{weatherDetails.text}</p>

              {/* Main Temp */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 w-full mb-6 flex items-center justify-center gap-3 shadow-inner">
                <Thermometer className="w-8 h-8 text-cyan-400" />
                <span className="text-5xl font-black font-mono tracking-tighter text-white">
                  {Math.round(weather.temperature)}°C
                </span>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <div className="text-xs text-slate-500">Humidity</div>
                    <div className="text-sm font-bold font-mono">{weather.humidity}%</div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
                  <Wind className="w-5 h-5 text-indigo-400" />
                  <div className="text-left">
                    <div className="text-xs text-slate-500">Wind Speed</div>
                    <div className="text-sm font-bold font-mono">{weather.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
          <span>Async / Await & JSON</span>
          <span className="font-mono">REST API Integration</span>
        </div>

      </div>
    </div>
  );
}